// Builds the printable workshop decks and overview maps from the atlas data:
//   global-ai-atlas-workshop.pdf, global-ai-atlas-workshop-tr.pdf,
//   technology-map.png, technology-map-tr.png, global-map.png, global-map-tr.png
// Requires Node 18+ and Playwright with Chromium: `npm i -D playwright && npx playwright install chromium`.
// Run after `python3 tools/build.py`, then run build.py again to refresh the offline ZIP.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { chromium } from 'playwright';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = name => readFileSync(join(root, name), 'utf8');
const A = JSON.parse(read('atlas-data.json'));
const TRANSLATIONS = JSON.parse(read('src/translations-tr.json'));
const LAND = JSON.parse(read('src/map-paths.json'));
const FONTS = (read('src/atlas-template.html').match(/@font-face\{[^}]*\}/g) || []).join('\n');

// Same translator as the interactive atlas.
const pattern = new RegExp('(?<![\\p{L}\\p{N}_])(?:' + Object.keys(TRANSLATIONS).sort((a, b) => b.length - a.length)
  .map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')(?![\\p{L}\\p{N}_])', 'gu');
const translate = s => { const k = s.trim(); return TRANSLATIONS[k] ? s.replace(k, TRANSLATIONS[k]) : s.replace(pattern, m => TRANSLATIONS[m]); };
const ENGLISH = /(?<![\p{L}’'])(the|and|of|with|for|is|are|to|in|by|not|from)(?![\p{L}’'])/iu;

