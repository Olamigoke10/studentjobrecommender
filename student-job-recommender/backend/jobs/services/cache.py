from .adzuna import fetch_jobs
from jobs.models import Job

def cache_jobs(search="graduate", location="United Kingdom", results_per_page=20, page=1):
    data = fetch_jobs(search=search, location=location, results_per_page=results_per_page, page=page)
    
    results = data.get('results', [])
    cached_count = 0
    
    for item in results:
        external_id = str(item.get('id'))
        if not external_id:
            continue
        
        company =""
        if isinstance( item.get('company'), dict):
            company = item['company'].get('display_name', '') or ''
            
        location_name =""
        if isinstance( item.get('location'), dict):
            location_name = item['location'].get('display_name', '') or ''  
        
        obj, created = Job.objects.get_or_create(
            external_id=external_id,
            defaults={
                'source': 'adzuna',
                'title': (item.get('title', '') or '')[:200],
                'company': (company)[:200],
                'location': (location_name)[:200],
                'description': item.get('description', '') or '',
                'url': item.get('redirect_url', '') or '',
                'posted_date': item.get('created', None)[:10] if item.get('created') else None,
            }
            )
        cached_count += 1
        
    return{'cached_count': cached_count}



        