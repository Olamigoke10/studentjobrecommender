import requests
from decouple import config
from datetime import datetime

from django.db import transaction
from django.utils.dateparse import parse_datetime

from jobs.models import Job

BASE_URL = "https://api.adzuna.com/v1/api/jobs/{country}/search/{page}"


def _get_adzuna_keys():
    """
    Read keys at runtime (not import time) so deploy/build doesn't crash
    if env vars are missing.
    """
    app_id = config("ADZUNA_APP_ID", default="")
    app_key = config("ADZUNA_APP_KEY", default="")
    country = config("ADZUNA_COUNTRY", default="gb")

    if not app_id or not app_key:
        return None, None, country
    return app_id, app_key, country


def fetch_jobs(search="graduate", location="United Kingdom", results_per_page=50, page=1):
    app_id, app_key, country = _get_adzuna_keys()

    if not app_id or not app_key:
        return None, {
            "error": "Adzuna API keys are not configured on the server.",
            "hint": "Set ADZUNA_APP_ID and ADZUNA_APP_KEY in Render Environment Variables.",
        }

    url = BASE_URL.format(country=country, page=page)

    params = {
        "app_id": app_id,
        "app_key": app_key,
        "what": search,
        "where": location,
        "results_per_page": results_per_page,
    }

    try:
        r = requests.get(url, params=params, timeout=20)
        r.raise_for_status()
        return r.json(), None

    except requests.exceptions.HTTPError:
        return None, {
            "error": "HTTP error occurred while fetching jobs from Adzuna.",
            "status_code": r.status_code,
            # NOTE: avoid returning r.text in production if it may contain sensitive info
        }

    except requests.exceptions.RequestException as e:
        return None, {
            "error": "Network error occurred while fetching jobs from Adzuna.",
            "details": str(e),
        }


def clean_job(j: dict) -> dict:
    return {
        "external_id": str(j.get("id", "")).strip(),
        "title": j.get("title", ""),
        "company": (j.get("company") or {}).get("display_name", ""),
        "location": (j.get("location") or {}).get("display_name", ""),
        "description": j.get("description", ""),
        "created": j.get("created"),
        "redirect_url": j.get("redirect_url", ""),
        "salary_min": j.get("salary_min"),
        "salary_max": j.get("salary_max"),
        "contract_time": j.get("contract_time"),
        "contract_type": j.get("contract_type"),
        "category": (j.get("category") or {}).get("label", ""),
    }


def _parse_posted_date(created_str: str):
    if not created_str:
        return None

    dt = parse_datetime(created_str)
    if dt is None:
        try:
            dt = datetime.fromisoformat(created_str.replace("Z", "+00:00"))
        except Exception:
            return None

    return dt.date()


@transaction.atomic
def upsert_jobs_from_adzuna(results: list[dict], source: str = "adzuna"):
    saved_jobs = []
    created_count = 0
    updated_count = 0

    for j in results:
        external_id = str(j.get("id", "")).strip()
        if not external_id:
            continue

        defaults = {
            "source": source,
            "title": (j.get("title") or "")[:200],
            "company": ((j.get("company") or {}).get("display_name") or "")[:200],
            "location": ((j.get("location") or {}).get("display_name") or "")[:200],
            "description": j.get("description") or "",
            "job_type": ((j.get("contract_time") or j.get("contract_type") or "")[:50]),
            "url": (j.get("redirect_url") or ""),
            "posted_date": _parse_posted_date(j.get("created")),
        }

        obj, created = Job.objects.update_or_create(
            external_id=external_id,
            defaults=defaults,
        )

        saved_jobs.append(obj)
        created_count += 1 if created else 0
        updated_count += 0 if created else 1

    return saved_jobs, created_count, updated_count