function deck(lang) {
  const missing = new Set();
  // t(): prose that must be translated; n(): names and identifiers that may stay as they are.
  const t = s => {
    s = String(s ?? '');
    if (lang === 'en') return s;
    const out = translate(s);
    if (ENGLISH.test(out) || (out === s && /[a-z]{3,}/.test(s) && !(s.trim() in TRANSLATIONS))) missing.add(s);
    return out;
  };
  const n = s => (lang === 'en' ? String(s ?? '') : translate(String(s ?? '')));
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const T = s => esc(t(s)), N = s => esc(n(s));
  const src = id => A.sources.find(s => s.id === id), org = id => A.organizations.find(o => o.id === id);
  const lname = id => A.layers.find(l => l.id === id).name;
  const link = id => { const s = src(id); return `<a href="${esc(s.url)}">${esc(id)}</a>`; };
  const links = ids => ids.map(link).join(' · ');
  const chunk = (xs, k) => Array.from({ length: Math.ceil(xs.length / k) }, (_, i) => xs.slice(i * k, i * k + k));
  const footer = `${T('Global AI Ecosystem Atlas')} | ${T('Sources checked')} ${T('8–9 October 2026')} | ${T('Representative sample')}`;

  const pages = [];
  const page = (eyebrow, title, sub, body, cls = '') => pages.push({ eyebrow, title, sub, body, cls });

  // Map drawing shared by the global and operations pages.
  const color = t => t === 'Company' ? '#238197' : t === 'Public / academic research' ? '#12878e' : t === 'Government / intergovernmental' ? '#866120' : '#DE8859';
  const mark = (type, x, y, hollow) => {
    const c = color(type);
    if (hollow) return `<circle cx="${x}" cy="${y}" r="6" fill="#eaf0f1" stroke="${c}" stroke-width="2"/>`;
    if (type === 'Public / academic research') return `<path d="M${x},${y - 7} l7,12 h-14 Z" fill="${c}" stroke="#fff" stroke-width="1.2"/>`;
    if (type === 'Government / intergovernmental') return `<rect x="${x - 5}" y="${y - 5}" width="10" height="10" fill="${c}" stroke="#fff" stroke-width="1.2"/>`;
    if (type === 'Nonprofit / community') return `<path d="M${x},${y - 7} l7,7 -7,7 -7,-7 Z" fill="${c}" stroke="#fff" stroke-width="1.2"/>`;
    return `<circle cx="${x}" cy="${y}" r="6" fill="${c}" stroke="#fff" stroke-width="1.2"/>`;
  };
  const map = (records, hollow) => {
    let s = LAND.map(p => `<path d="${p}" fill="#d6ddd6" stroke="#bac6be" stroke-width=".45"/>`).join('');
    for (let lon = -150; lon <= 180; lon += 30) s += `<path d="M${(lon + 180) * 3},0 V429" stroke="#cbd8dc" stroke-width=".5"/>`;
    for (let lat = -30; lat <= 60; lat += 30) s += `<path d="M0,${(85 - lat) * 3} H1080" stroke="#cbd8dc" stroke-width=".5"/>`;
    for (const [label, lon, lat] of [['NORTH AMERICA', -110, 65], ['LATIN AMERICA', -92, -5], ['EUROPE', -20, 70], ['AFRICA', 2, -13], ['ASIA', 80, 65], ['OCEANIA', 137, -49]])
      s += `<text x="${(lon + 180) * 3}" y="${(85 - lat) * 3}" class="region">${N(label)}</text>`;
    for (const r of records) {
      const x = (r.lon + 180) * 3, y = (85 - r.lat) * 3;
      if (r.precision === 'country') s += `<circle cx="${x}" cy="${y}" r="10.5" fill="none" stroke="#19343b" stroke-width="1.2" stroke-dasharray="3 2.5"/>`;
      s += mark(r.type, x, y, hollow);
    }
    return `<svg class="map" viewBox="0 0 1080 429">${s}</svg>`;
  };
  const based = A.organizations.filter(o => o.lon !== null);
  const legend = `<p class="small">${T('Company: circle | Public/academic research: triangle | Government/IGO: square | Nonprofit/community: diamond')} · ${T('Dashed ring = country-level position, not a city')}</p>`;

  // 1 Title
  page('A WORKSHOP FOR JOURNALISTS / OCTOBER 2026', 'Global AI Ecosystem Atlas', '',
    `<p class="hero">${T('Follow the resources, knowledge, labour and power behind AI. Two maps, one connected ecosystem.')}</p>
     <p class="lead">${T('Two complementary maps: the technology stack and the global ecosystem. A dedicated Türkiye focus connects local capabilities to international dependencies.')}</p>
     <div class="banner"><b>${A.organizations.length} ${T('selected organizations / programs')}</b><span>${A.sources.length} ${T('source records')} | ${T('Offline interactive companion')} | ${T('Clickable source links')}</span></div>
     <p class="small">${T('For presentation: use full-screen PDF mode. For exploration: open global-ai-atlas.html in a browser. Appendix pages provide the directory and sources.')}</p>`, 'title');

  // 2 How to read
  const lines = s => T(s).split('\n').join('<br>');
  page('FIELD GUIDE / OCTOBER 2026', 'How to read the atlas', 'The classifications are part of the story.',
    `<div class="cols3">
      <div><h3>${T('Locations')}</h3><p>${lines('HQ = explicit headquarters evidence.\nRegistered office = legal address.\nBase = organizational or research anchor.\nOperations = a small selection of sourced overseas sites.\nCoordinates are approximate, not facility addresses.')}<br>${T('Dashed ring = country-level position, not a city')}</p></div>
      <div><h3>${T('Actors')}</h3><p>${['Company', 'Public / academic research', 'Government / intergovernmental', 'Nonprofit / community'].map(T).join('<br>')}<br>${T('These are editorial functional classes. A public research institute can also develop models.')}</p></div>
      <div><h3>${T('Connections')}</h3><p>${lines('Documented = cited real relationship.\nPlanned = future activity, separately labelled.\nIllustrative = educational process link.\nCo-location or a shared layer implies no business relationship. Marker size does not show market share.')}</p></div>
    </div>
    <p class="accent">${T('This is a teaching sample, not a ranking or census. Unmarked places can still have important AI activity. Organizational bases do not locate all users, workers, data or compute.')}</p>`);

  // 3 Technology stack (also exported as technology-map.png)
  const names = id => A.organizations.filter(o => o.layers.includes(id)).map(o => n(o.name));
  const short = xs => esc(xs.slice(0, 7).join(' · ') + (xs.length > 7 ? ` · +${xs.length - 7}` : ''));
  page('FIELD GUIDE / OCTOBER 2026', '01 / The technology stack', 'Start at the bottom. Applications depend on the layers beneath them.',
    `<div class="stackwrap"><div class="stack">${A.layers.slice(0, 7).map((l, i) => ({ l, i })).reverse().map(({ l, i }) =>
      `<div class="layer"><span class="num">${i + 1}</span><div><b>${T(l.name)}</b><small>${short(names(l.id))}</small></div></div>`).join('')}</div>
     <div class="across"><h3>${T('Across every layer')}</h3>
      <h4>${T(lname('research'))}</h4><p>${T('Methods, datasets, skills and evaluation.')}<br><small>${short(names('research'))}</small></p>
      <h4>${T(lname('governance'))}</h4><p>${T('Laws, frameworks, public oversight and civil society.')}<br><small>${short(names('governance'))}</small></p></div></div>
     <p class="small">${T('Layer order is illustrative. Data and compute feed model development together; tools, research and governance also act throughout the stack.')}</p>`, 'stackpage');

  // 4 Training and inference
  const steps = xs => `<div class="steps">${xs.map(([h, p], i) => `<div><b>${i + 1} / ${T(h)}</b><p>${T(p)}</p></div>`).join('')}</div>`;
  page('FIELD GUIDE / OCTOBER 2026', 'Training and inference are different', 'The same infrastructure supports both, but an ordinary prompt is not necessarily model retraining.',
    `<h3>${T('Before your request: training')}</h3>${steps([['Examples & labour', 'Collect, licence, clean and label examples.'], ['Compute & learning', 'Adjust parameters to improve an objective.'], ['Adapt & evaluate', 'Fine-tune, get feedback and test behaviour.'], ['Deploy a version', 'Package weights and policies into a service.']])}
     <h3>${T('During your request: inference')}</h3>${steps([['Receive input', 'The app collects text/media and settings.'], ['Assemble context', 'Instructions, history and optional retrieval.'], ['Run calculations', 'A trained model produces tokens or other outputs.'], ['Return or act', 'Checks, formatting and optional tool calls.']])}
     <p class="small">${T('Illustrative process links, not a vendor trace. Tool calls can loop through several inference steps. Retained logs may later enter training under the service policy.')} ${T('Sources:')} ${links(['S02', 'S03'])}</p>`);

  // 5-7 Layer detail
  for (const [title, ids] of [['Resources, hardware, capacity', ['physical', 'chips', 'compute']], ['Data, models, developer tools', ['data', 'models', 'tools']], ['Applications, research, accountability', ['apps', 'research', 'governance']]])
    page('TECHNOLOGY MAP / DETAIL', title, '', `<div class="cols3">${ids.map(id => { const l = A.layers.find(x => x.id === id); return `<div class="card"><h3>${T(l.name)}</h3><p>${T(l.desc)}</p><p class="q"><b>${T('Investigate:')}</b> ${T(l.question)}</p><p><b>${T('Request evidence')}:</b> ${T(l.evidence)}</p></div>`; }).join('')}</div>`);

  // 8 Global map (also exported as global-map.png)
  const groups = [['The Americas', ['North America', 'Latin America']], ['Europe & the Middle East', ['Europe', 'Middle East']], ['East, South & Southeast Asia', ['East Asia', 'South & Southeast Asia']], ['Africa & Oceania', ['Africa', 'Oceania']], ['Türkiye', ['Türkiye']]];
  const regionNames = rs => A.organizations.filter(o => rs.includes(o.region)).map(o => n(o.name));
  page('FIELD GUIDE / OCTOBER 2026', '02 / The global ecosystem', 'Organizational bases are one view of a multinational and distributed system.',
    `${map(based, false)}${legend}<div class="regions">${groups.map(([g, rs]) => `<p><b>${T(g)}</b> / ${short(regionNames(rs))}</p>`).join('')}</div>
     <p class="small">${T('Approximate organizational bases; overlapping pins are separated in the interactive map. Masakhane is distributed, without a fabricated HQ. Natural Earth land outline; no political boundaries. Bases do not locate all operations, data or users.')}</p>`, 'mappage');

  // Regional examples
  const orgLine = o => `<div class="orgline"><b>${N(o.name)}</b> | ${N(o.country)}<small>${o.layers.map(l => T(lname(l))).join(', ')} · ${T(o.type)}</small></div>`;
  for (const [g, rs] of groups.slice(0, 4)) {
    const cols = rs.map(r => [r, A.organizations.filter(o => o.region === r)]);
    const pagesNeeded = Math.max(...cols.map(([, os]) => Math.ceil(os.length / 9)));
    for (let i = 0; i < pagesNeeded; i++)
      page('GLOBAL MAP / REGIONAL EXAMPLES', i ? `${g} (continued)` : g, '',
        `<div class="cols2">${cols.map(([r, os]) => `<div><h3>${T(r)}</h3>${os.slice(i * 9, i * 9 + 9).map(orgLine).join('')}</div>`).join('')}</div>`);
  }

  // Operations
  const ops = A.operations.map(s => ({ ...s, type: org(s.org).type }));
  const byOrg = [...new Set(A.operations.map(s => s.org))];
  page('FIELD GUIDE / OCTOBER 2026', 'Operations can tell a different geography', 'Ten selected overseas-site records; not an exhaustive footprint.',
    `<div class="opsgrid">${map(ops, true)}<div>${byOrg.map(id => { const ss = A.operations.filter(s => s.org === id); return `<h4>${N(org(id).name)}</h4><p class="small">${ss.map(s => `${N(s.city)}, ${N(s.country)}`).join('; ')}<br>${T('Sources:')} ${links([...new Set(ss.map(s => s.source))])}</p>`; }).join('')}</div></div>
     <p class="small">${T('Hollow circles = selected sites. NVIDIA’s first US-made Blackwell wafer (October 2025) documents TSMC Arizona fabrication; packaging remained in Taiwan. Appen’s Kirkland marker is an additional US headquarters; other markers are selected offices. Office presence does not locate all contributors.')}</p>`);

  // Documented connections
  chunk(A.dependencies, 4).forEach((ds, i) => page('RELATIONSHIPS / EVIDENCE AND STATUS', i ? 'Documented connections, with limits (continued)' : 'Documented connections, with limits',
    i ? '' : 'These are the only named relationships presented as evidenced connections. Stack diagrams and the chatbot journey are illustrative. Partnerships and capacity commitments do not establish exclusivity or delivery.',
    `<div class="cols2">${ds.map(d => `<div class="card"><p class="status">${T(d.status)}</p><h3>${T(d.label)}</h3><p>${T(d.desc)}</p><p class="small">${T('Sources:')} ${links([].concat(d.source))}</p></div>`).join('')}</div>`));

  // Türkiye
  const tr = A.organizations.filter(o => o.region === 'Türkiye');
  page('FIELD GUIDE / OCTOBER 2026', 'Türkiye / Capabilities across the stack', 'Ten selected institutions and programs. Local activity and international dependencies coexist.',
    `<div class="cols2">${A.turkiye.map(([h, p]) => `<div><h3>${T(h)}</h3><p>${T(p)}</p></div>`).join('')}</div>
     <div class="banner slim"><b>${T('Existing service ≠ planned investment ≠ independently demonstrated performance.')}</b><span>${T('The proposed Google Cloud region is labelled planned. Local data centres, Turkish models and foreign hardware are separate observations. A national label does not establish the origin of an entire stack.')}</span></div>
     <p class="small">${T('Sources:')} ${links(['S67', 'S49'])}</p>`);
  chunk(tr, 4).forEach((os, i) => page('TÜRKIYE / DETAIL', i ? 'Türkiye / Organizations and questions (continued)' : 'Türkiye / Organizations and questions', '',
    `<div class="cols2">${os.map(o => `<div class="card"><h3>${N(o.name)}</h3><p class="meta">${T(o.type)} | ${T(o.locationType)}: ${N(o.city)}, ${N(o.country)}</p><p>${T(o.description)}</p><p class="small">${T(o.operations)}</p><p class="q"><b>${T('Investigate:')}</b> ${T(o.prompt)}</p><p class="small">${T('Sources:')} ${links(o.sources)}</p></div>`).join('')}</div>`));
  page('TÜRKIYE / REPORTING CHECKLIST', 'The test for “national AI”', '',
    `<div class="cols2 tight">${[['Compute', 'Which GPUs are available now? Ask for supplier/model, purchase records, allocations, queue times, actual utilisation and access rules.'], ['Language & data', 'Ask for Turkish datasets, licences, annotation methods, dialect coverage and evaluation by local speakers.'], ['Model origin', 'Separate training from scratch, continued training, fine-tuning of external weights, retrieval and an API wrapper.'], ['Control & ownership', 'Separate local deployment from data ownership, legal jurisdiction, company control, foreign suppliers and a practical exit path.'], ['Public policy', 'Obtain the adopted plan, appropriations, procurement contracts, measurable milestones, incident reports and oversight responsibilities.']].map(([h, p]) => `<div class="card"><h3>${T(h)}</h3><p>${T(p)}</p></div>`).join('')}</div>`);

  // Exercise
  page('WORKSHOP / SMALL-GROUP ACTIVITY', 'A 15-minute investigation exercise', '',
    `<div class="banner"><b>${T('Fictional pitch:')} ${T('“A national AI assistant will improve public services and keep citizens’ data at home.”')}</b></div>
     <table class="ex">${[['3 minutes', 'Map the operator, model developer, cloud provider and hardware suppliers.'], ['4 minutes', 'Separate demonstrated facts, planned investments and marketing claims.'], ['4 minutes', 'Choose three records to request and two affected groups to interview.'], ['4 minutes', 'Write a supported headline and one question still unanswered.']].map(([m, s]) => `<tr><td>${T(m)}</td><td>${T(s)}</td></tr>`).join('')}</table>
     <p class="small">${T('60-minute route: 0-10 chatbot journey | 10-25 stack | 25-35 global map | 35-45 Türkiye | 45-60 exercise.')}</p>`);

  // Glossary and method
  chunk(A.glossary, 6).forEach((gs, i) => page('GLOSSARY / PLAIN LANGUAGE', i ? 'Words that make the ecosystem legible (continued)' : 'Words that make the ecosystem legible', '',
    `<div class="cols2">${gs.map(([h, p]) => `<div><h3>${T(h)}</h3><p>${T(p)}</p></div>`).join('')}</div>`));
  page('METHOD / SCOPE', 'Editorial method and practical limits', '',
    `<p>${T(A.methodology)}</p><div class="cols2"><div><h3>${T('Source practice')}</h3><p>${T('Primary sources anchor products, roles and selected relationships. Company claims are attributed descriptions, not independent validation of performance. Indexed-only access is disclosed in the register. “Live page” means checked on the edition date, not continuously monitored.')}</p></div>
     <div><h3>${T('Open weights / open source')}</h3><p>${T('Open weights and open source are not interchangeable. This atlas avoids assigning a blanket model licence to an organization. Check the exact release and its code, weights, data information and permitted uses.')}</p></div></div>`);

  // Appendix: directory and source register
  chunk(A.organizations, 4).forEach((os, i) => page('APPENDIX / ROLE, LOCATION AND SOURCES', i ? 'Organization directory (continued)' : 'Organization directory', '',
    `<div class="cols2">${os.map(o => `<div class="entry"><h3>${N(o.name)}</h3><p class="meta">${T(o.type)} | ${T(o.locationType)}: ${N(o.city)}, ${N(o.country)}</p><p>${T(o.description)}</p><p class="small">${T(o.operations)}</p><p class="small">${T('Sources:')} ${links(o.sources)}</p></div>`).join('')}</div>`, 'dense'));
  chunk(A.sources, 6).forEach((ss, i) => page('APPENDIX / PRIMARY SOURCES', i ? 'Source register (continued)' : 'Source register', '',
    `<div class="cols2">${ss.map(s => `<div class="entry"><h4><a href="${esc(s.url)}">${esc(s.id)} · ${esc(s.title)}</a></h4><p>${T(s.claim)}</p><p class="small">${T(s.kind)} · ${T(s.published)} · ${T('checked')} ${esc(s.checked)}<br>${T(s.access)}</p></div>`).join('')}</div>`, 'dense'));

  // Closing
  page('WORKSHOP / TAKEAWAY', 'Use, revisit, investigate', '',
    `<p class="hero">${T('A useful AI story can begin at any layer.')}</p><p class="lead">${T('Follow the claim down through the stack. Follow the resources and people across the map. Return to the people affected by the system.')}</p>
     <p>${T('Interactive companion:')} <a href="https://aiatlas.tuhaf.studio/">aiatlas.tuhaf.studio</a> · global-ai-atlas.html<br>${T('Reusable organization data:')} organizations.csv, atlas-data.json<br>${T('Source register:')} source-register.csv<br>${T('Facilitation and verification notes:')} ${lang === 'tr' ? 'BURADAN-BASLAYIN.md' : 'START-HERE.md'}</p>
     <p class="small"><a href="https://www.naturalearthdata.com/about/terms-of-use/">${T('Natural Earth public-domain land outline')}</a>, 1:110m. ${T('Source URLs are clickable in the PDF and fully available in the CSV register.')}<br>${T('Code license')}: MIT · ${T('Content license')}: CC BY 4.0 · ${T('Fonts')}: SIL OFL 1.1</p>`);

  const html = `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><title>${T('Global AI Ecosystem Atlas')} · ${T('October 2026')}</title><style>${FONTS}
  @page{size:960px 540px;margin:0}*{box-sizing:border-box}body{margin:0;font-family:'Montserrat',sans-serif;color:#19343b;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  a{color:#238197;text-decoration:none}
  .page{width:960px;height:540px;position:relative;overflow:hidden;background:#fffaf2;break-after:page;padding:0 34px}
  .page:before{content:'';position:absolute;left:0;right:0;top:0;height:7px;background:linear-gradient(90deg,#238197,#12878e,#178c83,#2d9176,#459467,#5e9758,#78974b,#939643,#ad9342,#c78e49,#de8859)}
  .top{display:flex;justify-content:space-between;padding-top:20px;font-size:8.5px;font-weight:700;letter-spacing:.06em;color:#238197;text-transform:uppercase}.top .brand{font-family:'Comfortaa';text-transform:none;letter-spacing:.02em;font-size:10px}
  h1,h2,h3,h4{font-family:'Comfortaa',sans-serif;font-weight:700;margin:0}
  h1{font-size:25px;margin:14px 0 4px;letter-spacing:-.01em}.sub{font-size:10.5px;color:#52646f;margin:0 0 12px}
  .content{position:absolute;left:34px;right:34px;top:96px;bottom:44px;overflow:hidden;font-size:10.5px;line-height:1.45}
  .title .content{top:80px}.page p{margin:0 0 8px}
  h3{font-size:13px;color:#238197;margin:2px 0 6px}h4{font-size:11px;margin:6px 0 3px}
  small,.small{font-size:8.5px;color:#52646f}.meta{font-size:8.5px;color:#52646f;margin-bottom:4px!important}
  .hero{font-family:'Comfortaa';font-weight:700;font-size:21px;color:#238197;line-height:1.3;max-width:640px}.lead{font-size:13px;max-width:620px}
  .banner{background:#19343b;color:#fffaf2;padding:12px 16px;margin:10px 0 12px;border-radius:4px}.banner b{display:block;font-family:'Comfortaa';font-size:13.5px}.banner span{font-size:9px;opacity:.9}.banner.slim b{font-size:11px}
  .accent{font-family:'Comfortaa';font-weight:700;color:#238197;font-size:12px;margin-top:14px!important}
  .cols3{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}.cols2{display:grid;grid-template-columns:1fr 1fr;gap:12px 28px}.cols2.tight{gap:8px 22px}
  .card{border-top:2px solid #238197;padding-top:6px}.q{color:#a94f27}.status{font-size:8px;font-weight:700;color:#a94f27;text-transform:uppercase;letter-spacing:.04em;margin-bottom:2px!important}
  .stackwrap{display:grid;grid-template-columns:1fr 230px;gap:16px}.layer{display:grid;grid-template-columns:30px 1fr;background:#e2f3f3;border-left:5px solid #238197;padding:4px 10px;margin-bottom:5px;align-items:center}
  .layer .num{font-family:'Comfortaa';font-weight:700;font-size:17px;color:#238197}.layer b{font-family:'Comfortaa';font-size:12px;display:block}.layer small{display:block;font-size:8px}
  .across{background:#f6e6d6;padding:12px 14px}.across h3{color:#a94f27;font-size:14px;margin-bottom:10px}.across p{font-size:9.5px}
  .map{width:100%;display:block;background:#eaf0f1;border-radius:6px}.region{fill:#637f8b;font-size:12px;letter-spacing:1.5px;font-family:'Montserrat'}
  .mappage .map{height:248px}.regions{display:grid;grid-template-columns:1fr 1fr;gap:0 20px;font-size:9px;color:#238197}.regions p{margin:0 0 3px!important}
  .orgline{margin-bottom:6px}.orgline small{display:block}
  .opsgrid{display:grid;grid-template-columns:1fr 250px;gap:16px;align-items:start}.opsgrid .map{height:auto}
  .steps{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:12px}.steps>div{border-top:3px solid #238197;padding-top:6px}.steps b{font-size:10.5px}
  .ex{border-collapse:collapse;font-size:12px;margin:6px 0 14px}.ex td{padding:6px 18px 6px 0;vertical-align:top}.ex td:first-child{color:#238197;font-weight:700;white-space:nowrap}
  .dense .content{font-size:9px;line-height:1.38}.dense h3{font-size:11.5px;margin-bottom:2px}.dense h4{font-size:9.5px;margin-top:0}.entry{margin-bottom:6px}
  .foot{position:absolute;left:34px;right:34px;bottom:14px;display:flex;justify-content:space-between;font-size:7px;color:#52646f;border-top:2px solid transparent;border-image:linear-gradient(90deg,#59bfc5,#a1d582,#ffcf70) 1;padding-top:6px}
  </style></head><body>${pages.map((p, i) => `<section class="page ${p.cls}"><div class="top"><span>${T(p.eyebrow)}</span><span class="brand">tuhaf studio</span></div>
  <h1>${T(p.title)}</h1>${p.sub ? `<p class="sub">${T(p.sub)}</p>` : ''}<div class="content">${p.body}</div>
  <div class="foot"><span>${footer}</span><span>${i + 1}</span></div></section>`).join('')}</body></html>`;
  return { html, missing: [...missing] };
}

