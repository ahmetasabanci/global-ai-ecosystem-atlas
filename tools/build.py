from pathlib import Path
import json
root = Path(__file__).resolve().parents[1]
s = (root / 'src/atlas-template.html').read_text()
for marker, name in [('__ATLAS_DATA__', 'atlas-data.json'), ('__TRANSLATIONS__', 'src/translations-tr.json'), ('__LAND_PATHS__', 'src/map-paths.json')]:
    s = s.replace(marker, json.dumps(json.loads((root / name).read_text()), ensure_ascii=False))
for name in ['index.html', 'global-ai-atlas.html']:
    (root / name).write_text(s)
print('Built bilingual atlas.')
