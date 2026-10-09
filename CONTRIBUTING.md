# Contributing / Katkıda bulunma

Please open an issue or pull request with the correction, the organization/field affected, an official primary-source URL, its publication date when available, and the date checked. Distinguish headquarters, registered office, organizational base and operations. Label announced projects as planned; do not infer dependencies from shared geography or layer membership.

Düzeltmeler için ilgili kuruluşu/alanı, resmî birincil kaynak bağlantısını, varsa yayın tarihini ve kontrol tarihini belirtin. Merkez ile faaliyet konumlarını ayırın. Planlanan projeleri açıkça işaretleyin; coğrafi yakınlıktan ortaklık çıkarmayın.

Edit atlas-data.json for English data and src/translations-tr.json for interface/content translations. Every new or changed English string needs a Turkish entry in src/translations-tr.json. Run `python3 tools/build.py` to regenerate index.html, global-ai-atlas.html, atlas-data-tr.json, the four CSV registers and the offline ZIP; do not edit those generated files by hand. An unchanged rebuild produces no diff. Test both languages, search, filters, map controls, source links and downloads. To refresh the PDFs and PNG maps, install Playwright once (`npm i --no-save playwright && npx playwright install chromium`), run `node tools/export.mjs`, then run `python3 tools/build.py` again so the offline ZIP picks them up. The exporter stops with an error if a page overflows or Turkish text is missing a translation. Check keyboard use too: Tab through the page, use the arrow keys in the view tabs, and open map markers with Enter.

## License of contributions / Katkıların lisansı

By contributing, you agree that code contributions are released under the MIT License (`LICENSE`) and content contributions under CC BY 4.0 (`LICENSE-CONTENT.md`).

Katkıda bulunarak kod katkılarınızın MIT, içerik katkılarınızın CC BY 4.0 lisansıyla yayımlanmasını kabul etmiş olursunuz.
