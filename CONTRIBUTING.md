# Contributing / Katkıda bulunma

Please open an issue or pull request with the correction, the organization/field affected, an official primary-source URL, its publication date when available, and the date checked. Distinguish headquarters, registered office, organizational base and operations. Label announced projects as planned; do not infer dependencies from shared geography or layer membership.

Düzeltmeler için ilgili kuruluşu/alanı, resmî birincil kaynak bağlantısını, varsa yayın tarihini ve kontrol tarihini belirtin. Merkez ile faaliyet konumlarını ayırın. Planlanan projeleri açıkça işaretleyin; coğrafi yakınlıktan ortaklık çıkarmayın.

Edit atlas-data.json for English data and src/translations-tr.json for interface/content translations. Run `python3 tools/build.py` to update index.html and global-ai-atlas.html. Update Turkish JSON and the CSV registers as needed; the build script only regenerates interactive HTML. Refresh the offline ZIP after rebuilding so it carries the same global-ai-atlas.html. Test both languages, search, filters, map controls, source links and downloads. PDFs and PNGs must be separately updated when their content changes.
