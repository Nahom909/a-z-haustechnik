# 4M Gebäudetechnik GmbH – Website (Vorschau)

Onepager mit drei Gewerke-Unterseiten für einen SHK-Betrieb in Offenbach am Main.
Zugangscode der Vorschau: **1292** (wird pro Browsersitzung gemerkt).

## Seiten
- `index.html` – Start: Hero mit Anlagenschema, Leistungen, Ablauf, Einblicke, Über uns, Kontakt
- `heizung.html`, `klima.html`, `sanitaer.html` – je Gewerk: Leistungsumfang, Geräte, Anfrage
- `impressum.html`, `datenschutz.html` – Textbausteine mit Platzhaltern

## Gestaltung
- Logo ohne Slogan, freigestellt: `assets/logo-*.png/webp` (Original: `assets/logo-original.jpg`)
- Farbregel: Rot = Vorlauf/Heizung, Blau = Rücklauf/Klima/Sanitär, Knöpfe anthrazit, keine Verläufe
- Schrift: Encode Sans (breit für Überschriften, wie die Wortmarke), Symbole: Phosphor
- Signatur: das Haus als Anlagenschema (`assets/site.js`), wechselt zwischen Heizung, Klima und Sanitär

## Fotos einsetzen
Dateien einfach unter `images/` ablegen, dann ersetzen sie die Platzhalter automatisch:
`projekt-1.webp` (groß) bis `projekt-5.webp`, `team.webp` (Hochformat 4:5).
Alt-Texte in `index.html` anpassen.

## Offene Punkte
- [ ] Telefonnummer (`tel:+49XXXXXXXXX` und `[Telefonnummer]`)
- [ ] E-Mail-Adresse (`[E-Mail-Adresse]`, `mailto:[E-Mail]`, `data-mail` am Formular)
- [ ] Adresse Kaiserstraße 39, 63065 Offenbach bestätigen (stammt von der alten Seite)
- [ ] Bürozeiten Mo bis Fr 8 bis 17 Uhr bestätigen
- [ ] Gründungsjahr, Geschäftsführung, HRB, USt-ID, Handwerkskammer
- [ ] Fotos vom Betrieb
- [ ] Vor Livegang: Schrift und Symbole lokal einbinden, Formular-Endpunkt (`data-endpoint`), `noindex` entfernen, Code-Sperre entfernen
- Hinweis: Die Code-Sperre ist clientseitig (Sichtschutz für die Vorschau, kein echter Zugriffsschutz).
