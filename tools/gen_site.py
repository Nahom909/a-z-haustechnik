# Erzeugt alle Seiten der 4M-Vorschau als statische HTML-Dateien (kein Build-Schritt auf dem Server nötig).
import pathlib
OUT = pathlib.Path(r"C:\Users\nahom\OneDrive\Claude_Websites\4M_Gebaeudetechnik")
TEL = "tel:+49XXXXXXXXX"
V = "20261102d"  # bei jeder Änderung an CSS/JS erhöhen, damit Browser nicht die alte Datei aus dem Cache nehmen

THREE = """<script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/"}}</script>
<script type="module" src="assets/house3d.js?v=__V__"></script>""".replace("__V__", V)


def head(title, desc, three=False, extra=""):
    return f"""<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#F5F5F7">
<meta property="og:title" content="4M Gebäudetechnik GmbH">
<meta property="og:description" content="Heizung, Klima und Sanitär in Offenbach am Main und im Rhein-Main-Gebiet.">
<meta property="og:image" content="assets/logo-full.png">
<link rel="icon" href="assets/icon.svg" type="image/svg+xml">
<link rel="icon" href="assets/favicon.png" type="image/png" sizes="64x64">
<link rel="apple-touch-icon" href="assets/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/regular/style.css">
<link rel="stylesheet" href="assets/site.css?v={V}">
<script src="assets/site.js?v={V}"></script>
{THREE if three else ""}{extra}
</head>
<body>
<a class="skip" href="#main">Zum Inhalt springen</a>
"""


def to(home, anchor, anfrage=""):
    """Link zu einem Abschnitt der Startseite. Von Unterseiten per ?ziel=, damit keine #Sprungmarke in der Adresse hängen bleibt."""
    if home:
        return "#" + anchor
    return "index.html" + (anfrage + "&" if anfrage else "?") + "ziel=" + anchor


def nav(home, anfrage=""):
    links = [("leistungen", "Leistungen"), ("ablauf", "Ablauf"), ("einblicke", "Einblicke"), ("ueber-uns", "Über uns"), ("kontakt", "Kontakt")]
    li = "\n      ".join(f'<li><a href="{to(home, a)}">{t}</a></li>' for a, t in links)
    sheet = "\n    ".join(f'<li><a href="{to(home, a)}">{t} <i class="ph ph-arrow-right" aria-hidden="true"></i></a></li>' for a, t in links)
    return f"""
<header class="nav">
  <a class="brand" href="index.html" aria-label="4M Gebäudetechnik GmbH, zur Startseite"><img class="logo-light" src="assets/logo-horizontal.svg" alt="4M Gebäudetechnik GmbH" width="976" height="120"><img class="logo-dark" src="assets/logo-horizontal-dark.svg" alt="" width="976" height="120"></a>
  <nav aria-label="Hauptnavigation" style="margin-left:auto">
    <ul class="nav-links">
      {li}
    </ul>
  </nav>
  <div class="nav-cta"><a class="btn" href="{to(home, 'kontakt', anfrage)}">Anfrage senden</a></div>
  <button class="burger" type="button" aria-label="Menü" aria-expanded="false" aria-controls="sheet"><i class="ph ph-list" aria-hidden="true"></i></button>
</header>
<nav class="sheet" id="sheet" aria-label="Menü">
  <ul>
    {sheet}
  </ul>
  <a class="btn" href="{to(home, 'kontakt', anfrage)}">Anfrage senden</a>
</nav>
"""


def foot(home, anfrage=""):
    return f"""
<footer class="foot">
  <div class="wrap">
    <div class="foot-grid">
      <div>
        <img src="assets/logo-horizontal.svg" alt="4M Gebäudetechnik GmbH" width="976" height="120" loading="lazy">
        <p>Heizung, Klima und Sanitär in Offenbach am Main und im Rhein-Main-Gebiet.</p>
      </div>
      <div>
        <h4>Leistungen</h4>
        <ul>
          <li><a href="heizung.html">Heizung und Wärmepumpe</a></li>
          <li><a href="klima.html">Klima</a></li>
          <li><a href="sanitaer.html">Sanitär</a></li>
        </ul>
      </div>
      <div>
        <h4>Seite</h4>
        <ul>
          <li><a href="{to(home, 'ablauf')}">Ablauf</a></li>
          <li><a href="{to(home, 'einblicke')}">Einblicke</a></li>
          <li><a href="{to(home, 'ueber-uns')}">Über uns</a></li>
          <li><a href="{to(home, 'kontakt')}">Kontakt</a></li>
        </ul>
      </div>
      <div>
        <h4>Kontakt</h4>
        <ul>
          <li>Kaiserstraße 39</li>
          <li>63065 Offenbach am Main</li>
          <li><a href="{TEL}">[Telefonnummer]</a></li>
          <li><a href="mailto:[E-Mail]">[E-Mail-Adresse]</a></li>
        </ul>
      </div>
    </div>
    <div class="foot-bottom">
      <span>© <span data-year>2026</span> 4M Gebäudetechnik GmbH</span>
      <span><a href="impressum.html">Impressum</a> &nbsp; <a href="datenschutz.html">Datenschutz</a></span>
    </div>
  </div>
</footer>

<div class="callbar">
  <a class="btn btn-ghost" href="{TEL}"><i class="ph ph-phone" aria-hidden="true"></i> Anrufen</a>
  <a class="btn" href="{to(home, 'kontakt', anfrage)}">Anfrage senden</a>
</div>
</body>
</html>
"""