const browser = await chromium.launch();
let failed = false;
for (const lang of ['en', 'tr']) {
  const { html, missing } = deck(lang);
  if (missing.length) { failed = true; console.error(`[${lang}] untranslated:\n  ` + missing.join('\n  ')); }
  const context = await browser.newContext({ viewport: { width: 960, height: 540 }, deviceScaleFactor: 2 });
  const p = await context.newPage();
  await p.setContent(html, { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready);
  const overflow = await p.evaluate(() => [...document.querySelectorAll('.page')].map((s, i) => [i + 1, s.querySelector('.content')]).filter(([, c]) => c.scrollHeight > c.clientHeight + 1).map(([i]) => i));
  if (overflow.length) { failed = true; console.error(`[${lang}] content overflows on pages ${overflow.join(', ')}`); }
  const suffix = lang === 'tr' ? '-tr' : '';
  const shots = await p.$$('.page');
  await shots[2].screenshot({ path: join(root, `technology-map${suffix}.png`) });
  await shots[[...await p.$$eval('.page', ps => ps.map(x => x.className))].findIndex(c => c.includes('mappage'))].screenshot({ path: join(root, `global-map${suffix}.png`) });
  await p.pdf({ path: join(root, `global-ai-atlas-workshop${suffix}.pdf`), width: '960px', height: '540px', printBackground: true, tagged: true, outline: false });
  console.log(`[${lang}] ${shots.length} pages`);
  await context.close();
}
await browser.close();
if (failed) process.exit(1);
