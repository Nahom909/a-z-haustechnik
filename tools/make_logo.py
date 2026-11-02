# Baut das 4M-Logo als reinen Vektor (SVG): geometrisches Monogramm in Volltonfarben,
# Wortmarke aus Archivo (SIL Open Font License) in Pfade umgewandelt. Keine Verläufe, keine Schatten.
# Aufruf: python tools/make_logo.py <pfad/zu/Archivo[wdth,wght].ttf>
import sys, pathlib
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

OUT = pathlib.Path(__file__).resolve().parent.parent / "assets"
ROT = "#C1121C"    # angelehnt an RAL 3020 Verkehrsrot
BLAU = "#0E518D"   # angelehnt an RAL 5017 Verkehrsblau
ANTH = "#24282D"
HELL = "#F5F5F7"

font = instantiateVariableFont(TTFont(sys.argv[1]), {"wght": 620, "wdth": 125})
gs = font.getGlyphSet()
cmap = font.getBestCmap()
upm = font["head"].unitsPerEm
cap = font["OS/2"].sCapHeight


def text_path(s, x, baseline, cap_px, track_em):
    """Pfad für eine Zeile in Versalien; cap_px = Höhe der Großbuchstaben in px."""
    k = cap_px / cap
    d = []
    for ch in s:
        g = cmap[ord(ch)]
        pen = SVGPathPen(gs)
        gs[g].draw(TransformPen(pen, (k, 0, 0, -k, x, baseline)))
        d.append(pen.getCommands())
        x += gs[g].width * k + track_em * upm * k
    return " ".join(d), x - track_em * upm * k


def mono(x=0, y=0, four=ANTH):
    # Monogramm 244 x 120: eine 4 mit Dreiecks-Innenraum, das M aus zwei Hälften mit schmaler Fuge
    t = lambda pts: " ".join(f"{px + x:g},{py + y:g}" for px, py in pts)
    return (
        f'<path fill="{four}" fill-rule="evenodd" d="M{62 + x} {y} H{86 + x} V{72 + y} H{100 + x} V{94 + y} H{86 + x} V{120 + y} H{62 + x} V{94 + y} H{x} V{72 + y} Z '
        f'M{62 + x} {30 + y} V{72 + y} H{26 + x} Z"/>'
        f'<polygon fill="{ROT}" points="{t([(112,120),(112,0),(140,0),(176.25,58),(176.25,106),(138,44.8),(138,120)])}"/>'
        f'<polygon fill="{BLAU}" points="{t([(244,120),(244,0),(216,0),(179.75,58),(179.75,106),(218,44.8),(218,120)])}"/>'
    )


def svg(w, h, body, title="4M Gebäudetechnik GmbH"):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:g} {h:g}" width="{w:g}" height="{h:g}" role="img"><title>{title}</title>{body}</svg>\n'


def write(name, content):
    (OUT / name).write_text(content, encoding="utf-8")


# Querformat: Monogramm links, Wortmarke rechts
for name, ink in [("logo-horizontal.svg", ANTH), ("logo-horizontal-dark.svg", HELL)]:
    d1, end1 = text_path("GEBÄUDETECHNIK", 276, 56, 36, 0.08)
    d2, end2 = text_path("GMBH", 277, 100, 20, 0.42)
    body = mono(0, 0, ink) + f'<path fill="{ink}" d="{d1} {d2}"/>'
    write(name, svg(round(end1) + 2, 120, body))

# Hochformat: Monogramm über der Wortmarke
d1, end1 = text_path("GEBÄUDETECHNIK", 0, 0, 36, 0.08)
w1 = end1
d2, end2 = text_path("GMBH", 0, 0, 20, 0.42)
w2 = end2
W = round(max(w1, 244)) + 4
for name, ink in [("logo-full.svg", ANTH), ("logo-full-dark.svg", HELL)]:
    p1, _ = text_path("GEBÄUDETECHNIK", (W - w1) / 2, 190, 36, 0.08)
    p2, _ = text_path("GMBH", (W - w2) / 2, 232, 20, 0.42)
    body = mono((W - 244) / 2, 0, ink) + f'<path fill="{ink}" d="{p1} {p2}"/>'
    write(name, svg(W, 234, body))

# Nur das Monogramm, plus App-Symbol auf hellem Grund
write("logo-mark.svg", svg(244, 120, mono()))
write("logo-mark-dark.svg", svg(244, 120, mono(0, 0, HELL)))
write("icon.svg", svg(256, 256, f'<rect width="256" height="256" rx="56" fill="#FFFFFF"/><g transform="translate(30.4 80) scale(.8)">' + mono() + "</g>"))
print("ok")
