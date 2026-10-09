# Global AI Ecosystem Atlas · October 2026

[Download the offline atlas](global-ai-ecosystem-atlas-october-2026.zip) · [Türkçe PDF](global-ai-atlas-workshop-tr.pdf) · [English PDF](global-ai-atlas-workshop.pdf)

[Open the interactive atlas](https://aiatlas.tuhaf.studio/)

A bilingual, interactive field guide for journalists, prepared by Tuhaf Studio. Turkish is the default; switch to English with the language buttons at the top right.

Explore the technology stack, global organizations, a dedicated Türkiye focus, training and inference, reporting questions, and linked primary sources. The atlas distinguishes headquarters and organizational bases from selected operations, and documented relationships from illustrative process connections.

## Use / Kullanım

Open `index.html` in a browser, or use the GitHub Pages site. No installation or server is required. PDF slides in Turkish and English and an offline ZIP are linked directly from the atlas. Source links require internet; the atlas itself works offline.

`index.html` dosyasını tarayıcıda açın veya GitHub Pages sitesini kullanın. Sağ üstten Türkçe / İngilizce seçebilirsiniz. PDF sunumlar ve çevrimdışı paket atlasın üst kısmından indirilebilir.

## Scope and verification

52 selected organizations/programs, including 10 Türkiye entries; 102 source records. Sources checked 8 October 2026; corrections and additions checked 9 October 2026. This is a representative educational selection, not a complete census or ranking. Announced future operations are labelled as planned. Location proximity does not imply partnership. Only eight explicitly sourced connections are presented as documented relationships.

## Contribute

See CONTRIBUTING.md. Suggestions, primary-source corrections and translation improvements are welcome through issues and pull requests. Data, translations and a portable build script are included. The PDFs and PNG maps are dated workshop snapshots; changes to the interactive atlas do not automatically regenerate these snapshots. The current snapshots date from 8 October 2026 (48 organizations, 66 sources) and predate the 9 October corrections, including the Türkiye AI Action Plan's entry into force and the NVIDIA–TSMC wording; use the interactive atlas for the current text.

## Files

- `index.html`: self-contained bilingual atlas with embedded fonts and basemap.
- `atlas-data.json`, `atlas-data-tr.json`: English and Turkish editorial datasets.
- `organizations*.csv`, `source-register*.csv`: reusable organization and evidence registers.
- `global-ai-atlas-workshop*.pdf`: printable workshop slides.
- `src/`: interactive atlas template, Turkish translations and basemap paths.
- `tools/build.py`: rebuild the interactive HTML, the Turkish dataset, the CSV registers and the offline ZIP with Python 3, no extra packages.
- `LICENSE`, `LICENSE-CONTENT.md`: MIT (code) and CC BY 4.0 (content).

## License

- **Code** (HTML template, JavaScript, CSS, `tools/`): [MIT License](LICENSE).
- **Editorial content** (datasets, CSV registers, PDFs, PNG maps, documentation and written text): [CC BY 4.0](LICENSE-CONTENT.md). Please credit *Global AI Ecosystem Atlas, Tuhaf Studio / Ahmet A. Sabancı* and link to https://aiatlas.tuhaf.studio/.
- **Fonts**: SIL Open Font License 1.1 (see FONT-NOTICES.md and the OFL files). **Basemap**: Natural Earth, public domain.
- Third-party sources, organization names and trademarks belong to their owners.

## Public website

https://aiatlas.tuhaf.studio/

GitHub Pages publishes this site from `main` / root. The dedicated `aiatlas.tuhaf.studio` subdomain points to `ahmetasabanci.github.io`.
