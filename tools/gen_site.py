# Erzeugt alle Seiten als statische HTML-Dateien.
# Alle Texte stehen in content/*.json und werden im Netlify-CMS (/admin) bearbeitet.
# Netlify führt beim Veröffentlichen `python3 tools/gen_site.py` aus (siehe netlify.toml).
import html
import json
import pathlib
import re

OUT = pathlib.Path(__file__).resolve().parent.parent
CONTENT = OUT / "content"
V = "20261105a"  # bei jeder Änderung an CSS/JS erhöhen, damit Browser nicht die alte Datei aus dem Cache nehmen


def load(name):
    return json.loads((CONTENT / f"{name}.json").read_text(encoding="utf-8"))


SITE = load("site")
TEL = "tel:" + SITE["telefon_link"]
FIRMA_RAW = SITE["firma"]


def tok(s):
    """Ersetzt {{firma}}, {{telefon}}, {{email}}, {{strasse}}, {{plz}}, {{ort}}, ... durch die Werte aus content/site.json."""
    return re.sub(r"\{\{(\w+)\}\}", lambda m: str(SITE.get(m.group(1), m.group(0))), s or "")


def e(s):
    """Text aus dem CMS: Platzhalter ersetzen und HTML-Sonderzeichen maskieren (für Fließtext und Attribute)."""
    return html.escape(tok(s), quote=True)


def eb(s):
    """Wie e(), dazu Zeilenumbrüche als <br>."""
    return e(s).replace("\r\n", "\n").replace("\n", "<br>")


FIRMA = e(FIRMA_RAW)
TAGLINE = e(SITE["tagline"])
ADRESSE = f'{SITE["strasse"]}, {SITE["plz"]} {SITE["ort"]}'
MAPS = "https://www.google.com/maps/search/?api=1&amp;query=" + html.escape(
    __import__("urllib.parse", fromlist=["quote_plus"]).quote_plus(ADRESSE), quote=True)

THREE = """<script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/"}}</script>
<script type="module" src="assets/house3d.js?v=__V__"></script>""".replace("__V__", V)

# Einladungs- und Passwort-Links von Netlify Identity landen auf der Startseite; von dort weiter ins CMS.
IDENTITY = """<script>if(/(invite|recovery|confirmation)_token=/.test(location.hash)){location.replace("/admin/"+location.hash)}</script>"""


def head(title, desc, three=False, extra=""):
    return f"""<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{e(title)}</title>
<meta name="description" content="{e(desc)}">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#F5F5F7">
<meta property="og:title" content="{FIRMA}">
<meta property="og:description" content="{TAGLINE}">
<meta property="og:image" content="assets/logo-full.png">
<link rel="icon" href="assets/icon.svg" type="image/svg+xml">
<link rel="icon" href="assets/favicon.png" type="image/png" sizes="64x64">
<link rel="apple-touch-icon" href="assets/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/regular/style.css">
<link rel="stylesheet" href="assets/site.css?v={V}">
{IDENTITY}
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


TRADES = [("heizung.html", "ph-flame", "Heizung und Wärmepumpe", "Wärmepumpe, Heizungstausch, Wartung", "Heizung"),
          ("klima.html", "ph-snowflake", "Klima", "Split, Multi-Split, Gewerbe", "Klima"),
          ("sanitaer.html", "ph-drop", "Sanitär und Bad", "Badsanierung, Trinkwasser, Warmwasser", "Sanitär")]


def nav(home, anfrage="", cur=None):
    """Glas-Navigation. cur = Dateiname der aktuellen Unterseite (für die Markierung im Menü)."""
    start = "#main" if home else "index.html"
    start_cur = ' aria-current="page"' if home else ""
    cc = lambda f: ' aria-current="page"' if f == cur else ""  # noqa: E731
    sections = [("ablauf", "Ablauf"), ("einblicke", "Einblicke"), ("ueber-uns", "Über uns"), ("kontakt", "Kontakt")]
    li = "\n      ".join(f'<li><a href="{to(home, a)}">{t}</a></li>' for a, t in sections)
    dd = "\n          ".join(
        f'<a href="{f}"{cc(f)}><span class="ic"><i class="ph {ic}" aria-hidden="true"></i></span><span><strong>{t}</strong><small>{sub}</small></span></a>'
        for f, ic, t, sub, short in TRADES)
    tiles = "\n      ".join(
        f'<a href="{f}"{cc(f)}><i class="ph {ic}" aria-hidden="true"></i>{short}</a>'
        for f, ic, t, sub, short in TRADES)
    sheet = "\n    ".join(f'<li><a href="{to(home, a)}">{t} <i class="ph ph-arrow-right" aria-hidden="true"></i></a></li>' for a, t in sections)
    return f"""