def chips(items):
    return "".join(f"<li>{i}</li>" for i in items)


# ---------------- Startseite ----------------
STEPS = [
    ("heat", "01 / 03", "Heizung und Wärmepumpe", "Die Wärmepumpe holt Wärme aus der Außenluft, der Speicher hält sie vor, Heizkörper oder Fußbodenheizung geben sie an die Räume ab.",
     ["Luft-Wasser-Wärmepumpe", "Heizungstausch", "Hydraulischer Abgleich"], "heizung.html", "Mehr zur Heizung"),
    ("cool", "02 / 03", "Klima", "Das Außengerät führt die Wärme nach draußen, das Innengerät kühlt leise und ohne Zugluft. Im Winter heizt dieselbe Anlage.",
     ["Split", "Multi-Split", "Gewerbe"], "klima.html", "Mehr zur Klimatechnik"),
    ("water", "03 / 03", "Sanitär", "Kaltwasser kommt vom Hausanschluss, Warmwasser aus dem Speicher. Wir verlegen beides bis zu Dusche und Waschtisch.",
     ["Badsanierung", "Trinkwasser", "Warmwasser"], "sanitaer.html", "Mehr zum Sanitär"),
]

panels = "\n".join(f"""          <div class="panel" data-k="{k}">
            <p class="eyebrow">{no}</p>
            <h2>{h}</h2>
            <p class="txt">{t}</p>
            <ul class="chips">{chips(c)}</ul>
            <a class="btn btn-light" href="{href}">{more} <i class="ph ph-arrow-right" aria-hidden="true"></i></a>
          </div>""" for k, no, h, t, c, href, more in STEPS)

SVCS = [
    ("01", "Heizung und Wärmepumpe", "Neue Heizung, Umstieg auf die Wärmepumpe oder Modernisierung der bestehenden Anlage.",
     ["Wärmepumpen", "Heizungstausch", "Fußbodenheizung", "Abgleich"], "heizung.html", "images/heizung.webp", "Wärmepumpe vor einem modernen Haus"),
    ("02", "Klima", "Kühlen und Heizen mit Split- und Multi-Split-Geräten, für einzelne Räume bis zu ganzen Büros.",
     ["Split", "Multi-Split", "Gewerbe", "Wartung"], "klima.html", "images/klima.webp", "Klimagerät an einer hellen Wand"),
    ("03", "Sanitär", "Bäder und Trinkwasserinstallation, von der einzelnen Leitung bis zur kompletten Badsanierung.",
     ["Badsanierung", "Barrierearm", "Trinkwasser", "Warmwasser"], "sanitaer.html", "images/sanitaer.webp", "Modernes Bad mit begehbarer Dusche und Doppelwaschtisch"),
]
svcs = "\n".join(f"""        <article class="svc rv">
          <div class="svc-body">
            <p class="eyebrow">{no}</p>
            <h3>{h}</h3>
            <p>{t}</p>
            <ul class="chips">{chips(c)}</ul>
            <div class="more"><a class="btn btn-ghost btn-sm" href="{href}">Mehr erfahren <i class="ph ph-arrow-right" aria-hidden="true"></i></a></div>
          </div>
          <div class="svc-img"><img data-slot src="{img}" alt="{alt}" width="2400" height="1800" loading="lazy"><span class="ph-note"><i class="ph ph-camera" aria-hidden="true"></i>Foto folgt</span></div>
        </article>""" for no, h, t, c, href, img, alt in SVCS)

