from pathlib import Path
import base64, hashlib, json, re
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
print('Built bilingual atlas.')