<header class="nav">
  <button class="burger" type="button" aria-label="Menü" aria-expanded="false" aria-controls="sheet"><i class="ph ph-list" aria-hidden="true"></i></button>
  <a class="brand" href="index.html" aria-label="{FIRMA}, zur Startseite"><img class="logo-light" src="assets/logo-horizontal.svg" alt="{FIRMA}" width="976" height="120"><img class="logo-dark" src="assets/logo-horizontal-dark.svg" alt="" width="976" height="120"></a>
  <nav aria-label="Hauptnavigation" style="margin-left:auto">
    <ul class="nav-links">
      <li><a href="{start}"{start_cur}>Start</a></li>
      <li class="dd">
        <button class="dd-btn" type="button" aria-expanded="false" aria-controls="dd-leistungen"{' data-cur' if cur else ''}>Leistungen <i class="ph ph-caret-down" aria-hidden="true"></i></button>
        <div class="dd-menu" id="dd-leistungen">
          {dd}
        </div>
      </li>
      {li}
    </ul>
  </nav>
  <div class="nav-cta"><a class="btn" href="{to(home, 'kontakt', anfrage)}">Anfrage starten</a></div>
  <a class="nav-home" href="{start}" aria-label="Start"{start_cur}><i class="ph ph-house" aria-hidden="true"></i></a>
</header>
<nav class="sheet" id="sheet" aria-label="Menü">
  <a class="sheet-start" href="{start}"{start_cur}><i class="ph ph-house" aria-hidden="true"></i>Start</a>
  <p class="sheet-label">Leistungen</p>
  <div class="sheet-tiles">
      {tiles}
  </div>
  <ul>
    {sheet}
  </ul>
  <a class="btn" href="{to(home, 'kontakt', anfrage)}">Anfrage starten</a>
</nav>
"""


def cta_band(anfrage):
    """Band „Bereit für Ihr Projekt?“ vor der Fußzeile (nur Unterseiten; auf der Startseite steht der Assistent direkt darüber)."""
    return f"""
<section class="cta-band" aria-label="{e(SITE['cta_titel'])}">
  <div class="wrap">
    <div class="cta-box">
      <div><h2>{e(SITE['cta_titel'])}</h2><p>{e(SITE['cta_text'])}</p></div>
      <div class="cta-btns">
        <a class="btn btn-light" href="{to(False, 'kontakt', anfrage)}">Anfrage starten <i class="ph ph-arrow-right" aria-hidden="true"></i></a>
        <a class="btn btn-ghost inv" href="{TEL}"><i class="ph ph-phone" aria-hidden="true"></i> Anrufen</a>
      </div>
    </div>
  </div>
</section>"""


def foot(home, anfrage=""):
    return ("" if home else cta_band(anfrage)) + f"""
<footer class="foot">
  <div class="wrap">
    <div class="foot-grid">
      <div>
        <img src="assets/logo-horizontal.svg" alt="{FIRMA}" width="976" height="120" loading="lazy">
        <p>{TAGLINE}</p>
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
          <li>{e(SITE['strasse'])}</li>
          <li>{e(SITE['plz'])} {e(SITE['ort'])}</li>
          <li><a href="{TEL}">{e(SITE['telefon'])}</a></li>
          <li><a href="mailto:{e(SITE['email'])}">{e(SITE['email'])}</a></li>
        </ul>
      </div>
    </div>
    <div class="foot-bottom">
      <span>© <span data-year>2026</span> {FIRMA}</span>
      <span><a href="impressum.html">Impressum</a> &nbsp; <a href="datenschutz.html">Datenschutz</a></span>
    </div>
  </div>
</footer>

<div class="callbar">
  <a class="btn btn-ghost" href="{TEL}"><i class="ph ph-phone" aria-hidden="true"></i> Anrufen</a>
  <a class="btn" href="{to(home, 'kontakt', anfrage)}">Anfrage starten</a>