INDEX = head("4M Gebäudetechnik GmbH | Heizung, Klima und Sanitär in Offenbach am Main",
             "Heizung und Wärmepumpe, Klimaanlagen, Bad und Sanitär: Planung, Einbau und Wartung durch die 4M Gebäudetechnik GmbH in Offenbach am Main und im Rhein-Main-Gebiet.",
             three=True, extra="""
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"HVACBusiness","name":"4M Gebäudetechnik GmbH","description":"Heizung, Klima und Sanitär: Planung, Einbau und Wartung.","address":{"@type":"PostalAddress","streetAddress":"Kaiserstraße 39","postalCode":"63065","addressLocality":"Offenbach am Main","addressCountry":"DE"},"areaServed":"Rhein-Main-Gebiet","openingHours":"Mo-Fr 08:00-17:00","logo":"assets/logo-full.png"}
</script>""") + nav(True) + f"""
<main id="main">

  <!-- Bühne: das Haus als 3D-Anlagenschema, Scrollen führt durch die drei Gewerke -->
  <div class="story" data-step="intro">
    <div class="stage">
      <section class="hero" aria-label="Heizung, Klima und Sanitär">
        <div class="house" data-house="story"></div>
        <div class="panels">
          <div class="panel panel-intro">
            <p class="kicker">Fachbetrieb in Offenbach am Main</p>
            <h1><span><i>Heizung.</i></span><span><i>Klima.</i></span><span><i>Sanitär.</i></span></h1>
            <p class="lead">Planung, Einbau und Wartung für Wohnhäuser und Gewerbe in Offenbach und im Rhein-Main-Gebiet.</p>
            <div class="cta">
              <a class="btn btn-light" href="#kontakt">Anfrage senden <i class="ph ph-arrow-right" aria-hidden="true"></i></a>
              <a class="btn btn-ghost inv" href="{TEL}"><i class="ph ph-phone" aria-hidden="true"></i> Anrufen</a>
            </div>
          </div>
{panels}
        </div>
        <div class="seg" role="group" aria-label="Gewerk zeigen">
          <span class="thumb" aria-hidden="true"></span>
          <button type="button" data-k="heat" aria-pressed="false"><i class="ph ph-flame" aria-hidden="true"></i>Heizung</button>
          <button type="button" data-k="cool" aria-pressed="false"><i class="ph ph-snowflake" aria-hidden="true"></i>Klima</button>
          <button type="button" data-k="water" aria-pressed="false"><i class="ph ph-drop" aria-hidden="true"></i>Sanitär</button>
        </div>
        <p class="hint" aria-hidden="true"><i class="ph ph-arrow-down"></i>Scrollen</p>
      </section>
    </div>
  </div>

  <!-- Leistungen -->
  <section class="sec" id="leistungen">
    <div class="wrap">
      <div class="kopf rv">
        <h2>Leistungen</h2>
        <p>Drei Gewerke, ein Ansprechpartner. Von der Planung über den Einbau bis zur Wartung.</p>
      </div>
      <div class="svcs">
{svcs}
      </div>
      <div class="minis">
        <div class="mini rv"><span class="ic"><i class="ph ph-wrench" aria-hidden="true"></i></span><h3>Wartung und Reparatur</h3><p>Regelmäßige Wartung und schnelle Hilfe bei Störungen.</p></div>
        <div class="mini rv"><span class="ic"><i class="ph ph-file-text" aria-hidden="true"></i></span><h3>Förderung</h3><p>Wir prüfen Zuschüsse für Ihr Vorhaben und helfen beim Antrag.</p></div>
        <div class="mini rv"><span class="ic"><i class="ph ph-buildings" aria-hidden="true"></i></span><h3>Gewerbe</h3><p>Büros, Praxen, Läden und Gastronomie.</p></div>
      </div>
      <div class="brands rv">
        <p>Herstellerunabhängig, unter anderem mit Geräten von</p>
        <span>Mitsubishi Heavy Industries</span><span>Daikin</span><span>Vaillant</span><span>Viessmann</span><span>Bosch</span><span>Panasonic</span>
      </div>
    </div>
  </section>

  <!-- Ablauf -->
  <section class="box box-dark" id="ablauf">
    <div class="wrap">
      <div class="kopf rv">
        <h2>So läuft ein Auftrag ab</h2>
        <p>Vier Schritte, ein fester Ansprechpartner.</p>
      </div>
      <div class="steps-wrap">
        <div class="track" aria-hidden="true"><i></i></div>
        <ol class="steps">
          <li class="step"><span class="no">01</span><h3>Anfrage</h3><p>Per Formular oder Telefon. Wir melden uns zeitnah zurück.</p></li>
          <li class="step"><span class="no">02</span><h3>Termin vor Ort</h3><p>Wir sehen uns Gebäude und Anlage an und nehmen alle Maße auf.</p></li>
          <li class="step"><span class="no">03</span><h3>Angebot</h3><p>Schriftlich und nachvollziehbar, mit klarer Leistungsbeschreibung.</p></li>
          <li class="step"><span class="no">04</span><h3>Einbau</h3><p>Montage, Inbetriebnahme und Einweisung. Alle Unterlagen inklusive.</p></li>
        </ol>
      </div>
      <p class="after"><i class="ph ph-arrows-clockwise" aria-hidden="true"></i><span><strong>Danach:</strong> Wartung und Service, damit die Anlage effizient bleibt.</span></p>
    </div>
  </section>

  <!-- Einblicke -->
  <section class="sec" id="einblicke">
    <div class="wrap">
      <div class="kopf rv">
        <h2>Einblicke</h2>
        <p>Aus unseren Projekten in Offenbach und Umgebung.</p>
      </div>
      <div class="bento">
        <figure class="tile t1 rv"><img data-slot src="images/projekt-1.webp" alt="Wärmepumpe an einem Einfamilienhaus" width="2400" height="1600" loading="lazy"><span class="ph-note"><i class="ph ph-camera" aria-hidden="true"></i>Foto folgt</span><figcaption>Wärmepumpe</figcaption></figure>
        <figure class="tile t2 rv"><img data-slot src="images/projekt-2.webp" alt="Gedämmte Heizungsleitungen mit Manometer" width="2400" height="1600" loading="lazy"><span class="ph-note"><i class="ph ph-camera" aria-hidden="true"></i>Foto folgt</span><figcaption>Heizungsraum</figcaption></figure>
        <figure class="tile t3 rv"><img data-slot src="images/projekt-3.webp" alt="Bad mit Doppelwaschtisch und freistehender Wanne" width="2400" height="1600" loading="lazy"><span class="ph-note"><i class="ph ph-camera" aria-hidden="true"></i>Foto folgt</span><figcaption>Bad</figcaption></figure>
        <div class="tile t4 rv"><p>Ihr Vorhaben als Nächstes?</p><a href="#kontakt">Anfrage senden <i class="ph ph-arrow-right" aria-hidden="true"></i></a></div>
        <figure class="tile t5 rv"><img data-slot src="images/projekt-5.webp" alt="Bodengleiche Dusche mit dunklen Fliesen und Regendusche" width="2400" height="1600" loading="lazy"><span class="ph-note"><i class="ph ph-camera" aria-hidden="true"></i>Foto folgt</span><figcaption>Dusche</figcaption></figure>
        <figure class="tile t6 rv"><img data-slot src="images/projekt-4.webp" alt="Heizkörper unter einem Fenster" width="2400" height="1597" loading="lazy"><span class="ph-note"><i class="ph ph-camera" aria-hidden="true"></i>Foto folgt</span><figcaption>Heizkörper</figcaption></figure>
      </div>
    </div>
  </section>

  <!-- Über uns -->
  <section class="sec" id="ueber-uns" style="padding-top:0">
    <div class="wrap about">
      <div class="about-pic rv"><img data-slot src="images/werkstatt.webp" alt="Neu verlegte Kupferleitungen in einer offenen Wand" width="2400" height="3600" loading="lazy"><span class="ph-note"><i class="ph ph-camera" aria-hidden="true"></i>Foto folgt</span></div>
      <div class="about-txt rv">
        <div>
          <h2>Über uns</h2>
          <p>Die 4M Gebäudetechnik GmbH ist ein Fachbetrieb für Heizung, Klima und Sanitär mit Sitz in Offenbach am Main. Wir planen, bauen ein und warten, für Privatkunden, Vermieter und Gewerbe.</p>
        </div>
        <dl class="facts">
          <div><dt>Sitz</dt><dd>Offenbach am Main</dd></div>
          <div><dt>Gewerke</dt><dd>Heizung, Klima, Sanitär</dd></div>
          <div><dt>Einsatzgebiet</dt><dd>Offenbach, Frankfurt, Rhein-Main</dd></div>
          <div><dt>Gegründet</dt><dd>[Gründungsjahr]</dd></div>
          <div><dt>Geschäftsführung</dt><dd>[Name]</dd></div>
          <div><dt>Bürozeiten</dt><dd>Mo bis Fr, 8 bis 17 Uhr</dd></div>
        </dl>
      </div>
    </div>
  </section>

  <!-- Kontakt -->
  <section class="box box-dark contact" id="kontakt">
    <div class="wrap contact-grid">
      <div class="rv">
        <h2>Kontakt</h2>
        <p class="lead">Schreiben Sie uns kurz, worum es geht. Wir melden uns mit einem Terminvorschlag.</p>
        <ul class="cinfo">
          <li><span class="ic"><i class="ph ph-phone" aria-hidden="true"></i></span><div><small>Telefon</small><a href="{TEL}">[Telefonnummer]</a></div></li>
          <li><span class="ic"><i class="ph ph-envelope-simple" aria-hidden="true"></i></span><div><small>E-Mail</small><a href="mailto:[E-Mail]">[E-Mail-Adresse]</a></div></li>
          <li><span class="ic"><i class="ph ph-map-pin" aria-hidden="true"></i></span><div><small>Adresse</small><a href="https://www.google.com/maps/search/?api=1&amp;query=Kaiserstra%C3%9Fe+39+63065+Offenbach+am+Main" target="_blank" rel="noopener">Kaiserstraße 39, 63065 Offenbach am Main</a></div></li>
          <li><span class="ic"><i class="ph ph-clock" aria-hidden="true"></i></span><div><small>Bürozeiten</small><span class="v">Montag bis Freitag, 8 bis 17 Uhr</span></div></li>
        </ul>
      </div>

      <div class="form rv">
        <form id="anfrage" novalidate data-mail="[E-Mail]">
          <div class="form-fields">
            <h3>Anfrage senden</h3>
            <div class="frow">
              <div class="field"><label for="f-name">Name</label><input id="f-name" name="name" autocomplete="name" required><span class="err" data-err="name"></span></div>
              <div class="field"><label for="f-kontakt">Telefon oder E-Mail</label><input id="f-kontakt" name="kontakt" autocomplete="email" required><span class="err" data-err="kontakt"></span></div>
            </div>
            <div class="frow">
              <div class="field">
                <label for="f-anliegen">Anliegen</label>
                <div class="selwrap">
                  <select id="f-anliegen" name="anliegen">
                    <option value="heizung">Heizung oder Wärmepumpe</option>
                    <option value="klima">Klimaanlage</option>
                    <option value="sanitaer">Bad oder Sanitär</option>
                    <option value="wartung">Wartung oder Reparatur</option>
                    <option value="sonstiges">Sonstiges</option>
                  </select>
                  <i class="ph ph-caret-down" aria-hidden="true"></i>
                </div>
              </div>
              <div class="field"><label for="f-ort">Ort <span class="opt">(optional)</span></label><input id="f-ort" name="ort" autocomplete="address-level2" placeholder="z. B. Offenbach"></div>
            </div>
            <div class="field"><label for="f-nachricht">Nachricht</label><textarea id="f-nachricht" name="nachricht" required placeholder="Was ist geplant? Gebäude, Baujahr, Wunschtermin"></textarea><span class="err" data-err="nachricht"></span></div>
            <label class="chk"><input type="checkbox" name="datenschutz" required><span>Ich bin einverstanden, dass meine Angaben zur Bearbeitung der Anfrage verwendet werden. Mehr in der <a href="datenschutz.html">Datenschutzerklärung</a>.</span></label>
            <span class="err" data-err="datenschutz" style="display:block;margin:-10px 0 16px"></span>
            <button class="btn btn-light" type="submit">Anfrage senden <i class="ph ph-paper-plane-tilt" aria-hidden="true"></i></button>
            <p class="form-note">Ihr E-Mail-Programm öffnet sich mit der fertigen Nachricht.</p>
          </div>
          <div class="form-ok" role="status">
            <i class="ph ph-check-circle" aria-hidden="true"></i>
            <h3>Danke für Ihre Anfrage.</h3>
            <p>Bitte senden Sie die vorbereitete E-Mail ab. Wir melden uns so schnell wie möglich.</p>
          </div>
        </form>
      </div>
    </div>
  </section>
</main>
""" + foot(True)
(OUT / "index.html").write_text(INDEX, encoding="utf-8")


