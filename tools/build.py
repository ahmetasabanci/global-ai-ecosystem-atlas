from pathlib import Path
import base64, csv, hashlib, io, json, re, zipfile
root = Path(__file__).resolve().parents[1]
s = (root / 'src/atlas-template.html').read_text()

def embed(value):
    # Escape characters that could close the <script> element or break a JS string.
    text = json.dumps(value, ensure_ascii=False)
    return text.replace('<', '\\u003c').replace('>', '\\u003e').replace('&', '\\u0026').replace('\u2028', '\\u2028').replace('\u2029', '\\u2029')

# Derived data: the Turkish dataset and the CSV registers are generated from
# atlas-data.json and src/translations-tr.json, mirroring the in-page translator.
data = json.loads((root / 'atlas-data.json').read_text())
translations = json.loads((root / 'src/translations-tr.json').read_text())
pattern = re.compile(r'(?<!\w)(?:' + '|'.join(re.escape(k) for k in sorted(translations, key=len, reverse=True)) + r')(?!\w)')
KEEP = {'id', 'url', 'org', 'source', 'a', 'b', 'layers', 'sources', 'precision'}

def tr(text):
    stripped = text.strip()
    if stripped in translations:
        return text.replace(stripped, translations[stripped])
    return pattern.sub(lambda m: translations[m.group(0)], text)

def localize(value, key='', in_source=False):
    if isinstance(value, str):
        return value if key in KEEP or (in_source and key == 'title') else tr(value)
    if isinstance(value, list):
        return [localize(v, key, in_source) for v in value]
    if isinstance(value, dict):
        return {k: localize(v, k, in_source or key == 'sources') for k, v in value.items()}
    return value

data_tr = localize(data)
(root / 'atlas-data-tr.json').write_text(json.dumps(data_tr, ensure_ascii=False, indent=2))

def write_csv(path, columns, rows, encoding, joiner):
    buffer = io.StringIO()
    writer = csv.writer(buffer, lineterminator='\r\n')
    writer.writerow(columns)
    for row in rows:
        writer.writerow([joiner.join(row[c]) if isinstance(row[c], list) else row[c] for c in columns])
    (root / path).write_bytes(buffer.getvalue().encode(encoding))

ORG_COLUMNS = ['id', 'name', 'region', 'country', 'city', 'locationType', 'type', 'layers', 'description', 'operations', 'prompt', 'sources']
SOURCE_COLUMNS = ['id', 'title', 'url', 'claim', 'kind', 'published', 'checked', 'access']
for suffix, dataset, encoding, joiner in [('', data, 'utf-8', '; '), ('-tr', data_tr, 'utf-8-sig', ' | ')]:
    write_csv(f'organizations{suffix}.csv', ORG_COLUMNS, dataset['organizations'], encoding, joiner)
    write_csv(f'source-register{suffix}.csv', SOURCE_COLUMNS, dataset['sources'], encoding, joiner)

for marker, name in [('__ATLAS_DATA__', 'atlas-data.json'), ('__TRANSLATIONS__', 'src/translations-tr.json'), ('__LAND_PATHS__', 'src/map-paths.json')]:
    s = s.replace(marker, embed(json.loads((root / name).read_text())))

# Allow only the atlas's own inline script; everything else is embedded as data: URIs.
scripts = re.findall(r'<script>([\s\S]*?)</script>', s)
assert len(scripts) == 1, 'expected exactly one inline script'
digest = base64.b64encode(hashlib.sha256(scripts[0].encode()).digest()).decode()
csp = f"default-src 'none'; script-src 'sha256-{digest}'; style-src 'unsafe-inline'; font-src data:; img-src data:; base-uri 'none'; form-action 'none'"
s = s.replace('__CSP__', csp)

for name in ['index.html', 'global-ai-atlas.html']:
    (root / name).write_text(s)

# Offline package. Fixed timestamps and order keep the ZIP byte-identical when
# its contents are unchanged, so rebuilding does not add binary churn to git.
PACKAGE = ['BURADAN-BASLAYIN.md', 'Comfortaa-OFL.txt', 'FONT-NOTICES.md', 'LICENSE', 'LICENSE-CONTENT.md',
           'Montserrat-OFL.txt', 'START-HERE.md', 'atlas-data-tr.json', 'atlas-data.json',
           'global-ai-atlas-workshop-tr.pdf', 'global-ai-atlas-workshop.pdf', 'global-ai-atlas.html',
           'global-map-tr.png', 'global-map.png', 'organizations-tr.csv', 'organizations.csv',
           'source-register-tr.csv', 'source-register.csv', 'technology-map-tr.png', 'technology-map.png']
with zipfile.ZipFile(root / 'global-ai-ecosystem-atlas-october-2026.zip', 'w') as z:
    for name in PACKAGE:
        info = zipfile.ZipInfo(name, date_time=(2026, 10, 8, 0, 0, 0))
        info.compress_type = zipfile.ZIP_DEFLATED
        info.external_attr = 0o644 << 16
        z.writestr(info, (root / name).read_bytes(), compresslevel=9)
print('Built bilingual atlas and offline package.')
