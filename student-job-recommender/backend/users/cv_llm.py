"""
Env-driven LLM calls for CV features (summary + PDF parse extraction).

Environment:
  CV_AI_PROVIDER — openai (default) | anthropic | gemini
  CV_AI_MODEL — optional; defaults per provider
  OPENAI_API_KEY — OpenAI
  ANTHROPIC_API_KEY — Anthropic Claude
  GOOGLE_API_KEY or GEMINI_API_KEY — Google Gemini
"""
from __future__ import annotations

import json
import os
import re
from typing import Any

DEFAULT_MODELS = {
    "openai": "gpt-4o-mini",
    "anthropic": "claude-3-5-haiku-20241022",
    "gemini": "gemini-2.0-flash",
}


class LLMConfigError(Exception):
    """Missing API key or invalid provider."""


class LLMUpstreamError(Exception):
    """Provider returned an error or empty response."""


def _provider() -> str:
    p = (os.environ.get("CV_AI_PROVIDER") or "openai").strip().lower()
    if p not in ("openai", "anthropic", "gemini"):
        raise LLMConfigError(f"Invalid CV_AI_PROVIDER: {p!r}. Use openai, anthropic, or gemini.")
    return p


def _model_for(provider: str) -> str:
    override = (os.environ.get("CV_AI_MODEL") or "").strip()
    if override:
        return override
    return DEFAULT_MODELS[provider]


def _openai_key() -> str | None:
    return (os.environ.get("OPENAI_API_KEY") or "").strip() or None


def _anthropic_key() -> str | None:
    return (os.environ.get("ANTHROPIC_API_KEY") or "").strip() or None


def _google_key() -> str | None:
    return (
        (os.environ.get("GOOGLE_API_KEY") or "").strip()
        or (os.environ.get("GEMINI_API_KEY") or "").strip()
        or None
    )


def llm_config_status() -> dict[str, Any]:
    """Which provider is selected and whether the matching API key is set (no secret values)."""
    try:
        p = _provider()
    except LLMConfigError as e:
        return {"provider": None, "configured": False, "detail": str(e)}
    key_ok = False
    if p == "openai":
        key_ok = bool(_openai_key())
    elif p == "anthropic":
        key_ok = bool(_anthropic_key())
    else:
        key_ok = bool(_google_key())
    return {"provider": p, "model": _model_for(p), "configured": key_ok}


def _strip_json_fence(text: str) -> str:
    t = text.strip()
    m = re.match(r"^```(?:json)?\s*([\s\S]*?)\s*```$", t, re.IGNORECASE)
    if m:
        return m.group(1).strip()
    return t


def _openai_complete(prompt: str, max_tokens: int, json_mode: bool) -> str:
    from openai import OpenAI

    key = _openai_key()
    if not key:
        raise LLMConfigError("Add OPENAI_API_KEY for CV_AI_PROVIDER=openai.")
    client = OpenAI(api_key=key)
    model = _model_for("openai")
    kwargs: dict[str, Any] = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": max_tokens,
    }
    if json_mode:
        kwargs["response_format"] = {"type": "json_object"}
    response = client.chat.completions.create(**kwargs)
    content = (response.choices[0].message.content or "").strip()
    if not content:
        raise LLMUpstreamError("Empty response from OpenAI.")
    return content


def _anthropic_complete(prompt: str, max_tokens: int, json_mode: bool) -> str:
    import anthropic

    key = _anthropic_key()
    if not key:
        raise LLMConfigError("Add ANTHROPIC_API_KEY for CV_AI_PROVIDER=anthropic.")
    model = _model_for("anthropic")
    system = (
        "You are a helpful assistant. Respond with valid JSON only, no markdown or explanation."
        if json_mode
        else "You are a helpful assistant. Follow the user instructions exactly."
    )
    client = anthropic.Anthropic(api_key=key)
    msg = client.messages.create(
        model=model,
        max_tokens=max_tokens,
        system=system,
        messages=[{"role": "user", "content": prompt}],
    )
    parts = []
    for block in msg.content:
        if hasattr(block, "text"):
            parts.append(block.text)
    content = "".join(parts).strip()
    if not content:
        raise LLMUpstreamError("Empty response from Anthropic.")
    return _strip_json_fence(content) if json_mode else content


def _gemini_complete(prompt: str, max_tokens: int, json_mode: bool) -> str:
    import google.generativeai as genai
    from google.generativeai.types import GenerationConfig

    key = _google_key()
    if not key:
        raise LLMConfigError("Add GOOGLE_API_KEY or GEMINI_API_KEY for CV_AI_PROVIDER=gemini.")
    genai.configure(api_key=key)
    model_name = _model_for("gemini")
    model = genai.GenerativeModel(model_name)
    if json_mode:
        gen_cfg = GenerationConfig(
            max_output_tokens=max_tokens,
            response_mime_type="application/json",
        )
    else:
        gen_cfg = GenerationConfig(max_output_tokens=max_tokens)
    response = model.generate_content(prompt, generation_config=gen_cfg)
    try:
        content = (response.text or "").strip()
    except Exception:
        content = ""
    if not content:
        raise LLMUpstreamError("Empty response from Gemini.")
    return _strip_json_fence(content) if json_mode else content