# ---------------- Gewerke-Seiten ----------------
SEG = [("heat", "heizung.html", "ph-flame", "Heizung"), ("cool", "klima.html", "ph-snowflake", "Klima"), ("water", "sanitaer.html", "ph-drop", "Sanitär")]


def seg(active):
    out = []
    for k, href, icon, label in SEG:
        cur = ' aria-current="page"' if k == active else ""
        out.append(f'<a href="{href}"{cur}><i class="ph {icon}" aria-hidden="true"></i>{label}</a>')
    return "\n          ".join(out)


def groups(items):
    return "\n".join(f'        <div class="group rv"><h3>{t}</h3><p>{x}</p><ul class="chips">{chips(pts)}</ul></div>' for t, x, pts in items)


def devices(items, src):
    if not items:
        return ""
    cards = "\n".join(f'        <article class="device rv"><small>{mk}</small><h3>{n}</h3><p>{x}</p><ul class="chips">{chips(sp)}</ul></article>' for mk, n, x, sp in items)
    return f"""
  <section class="box box-dark">
    <div class="wrap">
      <div class="kopf rv"><h2>Geräte</h2><p>Wir beraten herstellerunabhängig. Häufig eingesetzt:</p></div>
      <div class="devices">
{cards}
      </div>
      <p class="src">{src}</p>
    </div>
  </section>"""