</div>
</body>
</html>
"""


def chips(items):
    return "".join(f"<li>{e(i)}</li>" for i in items)


def slot(img, alt, w, h):
    return (f'<img data-slot src="{e(img)}" alt="{e(alt)}" width="{w}" height="{h}" loading="lazy">'
            '<span class="ph-note"><i class="ph ph-camera" aria-hidden="true"></i>Foto folgt</span>')


# ---------------- Startseite ----------------
C = load("startseite")
KEYS = ["heat", "cool", "water"]
HREFS = ["heizung.html", "klima.html", "sanitaer.html"]
H = C["hero"]

panels = "\n".join(f"""          <div class="panel" data-k="{k}">
            <p class="eyebrow">{e(p['nummer'])}</p>
            <h2>{e(p['titel'])}</h2>
            <p class="txt">{e(p['text'])}</p>
            <ul class="chips">{chips(p['chips'])}</ul>
            <a class="btn btn-light" href="{href}">{e(p['knopf'])} <i class="ph ph-arrow-right" aria-hidden="true"></i></a>
          </div>""" for k, href, p in zip(KEYS, HREFS, C["panels"]))

L = C["leistungen"]
svcs = "\n".join(f"""        <article class="svc rv">
          <div class="svc-body">
            <p class="eyebrow">{e(s['nummer'])}</p>
            <h3>{e(s['titel'])}</h3>
            <p>{e(s['text'])}</p>
            <ul class="chips">{chips(s['chips'])}</ul>
            <div class="more"><a class="btn btn-ghost btn-sm" href="{href}">Mehr erfahren <i class="ph ph-arrow-right" aria-hidden="true"></i></a></div>
          </div>
          <div class="svc-img">{slot(s['bild'], s['bild_alt'], 2400, 1800)}</div>
        </article>""" for href, s in zip(HREFS, L["items"]))

MINI_ICONS = ["ph-wrench", "ph-file-text", "ph-buildings"]
minis = "\n".join(
    f'        <div class="mini rv"><span class="ic"><i class="ph {ic}" aria-hidden="true"></i></span><h3>{e(m["titel"])}</h3><p>{e(m["text"])}</p></div>'
    for ic, m in zip(MINI_ICONS, L["minis"]))
marken = "".join(f"<span>{e(m)}</span>" for m in L["marken"])

A = C["ablauf"]
steps = "\n".join(
    f'          <li class="step"><span class="no">{i:02d}</span><h3>{e(s["titel"])}</h3><p>{e(s["text"])}</p></li>'
    for i, s in enumerate(A["schritte"], 1))

EB = C["einblicke"]
B = EB["bilder"]


def tile(cls, b, w=2400, h=1600):
    return (f'        <figure class="tile {cls} rv">{slot(b["bild"], b["alt"], w, h)}'
            f'<figcaption>{e(b["beschriftung"])}</figcaption></figure>')


bento = "\n".join([
    tile("t1", B[0]), tile("t2", B[1]), tile("t3", B[2]),
    f'        <div class="tile t4 rv"><p>{e(EB["cta_text"])}</p><a href="#kontakt">{e(EB["cta_knopf"])} <i class="ph ph-arrow-right" aria-hidden="true"></i></a></div>',
    tile("t5", B[3]), tile("t6", B[4], h=1597),
])

U = C["ueber"]
facts = "\n".join(f'          <div><dt>{e(f["label"])}</dt><dd>{e(f["wert"])}</dd></div>' for f in U["fakten"])
K = C["kontakt"]
R = load("rechner")


def tok_all(v):
    if isinstance(v, str):
        return tok(v)
    if isinstance(v, list):
        return [tok_all(x) for x in v]
    if isinstance(v, dict):
        return {k: tok_all(x) for k, x in v.items()}
    return v


WIZ_JSON = json.dumps(tok_all(R), ensure_ascii=False).replace("</", "<\\/")

JSONLD = json.dumps({
    "@context": "https://schema.org", "@type": "HVACBusiness", "name": FIRMA_RAW,
    "description": "Heizung, Klima und Sanitär: Planung, Einbau und Wartung.",
    "address": {"@type": "PostalAddress", "streetAddress": SITE["strasse"], "postalCode": SITE["plz"],
                "addressLocality": SITE["ort"], "addressCountry": "DE"},
    "areaServed": "Rhein-Main-Gebiet", "openingHours": "Mo-Fr 08:00-17:00", "logo": "assets/logo-full.png",
}, ensure_ascii=False)

INDEX = head(C["seo"]["titel"], C["seo"]["beschreibung"], three=True,
             extra=f'\n<script type="application/ld+json">\n{JSONLD}\n</script>') + nav(True) + f"""
