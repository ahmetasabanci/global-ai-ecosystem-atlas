# Contributing / Katkıda bulunma

Please open an issue or pull request with the correction, the organization/field affected, an official primary-source URL, its publication date when available, and the date checked. Distinguish headquarters, registered office, organizational base and operations. Label announced projects as planned; do not infer dependencies from shared geography or layer membership.

Düzeltmeler için ilgili kuruluşu/alanı, resmî birincil kaynak bağlantısını, varsa yayın tarihini ve kontrol tarihini belirtin. Merkez ile faaliyet konumlarını ayırın. Planlanan projeleri açıkça işaretleyin; coğrafi yakınlıktan ortaklık çıkarmayın.

Edit atlas-data.json for English data and src/translations-tr.json for interface/content translations. Run `python3 tools/build.py` to update index.html, global-ai-atlas.html and the offline ZIP (the ZIP is reproducible, so an unchanged rebuild produces no diff). Update Turkish JSON and the CSV registers as needed; the build script does not regenerate them. Test both languages, search, filters, map controls, source links and downloads. PDFs and PNGs must be separately updated when their content changes. Check keyboard use too: Tab through the page, use the arrow keys in the view tabs, and open map markers with Enter.

## License of contributions / Katkıların lisansı

By contributing, you agree that code contributions are released under the MIT License (`LICENSE`) and content contributions under CC BY 4.0 (`LICENSE-CONTENT.md`).

Katkıda bulunarak kod katkılarınızın MIT, içerik katkılarınızın CC BY 4.0 lisansıyla yayımlanmasını kabul etmiş olursunuz.