def trade_page(p):
    anfrage = f"?anliegen={p['anliegen']}"
    body = f"""
<main id="main">
  <div class="page-stage">
    <section class="hero page" aria-label="{p['h1']}">
      <div class="house" data-house="{p['k']}"></div>
      <div class="panels">
        <div class="panel">
          <p class="crumbs"><a href="index.html">Start</a> / {p['crumb']}</p>
          <h1>{p['h1']}</h1>
          <p class="lead">{p['lead']}</p>
          <div class="cta">
            <a class="btn btn-light" href="{to(False, 'kontakt', anfrage)}">Anfrage senden <i class="ph ph-arrow-right" aria-hidden="true"></i></a>
            <a class="btn btn-ghost inv" href="{TEL}"><i class="ph ph-phone" aria-hidden="true"></i> Anrufen</a>
          </div>
        </div>
      </div>
      <nav class="seg" aria-label="Gewerke">
          <span class="thumb" aria-hidden="true"></span>
          {seg(p['k'])}
      </nav>
    </section>
  </div>

  <section class="sec">
    <div class="wrap">
      <div class="kopf rv"><h2>Leistungsumfang</h2><p>{p['intro']}</p></div>
      <div class="groups">
{groups(p['groups'])}
      </div>
    </div>
  </section>
{devices(p.get('devices'), p.get('src', ''))}
  <section class="sec">
    <div class="wrap">
      <div class="note-band rv">
        <div><h2>{p['band'][0]}</h2><p>{p['band'][1]}</p></div>
        <a class="btn" href="{to(False, 'kontakt', anfrage)}">Anfrage senden</a>
      </div>
    </div>
  </section>
</main>
"""
    html = head(p["title"], p["desc"], three=True) + nav(False, anfrage) + body + foot(False, anfrage)
    (OUT / p["file"]).write_text(html, encoding="utf-8")


