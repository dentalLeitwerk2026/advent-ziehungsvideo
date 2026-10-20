# advent-ziehungsvideo

Erzeugt nach jeder Ziehung des dentalLeitwerk-Adventskalenders (1.–24.12.2026, 20 Uhr) automatisch das Ziehungsvideo.

**Ablauf:** Ziehung (Lovable) → Make (Szenario 7873731, Route `gewinn_gezogen`) stößt hier den Workflow „Ziehungsvideo“ an → Video wird aus `template/index.html` erzeugt → unter GitHub Pages veröffentlicht (`docs/videos/`) → Make bekommt die Video-Adresse und postet auf Instagram und LinkedIn.

**Übergeben werden nur:** Türchen, Losnummer, Preisstufe, Anzahl Antworten. Keine Namen, keine E-Mail-Adressen.

**Von Hand testen:** Actions → Ziehungsvideo → Run workflow (mit „melden = nein“ wird nichts gepostet).

Vorlage lokal: `node render.js '{"day":3,"ticket":"NUSS-05661","stufe":"P5","antworten":127}' test.mp4`
