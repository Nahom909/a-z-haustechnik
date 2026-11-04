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

## Anfrage-Assistent mit Preisspanne
Im Kontaktbereich der Startseite führt ein Assistent den Kunden durch kurze Fragen (z. B. Klima: Anzahl Räume, Raumgröße, Ort des Außengeräts, Gebäude, Zeitraum). Danach sieht er eine grobe Preisspanne, was enthalten ist und passende Hinweise (z. B. Zustimmung von Vermieter oder WEG). Erst dann folgt das Kontaktformular; die E-Mail an den Betrieb enthält alle Antworten und die Spanne.
- Fragen, Antworten und Preise: `content/rechner.json`, im CMS unter „Anfrage-Assistent und Preise“.
- Rechnung: Summe der „von/bis“-Werte aller gewählten Antworten, multipliziert mit den Faktoren (z. B. Badgröße, Ausstattung), auf 100 € gerundet. Antworten ohne Preis ändern nichts; ohne jeden Preis erscheint „Preis nach Aufwand“.
- Die Unterseiten verlinken mit `?anliegen=klima|heizung|sanitaer`; der Assistent startet dann direkt bei der ersten Frage.
- Preisquellen: Klima und Wärmepumpe nach kosten-preise-ratgeber.de (Stand Mai 2026), Bad-Preise sind Schätzwerte und müssen vom Betrieb bestätigt werden.
- Vor jeder Fußzeile der Unterseiten steht das Band „Bereit für Ihr Projekt?“ (Texte in den Firmendaten).

## Texte bearbeiten (Netlify CMS)
Alle Texte stehen in `content/*.json` und lassen sich im Browser unter `https://<ihre-seite>/admin/` bearbeiten (Decap CMS). Speichern erzeugt einen Commit auf `main`, Netlify baut die Seite neu (`netlify.toml`: `python3 tools/gen_site.py`).
Einrichtung einmalig in Netlify: **Identity** aktivieren, unter *Identity > Registration* auf „Invite only“ stellen, unter *Identity > Services* **Git Gateway** einschalten, dann Nutzer einladen. Der Einladungslink führt automatisch ins CMS.
- `content/site.json`: Firmendaten (Adresse, Telefon, E-Mail, Bürozeiten, Geschäftsführung). In allen Texten gelten die Platzhalter `{{firma}}`, `{{telefon}}`, `{{email}}`, `{{strasse}}`, `{{plz}}`, `{{ort}}`, `{{buero}}`, `{{geschaeftsfuehrung}}`.
- `content/startseite.json`, `heizung.json`, `klima.json`, `sanitaer.json`, `impressum.json`, `datenschutz.json`: Seitentexte, Bilder und Stichworte.
- Bilder lädt das CMS nach `images/` hoch. Menü-Namen, Formularfelder und die Gewerke-Schalter sind fest im Code.
- Die Felder des CMS sind in `admin/config.yml` beschrieben; neue Felder dort und in `tools/gen_site.py` ergänzen.

## Seiten erzeugen
`python3 tools/gen_site.py` erzeugt alle HTML-Seiten aus `content/*.json`. Texte in `content/` ändern (oder im CMS), nicht direkt im HTML. Die eingecheckten HTML-Dateien sind das Ergebnis des letzten Laufs; Netlify erzeugt sie beim Veröffentlichen neu.
Unterseiten: `heizung.html`, `klima.html`, `sanitaer.html`, dazu `impressum.html` und `datenschutz.html`.
Abschnitts-Links: auf der Startseite `#anker` (per JS ohne Eintrag in der Adresse), von Unterseiten `index.html?ziel=anker`. So startet die Startseite beim Öffnen und Neuladen immer oben.
Nach Änderungen an CSS/JS die Versionsnummer `V` in `tools/gen_site.py` erhöhen.

## Fotos
Beispielbilder von Unsplash unter der Unsplash-Lizenz (kostenlos, kommerziell nutzbar). Fotograf, Quelle und Bearbeitungen: `images/BILDNACHWEIS.md`.
Keine Personen, keine erkennbaren Herstellerlogos. Eigene Fotos ersetzen sie unter denselben Dateinamen.

## Offene Punkte
- [ ] Preise im Anfrage-Assistenten mit dem Inhaber abstimmen, vor allem Bad und Wärmepumpe über 120 m²
- [ ] Bürozeiten Mo bis Fr 8 bis 17 Uhr bestätigen
- [ ] Gründungsjahr, HRB, USt-ID, Handwerkskammer
- [ ] Eigene Fotos statt der Unsplash-Beispielbilder (dann Bildnachweis im Impressum anpassen)
- [ ] Vor Livegang: Schrift, Symbole und three.js lokal einbinden, Formular-Endpunkt (`data-endpoint`), `noindex` entfernen, Code-Sperre entfernen
- Hinweis: Die Code-Sperre ist clientseitig (Sichtschutz für die Vorschau, kein echter Zugriffsschutz).