PAGES = [
    dict(file="heizung.html", k="heat", anliegen="heizung", crumb="Heizung und Wärmepumpe",
         title="Heizung und Wärmepumpe in Offenbach | 4M Gebäudetechnik GmbH",
         desc="Wärmepumpe, Heizungstausch, Heizkörper, Fußbodenheizung und Wartung in Offenbach und im Rhein-Main-Gebiet.",
         h1="Heizung und Wärmepumpe", intro="Von der Heizlastberechnung bis zur Wartung.",
         lead="Heizungen, die zum Haus passen. Mit Heizlastberechnung, sauberem Einbau und Wartung.",
         groups=[
             ("Wärmepumpe", "Luft-Wasser-Wärmepumpen für Neubau und Bestand.",
              ["Heizlastberechnung", "Auslegung des Geräts", "Aufstellung und Anschluss", "Speicher und Warmwasser"]),
             ("Heizungstausch", "Wenn die alte Gas- oder Ölheizung ersetzt werden soll.",
              ["Bestandsaufnahme", "Ausbau der Altanlage", "Umstieg auf die Wärmepumpe", "Einweisung"]),
             ("Wärmeverteilung", "Damit die Wärme gleichmäßig in jedem Raum ankommt.",
              ["Heizkörper", "Fußbodenheizung", "Pumpen und Regelung", "Hydraulischer Abgleich"]),
             ("Wartung und Service", "Für eine Anlage, die zuverlässig und sparsam läuft.",
              ["Regelmäßige Wartung", "Störungsbehebung", "Regelung anpassen", "Dokumentation"]),
         ],
         devices=[
             ("Mitsubishi Heavy Industries", "Hydrolution EZY", "Monoblock-Wärmepumpe: Die Kältetechnik sitzt komplett im Außengerät, ins Haus führen nur Wasserleitungen.",
              ["6 bis 14,5 kW Heizen", "Betrieb bis −25 °C", "WLAN"]),
             ("Weitere Hersteller", "Daikin, Vaillant, Viessmann, Bosch, Panasonic", "Welches Gerät passt, entscheidet die Heizlast Ihres Hauses, nicht die Marke.",
              ["Herstellerunabhängig"]),
         ],
         src="Geräteangaben laut Hersteller.",
         band=("Förderung für Wärmepumpen", "Für den Umstieg auf eine Wärmepumpe gibt es staatliche Zuschüsse. Wir prüfen, was für Ihr Haus infrage kommt, und unterstützen Sie beim Antrag.")),

    dict(file="klima.html", k="cool", anliegen="klima", crumb="Klima",
         title="Klimaanlagen in Offenbach | 4M Gebäudetechnik GmbH",
         desc="Split- und Multi-Split-Klimaanlagen für Wohnung, Haus und Gewerbe. Planung, Einbau und Wartung in Offenbach und im Rhein-Main-Gebiet.",
         h1="Klimaanlagen", intro="Für Wohnräume, Büros und ganze Gebäude.",
         lead="Kühlen im Sommer, heizen in der Übergangszeit. Leise Geräte, sauber verlegt.",
         groups=[
             ("Wohnung und Haus", "Für Schlafzimmer, Wohnräume und Dachgeschoss.",
              ["Split-Geräte", "Multi-Split", "Unauffällige Leitungen", "Bedienung per App"]),
             ("Gewerbe", "Für Büros, Praxen, Läden und Gastronomie.",
              ["Deckenkassetten", "VRF-Systeme", "Zonenregelung", "Abstimmung mit Verwaltung"]),
             ("Planung", "Bevor ein Gerät hängt, rechnen wir.",
              ["Kühllastberechnung", "Standort Außengerät", "Schall und Optik", "Schriftliches Angebot"]),
             ("Wartung", "Damit die Anlage hygienisch und effizient bleibt.",
              ["Reinigung", "Filterwechsel", "Dichtheitsprüfung", "Störungsbehebung"]),
         ],
         devices=[
             ("Mitsubishi Heavy Industries", "Premium Pro SRK-ZT", "Wandgerät für Wohnräume, in drei Gehäusefarben.",
              ["2 bis 5 kW", "bis A+++", "ab 19 dB(A)", "WLAN"]),
             ("Mitsubishi Heavy Industries", "SCM Multi-Split", "Ein Außengerät versorgt je nach Modell zwei bis sechs Innengeräte, jedes einzeln geregelt.",
              ["3 bis 12,5 kW", "2 bis 6 Innengeräte"]),
             ("Gewerbe", "PAC- und VRF-Systeme", "Zentrale Klimatisierung für Büro, Hotel und Handel.",
              ["Deckenkassetten", "Zonenregelung"]),
         ],
         src="Geräteangaben laut Hersteller.",
         band=("Wir kommen vorbei und messen auf.", "Danach wissen Sie, welches Gerät passt, wo es hinkommt und was es kostet.")),

    dict(file="sanitaer.html", k="water", anliegen="sanitaer", crumb="Sanitär",
         title="Sanitär und Badsanierung in Offenbach | 4M Gebäudetechnik GmbH",
         desc="Badsanierung, barrierearme Bäder, Trinkwasserleitungen und Warmwasser in Offenbach und im Rhein-Main-Gebiet.",
         h1="Sanitär und Bad", intro="Vom Hausanschluss bis zur Armatur.",
         lead="Neue Bäder, Trinkwasserleitungen und Warmwasser. Geplant, abgestimmt und sauber ausgeführt.",
         groups=[
             ("Badsanierung", "Vom alten Bad zum neuen, mit einem Ansprechpartner.",
              ["Planung vor Ort", "Rückbau", "Vorwandinstallation", "Dusche, WC, Waschtisch"]),
             ("Barrierearme Bäder", "Für mehr Komfort und Sicherheit im Alltag.",
              ["Bodengleiche Duschen", "Haltegriffe", "Mehr Bewegungsfläche", "Unterfahrbare Waschtische"]),
             ("Trinkwasser", "Saubere Leitungen vom Hausanschluss bis zur Armatur.",
              ["Leitungen ersetzen", "Hauswasserstation", "Druckminderer", "Leckage-Schutz"]),
             ("Warmwasser", "Warmwasser, das zur Heizung passt.",
              ["Speicher", "Durchlauferhitzer", "Über die Wärmepumpe", "Zirkulation"]),
         ],
         band=("Ein Ansprechpartner für das ganze Bad.", "Wir stimmen die Arbeiten rund um Ihr Bad ab, damit Termine und Details zusammenpassen.")),
]
for p in PAGES:
    trade_page(p)