def generate_llm_text(prompt: str, max_tokens: int, json_mode: bool = False) -> str:
    provider = _provider()
    if provider == "openai":
        return _openai_complete(prompt, max_tokens, json_mode=json_mode)
    if provider == "anthropic":
        return _anthropic_complete(prompt, max_tokens, json_mode=json_mode)
    return _gemini_complete(prompt, max_tokens, json_mode=json_mode)


def generate_cv_summary_text(
    *,
    context: str,
    job_context: str,
    current_summary: str,
) -> str:
    prompt = (
        "You are a professional CV writer for students and graduates. "
        "Based on the following CV information, write a short professional summary (2–4 sentences) "
        "suitable for a CV. Be concise, positive, and focus on strengths and goals. "
        "Write only the summary, no headings or labels."
    )
    if job_context:
        prompt += (
            " Tailor the summary towards the following target job, but keep it reusable for similar roles."
        )
    prompt += f"\n\nCV information:\n{context}{job_context}\n"
    if current_summary:
        prompt += f"\nCurrent summary (they can keep or replace): {current_summary}\n"
    text = generate_llm_text(prompt, max_tokens=200, json_mode=False)
    return text.strip()


CV_PARSE_JSON_INSTRUCTIONS = """
Extract structured CV data from the resume text below.
Return a single JSON object with exactly these keys:
- "summary": string, a short professional summary if present in the document, else "".
- "education": array of objects with keys institution, degree, subject, start_date, end_date, description (all strings; use "" if unknown).
- "experience": array of objects with keys company, role, start_date, end_date, description (all strings; use "" if unknown).
Order education and experience as they appear in the document (most recent first if the document uses that order).
Do not include keys other than summary, education, and experience. Do not wrap in markdown.
"""


def parse_cv_document_text(resume_text: str) -> dict[str, Any]:
    """Use the configured LLM to map free-text resume content to our CV JSON shape."""
    truncated = resume_text.strip()
    if len(truncated) > 14000:
        truncated = truncated[:14000] + "\n\n[... text truncated ...]"
    prompt = CV_PARSE_JSON_INSTRUCTIONS + "\n\nResume text:\n" + truncated
    raw = generate_llm_text(prompt, max_tokens=4096, json_mode=True)
    try:
        data = json.loads(raw)
    except json.JSONDecodeError as e:
        raise LLMUpstreamError(f"Could not parse model output as JSON: {e}") from e
    if not isinstance(data, dict):
        raise LLMUpstreamError("Model returned non-object JSON.")
    return data


def normalize_parsed_cv(data: dict[str, Any]) -> dict[str, list | str]:
    """Coerce LLM output into serializers-friendly education/experience/summary."""

    def norm_edu(item: Any) -> dict[str, str]:
        if not isinstance(item, dict):
            return {
                "institution": "",
                "degree": "",
                "subject": "",
                "start_date": "",
                "end_date": "",
                "description": "",
            }
        return {
            "institution": str(item.get("institution") or "").strip()[:200],
            "degree": str(item.get("degree") or "").strip()[:100],
            "subject": str(item.get("subject") or "").strip()[:200],
            "start_date": str(item.get("start_date") or "").strip()[:50],
            "end_date": str(item.get("end_date") or "").strip()[:50],
            "description": str(item.get("description") or "").strip(),
        }

    def norm_exp(item: Any) -> dict[str, str]:
        if not isinstance(item, dict):
            return {
                "company": "",
                "role": "",
                "start_date": "",
                "end_date": "",
                "description": "",
            }
        return {
            "company": str(item.get("company") or "").strip()[:200],
            "role": str(item.get("role") or "").strip()[:200],
            "start_date": str(item.get("start_date") or "").strip()[:50],
            "end_date": str(item.get("end_date") or "").strip()[:50],
            "description": str(item.get("description") or "").strip(),
        }

    summary = str(data.get("summary") or "").strip()
    edu_raw = data.get("education")
    exp_raw = data.get("experience")
    education = [norm_edu(x) for x in edu_raw] if isinstance(edu_raw, list) else []
    experience = [norm_exp(x) for x in exp_raw] if isinstance(exp_raw, list) else []
    education = [e for e in education if any(e.values())]
    experience = [x for x in experience if any(x.values())]
    return {"summary": summary, "education": education, "experience": experience}
