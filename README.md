# 4M Gebäudetechnik GmbH – Website (Vorschau)

Onepager mit drei Gewerke-Unterseiten für einen SHK-Betrieb in Offenbach am Main.
Zugangscode der Vorschau: **1292** (wird pro Browsersitzung gemerkt).

## Seiten
- `index.html` – Start: Hero mit Anlagenschema, Leistungen, Ablauf, Einblicke, Über uns, Kontakt
- `heizung.html`, `klima.html`, `sanitaer.html` – je Gewerk: Leistungsumfang, Geräte, Anfrage
- `impressum.html`, `datenschutz.html` – Textbausteine mit Platzhaltern

## Gestaltung
- Apple-nah, angelehnt an die Wirtshaus-an-der-Lahn-Vorschau: schwebende Glas-Navigation, runde Bühnen und Karten, Pillen-Knöpfe, Schrift Geist, Symbole Phosphor
- Farbregel: Rot und Blau nur im Logo. Sonst schwarz, weiß, grau in Volltonflächen, keine Verläufe
- Hero: das Haus als 3D-Anlagenschema (`assets/house3d.js`, three.js 0.170 per CDN). Beim Scrollen fährt die Kamera durch Heizung, Klima und Sanitär; Vorlauf leuchtet weiß, Rücklauf grau. Unterseiten zeigen dasselbe Haus mit festem Gewerk
- Ohne WebGL bleibt das SVG-Schema aus `assets/site.js` sichtbar, bei reduzierter Bewegung gibt es keine Scroll-Bühne
- Logo ohne Slogan: `assets/logo-*.png/webp`, für dunkles Glas `logo-horizontal-dark`

## Seiten erzeugen
Alle HTML-Seiten entstehen aus `tools/gen_site.py` (`python tools/gen_site.py`). Texte dort ändern, nicht direkt im HTML.

## Fotos
Alle Bilder in `images/` sind **Beispielbilder von Unsplash** und werden durch eigene Fotos ersetzt (gleiche Dateinamen):
`heizung.webp`, `klima.webp`, `sanitaer.webp` (Leistungen), `projekt-1.webp` bis `projekt-5.webp` (Einblicke), `team.webp` (Über uns, Hochformat).

## Offene Punkte
- [ ] Telefonnummer (`tel:+49XXXXXXXXX` und `[Telefonnummer]`)
- [ ] E-Mail-Adresse (`[E-Mail-Adresse]`, `mailto:[E-Mail]`, `data-mail` am Formular)
- [ ] Adresse Kaiserstraße 39, 63065 Offenbach bestätigen (stammt von der alten Seite)
- [ ] Bürozeiten Mo bis Fr 8 bis 17 Uhr bestätigen
- [ ] Gründungsjahr, Geschäftsführung, HRB, USt-ID, Handwerkskammer
- [ ] Eigene Fotos statt der Unsplash-Beispielbilder
- [ ] Vor Livegang: Schrift, Symbole und three.js lokal einbinden, Formular-Endpunkt (`data-endpoint`), `noindex` entfernen, Code-Sperre entfernen
- Hinweis: Die Code-Sperre ist clientseitig (Sichtschutz für die Vorschau, kein echter Zugriffsschutz).