# ---------------- Rechtstexte ----------------
LEGAL_IMP = """
<main id="main">
  <section class="sec" style="padding-top:0">
    <div class="wrap legal">
      <p class="crumbs"><a href="index.html">Start</a> / Impressum</p>
      <h1>Impressum</h1>
      <div class="todo">Hinweis für die Vorschau: Alle Angaben in eckigen Klammern bitte durch die echten Daten ersetzen und vor Veröffentlichung prüfen lassen.</div>
      <h2>Angaben gemäß § 5 DDG</h2>
      <p>4M Gebäudetechnik GmbH<br>Kaiserstraße 39<br>63065 Offenbach am Main</p>
      <h2>Vertreten durch</h2>
      <p>[Name der Geschäftsführung]</p>
      <h2>Kontakt</h2>
      <p>Telefon: [Telefonnummer]<br>E-Mail: [E-Mail-Adresse]</p>
      <h2>Registereintrag</h2>
      <p>Eintragung im Handelsregister<br>Registergericht: [Amtsgericht]<br>Registernummer: [HRB]</p>
      <h2>Umsatzsteuer-ID</h2>
      <p>Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz: [DE...]</p>
      <h2>Berufsrechtliche Angaben</h2>
      <p>Zuständige Handwerkskammer: [Handwerkskammer]<br>Eintragung in die Handwerksrolle: [Gewerke, Nummer]</p>
      <h2>Verbraucherstreitbeilegung</h2>
      <p>Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
      <h2>Haftung für Inhalte</h2>
      <p>Als Diensteanbieter sind wir für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Wir sind jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen.</p>
      <h2>Haftung für Links</h2>
      <p>Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Für diese Inhalte ist stets der jeweilige Anbieter verantwortlich.</p>
      <h2>Urheberrecht</h2>
      <p>Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht.</p>
      <h2>Bildnachweis</h2>
      <p>Fotos: Unsplash (Unsplash-Lizenz). alpha innotec, Illia Horokhovsky, Peter Muniz, Fabian Kleiser, Ibrar Tariq, e24, immo RENOVATION, Kelsey Todd.</p>
    </div>
  </section>
</main>
"""

