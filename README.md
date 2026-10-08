# Global AI Ecosystem Atlas · October 2026

[Download the offline atlas](global-ai-ecosystem-atlas-october-2026.zip) · [Türkçe PDF](global-ai-atlas-workshop-tr.pdf) · [English PDF](global-ai-atlas-workshop.pdf)

A bilingual, interactive field guide for journalists, prepared by Tuhaf Studio. Turkish is the default; switch to English with the language buttons at the top right.

Explore the technology stack, global organizations, a dedicated Türkiye focus, training and inference, reporting questions, and linked primary sources. The atlas distinguishes headquarters and organizational bases from selected operations, and documented relationships from illustrative process connections.

## Use / Kullanım

Open `index.html` in a browser, or use the GitHub Pages site. No installation or server is required. PDF slides in Turkish and English and an offline ZIP are linked directly from the atlas. Source links require internet; the atlas itself works offline.

`index.html` dosyasını tarayıcıda açın veya GitHub Pages sitesini kullanın. Sağ üstten Türkçe / İngilizce seçebilirsiniz. PDF sunumlar ve çevrimdışı paket atlasın üst kısmından indirilebilir.

## Scope and verification

48 selected organizations/programs, including 9 Türkiye entries; 66 source records. Sources checked 8 October 2026. This is a representative educational selection, not a complete census or ranking. Announced future operations are labelled as planned. Location proximity does not imply partnership. Only four explicitly sourced connections are presented as documented relationships.

## Contribute

See CONTRIBUTING.md. Suggestions, primary-source corrections and translation improvements are welcome through issues and pull requests. Data, translations and a portable build script are included. The PDFs and PNG maps are dated workshop snapshots; changes to the interactive atlas do not automatically regenerate these snapshots.

## Files

- `index.html`: self-contained bilingual atlas with embedded fonts and basemap.
- `atlas-data.json`, `atlas-data-tr.json`: English and Turkish editorial datasets.
- `organizations*.csv`, `source-register*.csv`: reusable organization and evidence registers.
- `global-ai-atlas-workshop*.pdf`: printable workshop slides.
- `src/`: interactive atlas template, Turkish translations and basemap paths.
- `tools/build.py`: rebuild the interactive HTML with Python 3, no extra packages.

Font redistribution terms and basemap provenance are in FONT-NOTICES.md and the OFL files. No separate reuse license has yet been selected for the atlas's original code and editorial content; please ask the author about redistribution beyond GitHub collaboration.

## Publishing status

GitHub Pages is enabled from `main` / root. The account-level custom domain currently redirects this project to `tuhaf.studio/global-ai-ecosystem-atlas/`; that domain serves WordPress and does not currently route this project to GitHub Pages. A dedicated subdomain with a DNS CNAME pointing to `ahmetasabanci.github.io` can resolve this without changing the main website.
