"""Extract plain text from PDF bytes for CV parsing."""

from __future__ import annotations


def pdf_bytes_to_text(data: bytes) -> str:
    import fitz

    doc = fitz.open(stream=data, filetype="pdf")
    try:
        parts: list[str] = []
        for page in doc:
            parts.append(page.get_text() or "")
        return "\n".join(parts).strip()
    finally:
        doc.close()