<main id="main">

  <!-- Bühne: das Haus als 3D-Anlagenschema, Scrollen führt durch die drei Gewerke -->
  <div class="story" data-step="intro">
    <div class="stage">
      <section class="hero" aria-label="Heizung, Klima und Sanitär">
        <div class="house" data-house="story"></div>
        <div class="panels">
          <div class="panel panel-intro">
            <p class="kicker">{e(H['kicker'])}</p>
            <h1>{''.join(f'<span><i>{e(w)}</i></span>' for w in H['ueberschrift'])}</h1>
            <p class="lead">{e(H['lead'])}</p>
            <div class="cta">
              <a class="btn btn-light" href="#kontakt">{e(H['knopf'])} <i class="ph ph-arrow-right" aria-hidden="true"></i></a>
              <a class="btn btn-ghost inv" href="{TEL}"><i class="ph ph-phone" aria-hidden="true"></i> {e(H['knopf_anrufen'])}</a>
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
        <h2>{e(L['titel'])}</h2>
        <p>{e(L['text'])}</p>
      </div>
      <div class="svcs">
{svcs}
      </div>
      <div class="minis">
{minis}
      </div>
      <div class="brands rv">
        <p>{e(L['marken_text'])}</p>
        {marken}
      </div>
    </div>
  </section>

  <!-- Ablauf -->
  <section class="box box-dark" id="ablauf">
    <div class="wrap">
      <div class="kopf rv">
        <h2>{e(A['titel'])}</h2>
        <p>{e(A['text'])}</p>
      </div>
      <div class="steps-wrap">
        <div class="track" aria-hidden="true"><i></i></div>
        <ol class="steps">
{steps}
        </ol>
      </div>
      <p class="after"><i class="ph ph-arrows-clockwise" aria-hidden="true"></i><span><strong>{e(A['danach_label'])}</strong> {e(A['danach_text'])}</span></p>
    </div>
  </section>

  <!-- Einblicke -->
  <section class="sec" id="einblicke">
    <div class="wrap">
      <div class="kopf rv">
        <h2>{e(EB['titel'])}</h2>
        <p>{e(EB['text'])}</p>
      </div>
      <div class="bento">
{bento}
      </div>
    </div>
  </section>

  <!-- Über uns -->
  <section class="sec" id="ueber-uns" style="padding-top:0">
    <div class="wrap about">
      <div class="about-pic rv">{slot(U['bild'], U['bild_alt'], 2400, 3600)}</div>
      <div class="about-txt rv">
        <div>
          <h2>{e(U['titel'])}</h2>
          <p>{e(U['text'])}</p>
        </div>
        <dl class="facts">
{facts}
        </dl>
      </div>
    </div>
  </section>

  <!-- Kontakt -->
  <section class="box box-dark contact" id="kontakt">
    <div class="wrap contact-grid">
      <div class="rv">
        <h2>{e(K['titel'])}</h2>
        <p class="lead">{e(K['lead'])}</p>
        <ul class="cinfo">
          <li><span class="ic"><i class="ph ph-phone" aria-hidden="true"></i></span><div><small>Telefon</small><a href="{TEL}">{e(SITE['telefon'])}</a></div></li>
          <li><span class="ic"><i class="ph ph-envelope-simple" aria-hidden="true"></i></span><div><small>E-Mail</small><a href="mailto:{e(SITE['email'])}">{e(SITE['email'])}</a></div></li>
          <li><span class="ic"><i class="ph ph-map-pin" aria-hidden="true"></i></span><div><small>Adresse</small><a href="{MAPS}" target="_blank" rel="noopener">{e(ADRESSE)}</a></div></li>
          <li><span class="ic"><i class="ph ph-clock" aria-hidden="true"></i></span><div><small>Bürozeiten</small><span class="v">{e(SITE['buero'])}</span></div></li>
        </ul>
      </div>

      <div class="wiz rv" id="anfrage" data-mail="{e(SITE['email'])}">
        <div class="wiz-head">
          <h3>{e(R['titel'])}</h3>
          <p>{e(R['text'])}</p>
          <div class="wiz-prog" aria-hidden="true"><span class="wiz-step"></span><span class="wiz-pct"></span><div class="wiz-bar"><i></i></div></div>
          <ul class="wiz-trust">{"".join(f'<li><i class="ph {ic}" aria-hidden="true"></i>{e(t)}</li>' for ic, t in zip(["ph-check-circle", "ph-handshake", "ph-scales"], R['vertrauen']))}</ul>
        </div>
        <div class="wiz-body" tabindex="-1">
          <noscript><p>Bitte rufen Sie uns an oder schreiben Sie eine E-Mail an <a href="mailto:{e(SITE['email'])}">{e(SITE['email'])}</a>.</p></noscript>
        </div>
        <script type="application/json" id="wiz-data">{WIZ_JSON}</script>
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
    """Leistungskästen. Fotos oben im Kasten nur, wenn jeder Kasten der Seite ein Foto hat;
    sonst bleibt die ganze Seite ohne Fotos (einheitliches Bild)."""
    with_pics = bool(items) and all((g.get("bild") or "").strip() for g in items)

    def pic(g):
        return f'<div class="group-img">{slot(g["bild"], g.get("bild_alt", ""), 1600, 1067)}</div>' if with_pics else ""

    cls = "group rv has-img" if with_pics else "group rv"
    return "\n".join(f'        <div class="{cls}">{pic(g)}<div class="group-body"><h3>{e(g["titel"])}</h3><p>{e(g["text"])}</p><ul class="chips">{chips(g["punkte"])}</ul></div></div>' for g in items)


