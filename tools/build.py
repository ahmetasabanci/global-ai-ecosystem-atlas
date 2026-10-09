from pathlib import Path
import base64, hashlib, json, re, zipfile
root = Path(__file__).resolve().parents[1]
s = (root / 'src/atlas-template.html').read_text()

def embed(value):
    # Escape characters that could close the <script> element or break a JS string.
    text = json.dumps(value, ensure_ascii=False)
    return text.replace('<', '\\u003c').replace('>', '\\u003e').replace('&', '\\u0026').replace('\u2028', '\\u2028').replace('\u2029', '\\u2029')

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
