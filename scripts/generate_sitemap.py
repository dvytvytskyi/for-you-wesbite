import os, urllib.request, json, datetime, xml.sax.saxutils as sax
from pathlib import Path

headers = {
    'x-api-key': 'fyr_7084daf35cf6427f60e06bccd675f133b8a19ce4866cf941156bb4f38fba4016',
    'x-api-secret': '2e9e9a3a8080f207cf1c684baaeff40dcd4404c10f4d2207340bb48ee8ccdccda3f4e2fde5bd74ba4d8f463e361c45c9437206a97abb772415263e3a69655a73',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Accept': 'application/json',
}
base = 'https://foryou-realestate.com'

os.makedirs('public', exist_ok=True)


def fetch_json(path):
    req = urllib.request.Request('https://admin.foryou-realestate.com/api' + path, headers=headers)
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read().decode())


areas_resp = fetch_json('/public/areas?limit=200')
areas = areas_resp['data']['data'] if isinstance(areas_resp['data'], dict) else areas_resp['data']
news_resp = fetch_json('/public/news?page=1&limit=100')
news = news_resp['data']['data'] if isinstance(news_resp['data'], dict) else news_resp['data']
properties = []
page = 1
limit = 4000
while True:
    resp = fetch_json(f'/public/properties?page={page}&limit={limit}')
    data = resp['data']
    props = data['data'] if isinstance(data, dict) else data
    properties.extend(props)
    total_pages = data.get('pagination', {}).get('totalPages') if isinstance(data, dict) else None
    if total_pages is None or page >= total_pages:
        break
    page += 1

print('area', len(areas), 'news', len(news), 'props', len(properties))


def fmtdate(dt):
    if not dt:
        return None
    try:
        d = datetime.datetime.fromisoformat(dt.replace('Z', '+00:00'))
        return d.date().isoformat()
    except Exception:
        try:
            return datetime.date.fromisoformat(dt[:10]).isoformat()
        except Exception:
            return None


def make_url(loc, lastmod=None, changefreq=None, priority=None):
    el = '  <url>\n'
    el += f'    <loc>{sax.escape(loc)}</loc>\n'
    if lastmod:
        el += f'    <lastmod>{lastmod}</lastmod>\n'
    if changefreq:
        el += f'    <changefreq>{changefreq}</changefreq>\n'
    if priority is not None:
        el += f'    <priority>{priority:.1f}</priority>\n'
    el += '  </url>\n'
    return el


def with_locale(path, locale):
    # EN URLs are canonical without /en in this project.
    return f'{base}{path}' if locale == 'en' else f'{base}/ru{path}'

static_routes = ['', '/properties', '/map', '/areas', '/developers', '/about', '/news']
locales = ['en', 'ru']
main_urls = []
for route in static_routes:
    for locale in locales:
        main_urls.append(make_url(with_locale(route, locale), datetime.date.today().isoformat(), 'daily', 1.0))
for area in areas:
    slug = area.get('slug')
    if slug:
        for locale in locales:
            main_urls.append(make_url(with_locale(f'/areas/{slug}', locale), datetime.date.today().isoformat(), 'weekly', 0.8))

projects_urls = []
for prop in properties:
    slug = prop.get('slug')
    if not slug:
        continue
    area = prop.get('area')
    areaSlug = area.get('slug') if isinstance(area, dict) else area or 'dubai'
    if not areaSlug:
        areaSlug = 'dubai'
    lastmod = fmtdate(prop.get('updatedAt') or prop.get('updated_at') or prop.get('createdAt') or prop.get('created_at')) or datetime.date.today().isoformat()
    for locale in locales:
        projects_urls.append(make_url(with_locale(f'/properties/{slug}', locale), lastmod, 'daily', 0.9))

news_urls = []
for item in news:
    slug = item.get('slug')
    if not slug:
        continue
    lastmod = fmtdate(item.get('updatedAt') or item.get('publishedAt') or item.get('createdAt') or item.get('created_at')) or datetime.date.today().isoformat()
    for locale in locales:
        news_urls.append(make_url(with_locale(f'/news/{slug}', locale), lastmod, 'weekly', 0.5))


def write_sitemap(path, urls):
    with open(path, 'w', encoding='utf-8') as f:
        f.write('<?xml version="1.0" encoding="UTF-8"?>\n')
        f.write('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n')
        f.writelines(urls)
        f.write('</urlset>\n')
    print('wrote', path, len(urls))

write_sitemap('public/sitemap-main.xml', main_urls)
max_urls = 50000
project_files = []
for idx in range(0, len(projects_urls), max_urls):
    chunk = projects_urls[idx:idx + max_urls]
    file_name = f'public/sitemap-projects-{len(project_files) + 1}.xml'
    write_sitemap(file_name, chunk)
    project_files.append(file_name)
write_sitemap('public/sitemap-news.xml', news_urls)

# Remove units sitemap because it only contained non-canonical landing URLs.
units_path = 'public/sitemap-units.xml'
if os.path.exists(units_path):
    os.remove(units_path)
    print('removed stale', units_path)

# Remove legacy combined project sitemap if it exists, to avoid stale invalid output.
legacy_path = 'public/sitemap-projects.xml'
if os.path.exists(legacy_path):
    os.remove(legacy_path)
    print('removed stale', legacy_path)

index = '<?xml version="1.0" encoding="UTF-8"?>\n'
index += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
for name in ['sitemap-main.xml'] + [Path(p).name for p in project_files] + ['sitemap-news.xml']:
    index += '  <sitemap>\n'
    index += f'    <loc>{base}/{name}</loc>\n'
    index += f'    <lastmod>{datetime.date.today().isoformat()}</lastmod>\n'
    index += '  </sitemap>\n'
index += '</sitemapindex>\n'
with open('public/sitemap.xml', 'w', encoding='utf-8') as f:
    f.write(index)
print('wrote public/sitemap.xml index')