def devices(p):
    items = p.get("geraete") or []
    if not items:
        return ""
    cards = "\n".join(f'        <article class="device rv"><small>{e(d["hersteller"])}</small><h3>{e(d["name"])}</h3><p>{e(d["text"])}</p><ul class="chips">{chips(d["daten"])}</ul></article>' for d in items)
    return f"""
  <section class="box box-dark">
    <div class="wrap">
      <div class="kopf rv"><h2>{e(p['geraete_titel'])}</h2><p>{e(p['geraete_text'])}</p></div>
      <div class="devices">
{cards}
      </div>
      <p class="src">{e(p.get('geraete_quelle', ''))}</p>
    </div>
  </section>"""


def trade_page(file, k, anliegen):
    p = load(file.replace(".html", ""))
    anfrage = f"?anliegen={anliegen}"
    body = f"""
<main id="main">
  <div class="page-stage">
    <section class="hero page" aria-label="{e(p['h1'])}">
      <div class="house" data-house="{k}"></div>
      <div class="panels">
        <div class="panel">
          <p class="crumbs"><a href="index.html">Start</a> / {e(p['crumb'])}</p>
          <h1>{e(p['h1'])}</h1>
          <p class="lead">{e(p['lead'])}</p>
          <div class="cta">
            <a class="btn btn-light" href="{to(False, 'kontakt', anfrage)}">Anfrage starten <i class="ph ph-arrow-right" aria-hidden="true"></i></a>
            <a class="btn btn-ghost inv" href="{TEL}"><i class="ph ph-phone" aria-hidden="true"></i> Anrufen</a>
          </div>
        </div>
      </div>
      <nav class="seg" aria-label="Gewerke">
          <span class="thumb" aria-hidden="true"></span>
          {seg(k)}
      </nav>
    </section>
  </div>

  <section class="sec">
    <div class="wrap">
      <div class="kopf rv"><h2>{e(p['leistungen_titel'])}</h2><p>{e(p['intro'])}</p></div>
      <div class="groups">
{groups(p['gruppen'])}
      </div>
    </div>
  </section>
{devices(p)}
  <section class="sec">
    <div class="wrap">
      <div class="note-band rv">
        <div><h2>{e(p['band']['titel'])}</h2><p>{e(p['band']['text'])}</p></div>
        <a class="btn" href="{to(False, 'kontakt', anfrage)}">Preis grob berechnen</a>
      </div>
    </div>
  </section>
</main>
"""
    page = head(p["seo"]["titel"], p["seo"]["beschreibung"], three=True) + nav(False, anfrage, file) + body + foot(False, anfrage)
    (OUT / file).write_text(page, encoding="utf-8")


for file, k, anliegen in [("heizung.html", "heat", "heizung"), ("klima.html", "cool", "klima"), ("sanitaer.html", "water", "sanitaer")]:
    trade_page(file, k, anliegen)


# ---------------- Rechtstexte ----------------
def legal_page(file, name, label):
    d = load(name)
    todo = f'\n      <div class="todo">{e(d["hinweis"])}</div>' if d.get("hinweis", "").strip() else ""
    secs = "\n".join(f'      <h2>{e(a["titel"])}</h2>\n      <p>{eb(a["text"])}</p>' for a in d["abschnitte"])
    body = f"""
<main id="main">
  <section class="sec" style="padding-top:0">
    <div class="wrap legal">
      <p class="crumbs"><a href="index.html">Start</a> / {label}</p>
      <h1>{e(d['titel'])}</h1>{todo}
{secs}
    </div>
  </section>
</main>
"""
    page = head(f"{label} | {FIRMA_RAW}", f"{label} der {FIRMA_RAW}, {SITE['ort']}.") + nav(False) + body + foot(False)
    (OUT / file).write_text(page, encoding="utf-8")


legal_page("impressum.html", "impressum", "Impressum")
legal_page("datenschutz.html", "datenschutz", "Datenschutz")

print("ok")
