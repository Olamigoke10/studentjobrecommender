import requests
from decouple import config
from datetime import datetime

from django.db import transaction
from django.utils.dateparse import parse_datetime

from jobs.models import Job


ADZUNA_APP_ID = config("ADZUNA_APP_ID")
ADZUNA_APP_KEY = config("ADZUNA_APP_KEY")

BASE_URL = "https://api.adzuna.com/v1/api/jobs/{country}/search/{page}"


def fetch_jobs(search="graduate", location="United Kingdom", results_per_page=50, page=1):
    url = BASE_URL.format(country="gb", page=page)

    params = {
        "app_id": ADZUNA_APP_ID,
        "app_key": ADZUNA_APP_KEY,
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
            "response": r.text,
            "url": r.url,   # shows full final URL with params
        }

    except requests.exceptions.RequestException as e:
        return None, {
            "error": "Network error occurred while fetching jobs from Adzuna.",
            "details": str(e),
        }


def clean_job(j: dict) -> dict:
    """Pure function: takes raw Adzuna job dict and returns a cleaned dict."""
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
    """Adzuna created string -> python date (for your DateField)."""
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
    """
    Creates/updates Job rows using external_id to avoid duplicates.
    Returns (saved_jobs, created_count, updated_count)
    """
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
        if created:
            created_count += 1
        else:
            updated_count += 1

    return saved_jobs, created_count, updated_count
