# 4M Gebäudetechnik GmbH – Website (Vorschau)

Onepager mit drei Gewerke-Unterseiten für einen SHK-Betrieb in Frankfurt am Main.
Zugangscode der Vorschau: **1292** (wird pro Browsersitzung gemerkt).

## Seiten
- `index.html` – Start: Hero mit Anlagenschema, Leistungen, Ablauf, Einblicke, Über uns, Kontakt
- `heizung.html`, `klima.html`, `sanitaer.html` – je Gewerk: Leistungsumfang, Geräte, Anfrage
- `impressum.html`, `datenschutz.html` – Textbausteine mit Platzhaltern

## Gestaltung
- Apple-nah, angelehnt an die Wirtshaus-an-der-Lahn-Vorschau: schwebende Glas-Navigation, runde Bühnen und Karten, Pillen-Knöpfe, Schrift Geist, Symbole Phosphor
- Farben: Rot #C1121C und Blau #0E518D (angelehnt an RAL 3020 und RAL 5017) als Vollton, nur im Logo und für die Leitungen im 3D-Haus. Sonst schwarz, weiß, grau, keine Verläufe
- Hero: das Haus als 3D-Anlagenschema (`assets/house3d.js`, three.js 0.170 per CDN). Beim Scrollen fährt die Kamera durch Heizung, Klima und Sanitär; Vorlauf rot, Rücklauf blau, Fließrichtung als hellere Striche. Unterseiten zeigen dasselbe Haus mit festem Gewerk
- Ohne WebGL bleibt das SVG-Schema aus `assets/site.js` sichtbar, bei reduzierter Bewegung gibt es keine Scroll-Bühne

## Logo
Neu gezeichnet als Vektor (`assets/logo-*.svg`, `icon.svg`), erzeugt mit `python tools/make_logo.py <Archivo[wdth,wght].ttf>`:
geometrisches 4M-Monogramm in Volltonfarben, Wortmarke aus Archivo (SIL Open Font License, Buchstaben in Pfade umgewandelt).
Keine Verläufe, keine Schatten, kein Slogan, keine Symbolzeile. Das ursprüngliche Logo liegt nur noch als `assets/logo-original.jpg` zum Vergleich bei.

## Seiten erzeugen
Alle HTML-Seiten entstehen aus `tools/gen_site.py` (`python tools/gen_site.py`). Texte dort ändern, nicht direkt im HTML.
Unterseiten: `heizung.html`, `klima.html`, `sanitaer.html`, dazu `impressum.html` und `datenschutz.html`.
Abschnitts-Links: auf der Startseite `#anker` (per JS ohne Eintrag in der Adresse), von Unterseiten `index.html?ziel=anker`. So startet die Startseite beim Öffnen und Neuladen immer oben.
Nach Änderungen an CSS/JS die Versionsnummer `V` in `tools/gen_site.py` erhöhen.

## Fotos
Beispielbilder von Unsplash unter der Unsplash-Lizenz (kostenlos, kommerziell nutzbar). Fotograf, Quelle und Bearbeitungen: `images/BILDNACHWEIS.md`.
Keine Personen, keine erkennbaren Herstellerlogos. Eigene Fotos ersetzen sie unter denselben Dateinamen.

## Offene Punkte
- [ ] Bürozeiten Mo bis Fr 8 bis 17 Uhr bestätigen
- [ ] Gründungsjahr, HRB, USt-ID, Handwerkskammer
- [ ] Eigene Fotos statt der Unsplash-Beispielbilder (dann Bildnachweis im Impressum anpassen)
- [ ] Vor Livegang: Schrift, Symbole und three.js lokal einbinden, Formular-Endpunkt (`data-endpoint`), `noindex` entfernen, Code-Sperre entfernen
- Hinweis: Die Code-Sperre ist clientseitig (Sichtschutz für die Vorschau, kein echter Zugriffsschutz).