LEGAL_DS = """
<main id="main">
  <section class="sec" style="padding-top:0">
    <div class="wrap legal">
      <p class="crumbs"><a href="index.html">Start</a> / Datenschutz</p>
      <h1>Datenschutzerklärung</h1>
      <div class="todo">Hinweis für die Vorschau: Textbausteine, vor Veröffentlichung an Hosting und tatsächliche Abläufe anpassen und rechtlich prüfen lassen.</div>
      <h2>1. Verantwortlicher</h2>
      <p>4M Gebäudetechnik GmbH, Kaiserstraße 39, 63065 Offenbach am Main<br>Telefon: [Telefonnummer], E-Mail: [E-Mail-Adresse]</p>
      <h2>2. Hosting</h2>
      <p>Diese Website wird bei [Hosting-Anbieter] gehostet. Beim Aufruf werden technisch notwendige Daten (zum Beispiel IP-Adresse, Datum und Uhrzeit, aufgerufene Seite, Browser) in Server-Logfiles verarbeitet. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO; unser berechtigtes Interesse liegt im sicheren und stabilen Betrieb der Website.</p>
      <h2>3. Kontaktaufnahme</h2>
      <p>Wenn Sie uns per Telefon, E-Mail oder über das Anfrageformular kontaktieren, verarbeiten wir Ihre Angaben zur Bearbeitung der Anfrage (Art. 6 Abs. 1 lit. b DSGVO). Das Formular öffnet Ihr eigenes E-Mail-Programm mit einer vorbereiteten Nachricht; auf dieser Website selbst werden dabei keine Daten gespeichert.</p>
      <h2>4. Schriften, Symbole und 3D-Darstellung</h2>
      <p>Für die Darstellung laden wir die Schrift „Geist“ über Google Fonts (Google Ireland Limited), Symbole über das Content-Delivery-Netzwerk unpkg und die 3D-Bibliothek three.js über jsDelivr. Dabei wird Ihre IP-Adresse an diese Anbieter übertragen. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. [Empfehlung: Schrift, Symbole und Bibliothek vor Veröffentlichung lokal einbinden, dann entfällt dieser Abschnitt.]</p>
      <h2>5. Lokale Speicherung</h2>
      <p>Die Vorschau merkt sich für die Dauer der Browsersitzung, dass der Zugangscode eingegeben wurde (Session Storage). Es werden keine Cookies zu Analyse- oder Werbezwecken gesetzt.</p>
      <h2>6. Ihre Rechte</h2>
      <p>Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch sowie das Recht auf Beschwerde bei einer Aufsichtsbehörde, zum Beispiel beim Hessischen Beauftragten für Datenschutz und Informationsfreiheit.</p>
      <h2>7. Speicherdauer</h2>
      <p>Wir speichern personenbezogene Daten nur so lange, wie es für den jeweiligen Zweck erforderlich ist oder gesetzliche Aufbewahrungsfristen bestehen.</p>
    </div>
  </section>
</main>
"""

for name, body, title in [("impressum.html", LEGAL_IMP, "Impressum"), ("datenschutz.html", LEGAL_DS, "Datenschutz")]:
    html = head(f"{title} | 4M Gebäudetechnik GmbH", f"{title} der 4M Gebäudetechnik GmbH, Offenbach am Main.") + nav(False) + body + foot(False)
    (OUT / name).write_text(html, encoding="utf-8")

print("ok")
