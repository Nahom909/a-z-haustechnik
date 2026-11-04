/* 4M Gebäudetechnik GmbH: Code-Sperre, Navigation, Scroll-Bühne, Einblenden, Formular */
(function () {
  "use strict";

  var CODE = "1292";
  var KEY = "m4-vorschau";
  var root = document.documentElement;
  root.classList.add("js");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Gemeinsamer Zustand für das 3D-Haus (assets/house3d.js liest ihn in jedem Frame)
  window.M4 = { p: 0, k: "intro", ready: false };

  // ---------- Code-Sperre (Vorschau) ----------
  var unlocked = false;
  try { unlocked = sessionStorage.getItem(KEY) === "1"; } catch (e) {}
  if (!unlocked) root.classList.add("locked");

  function buildGate() {
    var g = document.createElement("div");
    g.className = "gate";
    g.setAttribute("role", "dialog");
    g.setAttribute("aria-modal", "true");
    g.setAttribute("aria-labelledby", "gate-t");
    g.innerHTML =
      '<form class="gate-box" novalidate>' +
      '<img src="assets/logo-full.svg" alt="4M Gebäudetechnik GmbH" width="702" height="234">' +
      '<p id="gate-t">Diese Vorschau ist geschützt. Bitte geben Sie den Zugangscode ein.</p>' +
      '<div class="pins">' +
      [0, 1, 2, 3].map(function (i) {
        return '<input inputmode="numeric" pattern="[0-9]*" maxlength="1" autocomplete="off" aria-label="Ziffer ' + (i + 1) + '">';
      }).join("") +
      "</div>" +
      '<div class="gate-msg" aria-live="polite"></div>' +
      '<p class="gate-foot">4M Gebäudetechnik GmbH, Frankfurt am Main</p>' +
      "</form>";
    document.body.appendChild(g);

    var pins = [].slice.call(g.querySelectorAll("input"));
    var msg = g.querySelector(".gate-msg");
    function value() { return pins.map(function (p) { return p.value; }).join(""); }
    function check() {
      if (value().length < 4) return;
      if (value() === CODE) {
        try { sessionStorage.setItem(KEY, "1"); } catch (e) {}
        root.classList.remove("locked");
        g.remove();
        afterUnlock();
      } else {
        g.classList.remove("bad");
        void g.offsetWidth;
        g.classList.add("bad");
        msg.textContent = "Der Code stimmt nicht. Bitte erneut versuchen.";
        pins.forEach(function (p) { p.value = ""; });
        pins[0].focus();
      }
    }
    pins.forEach(function (p, i) {
      p.addEventListener("input", function () {
        p.value = p.value.replace(/\D/g, "").slice(-1);
        g.classList.remove("bad");
        msg.textContent = "";
        if (p.value && i < 3) pins[i + 1].focus();
        check();
      });
      p.addEventListener("keydown", function (e) {
        if (e.key === "Backspace" && !p.value && i > 0) pins[i - 1].focus();
      });
      p.addEventListener("paste", function (e) {
        var t = (e.clipboardData || window.clipboardData).getData("text").replace(/\D/g, "").slice(0, 4);
        if (!t) return;
        e.preventDefault();
        t.split("").forEach(function (d, k) { pins[k].value = d; });
        check();
      });
    });
    g.querySelector("form").addEventListener("submit", function (e) { e.preventDefault(); check(); });
    pins[0].focus();
  }

  // ---------- Anlagenschema (SVG) ----------
  // Ein Haus, drei Kreise. Weiß = Vorlauf/warm, Grau = Rücklauf/kalt. Pfade sind in Flussrichtung gezeichnet.
  var SCHEMA =
    '<svg class="schema" viewBox="0 62 640 450" role="img" aria-labelledby="schema-t">' +
    '<title id="schema-t">Anlagenschema eines Hauses mit Heizung, Klimaanlage und Sanitär</title>' +
    '<defs><pattern id="dots" width="16" height="16" patternUnits="userSpaceOnUse"><circle class="s-dot" cx="1" cy="1" r="1"/></pattern></defs>' +
    '<rect x="0" y="62" width="640" height="408" fill="url(#dots)" opacity=".7"/>' +
    '<rect class="s-soil" x="0" y="470" width="640" height="42"/>' +

    // Gebäude
    '<g class="house">' +
    '<path class="s-wall" d="M16 470 H624"/>' +
    '<path class="s-wall" d="M150 470 V206 H560 V470"/>' +
    '<path class="s-wall" d="M126 216 L355 86 L584 216"/>' +
    '<path class="s-wall" d="M150 338 H560"/>' +
    '<path class="s-thin" d="M330 206 V338 M280 338 V470"/>' +
    '<circle class="s-thin" cx="355" cy="162" r="15"/><path class="s-thin" d="M340 162 H370 M355 147 V177"/>' +
    '<rect class="s-obj" x="196" y="356" width="52" height="102" rx="14"/>' +
    '</g>' +

    // Heizung: Wärmepumpe, Speicher, Heizkörper
    '<g class="c c-heat">' +
    '<rect class="s-obj" x="34" y="396" width="90" height="66" rx="4"/>' +
    '<circle class="s-thin" cx="64" cy="429" r="20"/><path class="s-thin" d="M64 412 V446 M47 429 H81"/>' +
    '<path class="s-thin" d="M96 410 H114 M96 418 H114 M96 426 H114 M96 434 H114 M96 442 H114 M96 450 H114"/>' +
    '<path class="s-thin" d="M44 462 V470 M114 462 V470"/>' +
    '<rect class="s-obj" x="318" y="404" width="72" height="40" rx="3"/>' +
    '<path class="s-thin" d="M330 410 V438 M342 410 V438 M354 410 V438 M366 410 V438 M378 410 V438"/>' +
    '<rect class="s-obj" x="448" y="404" width="72" height="40" rx="3"/>' +
    '<path class="s-thin" d="M460 410 V438 M472 410 V438 M484 410 V438 M496 410 V438 M508 410 V438"/>' +
    '<path class="p p-hot" d="M124 414 H196"/>' +
    '<path class="p p-cold" d="M196 444 H124"/>' +
    '<path class="p p-hot" d="M248 376 H508 V404"/>' +
    '<path class="p p-hot" d="M382 376 V404"/>' +
    '<path class="p p-cold" d="M456 444 V456 H248"/>' +
    '<path class="p p-cold" d="M326 444 V456"/>' +
    '<text class="s-lbl" x="79" y="384" text-anchor="middle">Wärmepumpe</text>' +
    '<text class="s-lbl" x="445" y="366" text-anchor="middle">Heizkörper</text>' +
    '</g>' +

    // Klima: Innengerät, Außengerät, Kältemittelleitungen
    '<g class="c c-cool">' +
    '<rect class="s-obj" x="396" y="224" width="118" height="30" rx="7"/>' +
    '<path class="s-thin" d="M406 246 H504"/>' +
    '<path class="air" d="M424 262 q7 8 0 16 q-7 8 0 16"/>' +
    '<path class="air" d="M455 262 q7 8 0 16 q-7 8 0 16"/>' +
    '<path class="air" d="M486 262 q7 8 0 16 q-7 8 0 16"/>' +
    '<rect class="s-obj" x="568" y="262" width="64" height="52" rx="4"/>' +
    '<circle class="s-thin" cx="590" cy="288" r="15"/><path class="s-thin" d="M590 275 V301 M577 288 H603"/>' +
    '<path class="s-thin" d="M612 274 H624 M612 282 H624 M612 290 H624 M612 298 H624"/>' +
    '<path class="s-thin" d="M560 318 H632 M572 318 L560 330"/>' +
    '<path class="p p-cold" d="M514 233 H598 V262"/>' +
    '<path class="p p-cold" d="M584 262 V245 H514"/>' +
    '<text class="s-lbl" x="455" y="318" text-anchor="middle">Klimagerät</text>' +
    '<text class="s-lbl" x="604" y="348" text-anchor="middle">Außengerät</text>' +
    '</g>' +

    // Sanitär: Hausanschluss, Dusche, Waschtisch
    '<g class="c c-water">' +
    '<path class="s-thin" d="M313 250 V232 H296"/>' +
    '<path class="s-obj" d="M278 229 H298 L294 237 H282 Z"/>' +
    '<path class="air" d="M283 244 V322 M289 244 V322 M295 244 V322"/>' +
    '<rect class="s-obj" x="306" y="250" width="15" height="24" rx="3"/>' +
    '<path class="s-thin" d="M262 330 H326"/>' +
    '<rect class="s-thin" x="196" y="249" width="28" height="30" rx="2"/>' +
    '<path class="s-thin" d="M210 290 V284 H219 M210 312 V336"/>' +
    '<path class="s-obj" d="M184 290 H236 Q234 310 210 312 Q186 310 184 290 Z"/>' +
    '<path class="p p-cold" d="M16 492 H172 V450 a6 6 0 0 0 0 -12 V420 a6 6 0 0 0 0 -12 V226 H313 V250"/>' +
    '<path class="p p-cold" d="M172 320 H198 V311"/>' +
    '<path class="p p-hot" d="M230 357 V262 H306"/>' +
    '<path class="p p-hot" d="M230 320 H222 V311"/>' +
    '<text class="s-lbl" x="18" y="486">Hausanschluss</text>' +
    '<text class="s-lbl" x="270" y="221" text-anchor="middle">Dusche</text>' +
    '<text class="s-lbl" x="210" y="244" text-anchor="middle">Waschtisch</text>' +
    '</g>' +
    '<text class="s-lbl" x="226" y="407" text-anchor="middle" transform="rotate(-90 226 407)">Speicher</text>' +
    "</svg>";

  // Das SVG bleibt als Rückfall im Haus-Container, falls WebGL fehlt
  function initFallback() {
    var house = document.querySelector("[data-house]");
    if (!house) return;
    house.insertAdjacentHTML("afterbegin", SCHEMA);
    var svg = house.querySelector("svg.schema");
    [].forEach.call(svg.querySelectorAll(".p"), function (p) {
      var f = p.cloneNode();
      f.setAttribute("class", "f");
      p.parentNode.insertBefore(f, p.nextSibling);
    });
    var fixed = house.getAttribute("data-house");
    svg.setAttribute("data-active", fixed === "story" ? "heat" : fixed);
  }

  // ---------- Scroll-Bühne: Intro, Heizung, Klima, Sanitär ----------
  var STEPS = ["intro", "heat", "cool", "water"];
  var JUMP = { heat: 0.36, cool: 0.62, water: 0.88 };

  function initStory() {
    var story = document.querySelector(".story");
    var house = document.querySelector("[data-house]");
    var seg = document.querySelector(".seg");

    // Unterseite: festes Gewerk
    if (house && house.getAttribute("data-house") !== "story") {
      window.M4.k = house.getAttribute("data-house");
      if (seg) placeThumb(seg, seg.querySelector('[aria-current="page"]'));
      return;
    }
    if (!story) return;
    var btns = seg ? [].slice.call(seg.querySelectorAll("button[data-k]")) : [];
    var svg = function () { return house && house.querySelector("svg.schema"); };

    function setStep(k) {
      if (story.getAttribute("data-step") === k) return;
      story.setAttribute("data-step", k);
      window.M4.k = k;
      var on = null;
      btns.forEach(function (b) {
        var hit = b.getAttribute("data-k") === k;
        b.setAttribute("aria-pressed", hit ? "true" : "false");
        if (hit) on = b;
      });
      placeThumb(seg, on);
      var s = svg();
      if (s && k !== "intro") s.setAttribute("data-active", k);
    }

    if (reduce) {
      story.classList.add("static");
      setStep("intro");
      btns.forEach(function (b) {
        b.addEventListener("click", function () { setStep(b.getAttribute("data-k")); });
      });
      return;
    }

    function update() {
      var total = story.offsetHeight - window.innerHeight;
      var p = total > 0 ? Math.min(1, Math.max(0, -story.getBoundingClientRect().top / total)) : 0;
      window.M4.p = p;
      setStep(p < 0.22 ? "intro" : p < 0.5 ? "heat" : p < 0.76 ? "cool" : "water");
    }
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { update(); ticking = false; });
    }, { passive: true });
    window.addEventListener("resize", update);
    update();

    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        var total = story.offsetHeight - window.innerHeight;
        var top = story.getBoundingClientRect().top + window.scrollY + JUMP[b.getAttribute("data-k")] * total;
        window.scrollTo({ top: top, behavior: "smooth" });
      });
    });
  }

  function placeThumb(seg, btn) {
    if (!seg) return;
    var items = [].slice.call(seg.querySelectorAll("button, a"));
    var i = btn ? items.indexOf(btn) : -1;
    seg.classList.toggle("has-thumb", i >= 0);
    if (i >= 0) seg.style.setProperty("--i", i);
  }

  // ---------- Sprungmarken: die Startseite beginnt immer oben ----------
  // Eine #Sprungmarke in der Adresse (z. B. nach einem Klick auf "Anfrage senden") würde beim
  // nächsten Öffnen oder Neuladen direkt zum Kontakt springen. Deshalb kommt keine in die Adresse,
  // und Unterseiten verlinken mit ?ziel= auf einen Abschnitt.
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  var pendingTarget = null;

  function initAnchors() {
    var params = new URLSearchParams(location.search);
    pendingTarget = params.get("ziel");
    if (location.hash || pendingTarget) {
      params.delete("ziel");
      var q = params.toString();
      history.replaceState(null, "", location.pathname + (q ? "?" + q : ""));
    }
    window.scrollTo(0, 0);

    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a || a.getAttribute("href").length < 2) return;
      var el = document.getElementById(a.getAttribute("href").slice(1));
      if (!el) return;
      e.preventDefault();
      goTo(el, reduce ? "auto" : "smooth");
    });
  }

  function goTo(el, behavior) {
    el.scrollIntoView({ behavior: behavior, block: "start" });
    if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
    el.focus({ preventScroll: true });
  }

  function goPending() {
    var el = pendingTarget && document.getElementById(pendingTarget);
    pendingTarget = null;
    if (el) requestAnimationFrame(function () { goTo(el, "auto"); });
  }

  // ---------- Navigation ----------
  function initNav() {
    // Glas wird dunkel, solange die Leiste über einer schwarzen Fläche schwebt
    var nav = document.querySelector(".nav");
    var darks = [].slice.call(document.querySelectorAll(".hero, .box-dark"));
    if (nav && darks.length) {
      var tone = function () {
        var y = nav.getBoundingClientRect().top + 30;
        var on = darks.some(function (d) { var r = d.getBoundingClientRect(); return r.top <= y && r.bottom >= y; });
        nav.classList.toggle("dark", on);
      };
      var t2 = false;
      window.addEventListener("scroll", function () {
        if (t2) return;
        t2 = true;
        requestAnimationFrame(function () { tone(); t2 = false; });
      }, { passive: true });
      window.addEventListener("resize", tone);
      tone();
    }
    var burger = document.querySelector(".burger");
    var sheet = document.querySelector(".sheet");
    if (!burger || !sheet) return;
    var setOpen = function (open) {
      sheet.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      burger.querySelector("i").className = open ? "ph ph-x" : "ph ph-list";
    };
    burger.addEventListener("click", function () { setOpen(!sheet.classList.contains("open")); });
    sheet.addEventListener("click", function (e) { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setOpen(false); });
  }

  // ---------- Einblenden beim Scrollen, Ablauf ----------
  function initReveal() {
    var els = document.querySelectorAll(".rv, .steps-wrap");
    if (!("IntersectionObserver" in window)) {
      [].forEach.call(els, function (el) { el.classList.add("an", "on"); });
      return;
    }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add(e.target.classList.contains("steps-wrap") ? "on" : "an");
        io.unobserve(e.target);
      });
    }, { threshold: 0.14 });
    [].forEach.call(els, function (el) { io.observe(el); });
  }

  // ---------- Bilder: Platzhalter, falls ein Foto fehlt ----------
  function initSlots() {
    [].forEach.call(document.querySelectorAll("img[data-slot]"), function (img) {
      var mark = function () { img.parentNode.classList.add("ph-slot"); };
      if (img.complete && img.naturalWidth === 0) mark();
      img.addEventListener("error", mark);
    });
  }

  // ---------- Anfrage-Assistent: Fragen, grobe Preisspanne, dann Anfrage ----------
  // Fragen, Antworten und Preise kommen aus content/rechner.json (im CMS bearbeitbar).
  function initWizard() {
    var box = document.getElementById("anfrage");
    var src = document.getElementById("wiz-data");
    if (!box || !src) return;
    var D;
    try { D = JSON.parse(src.textContent); } catch (err) { return; }
    var body = box.querySelector(".wiz-body");
    var bar = box.querySelector(".wiz-bar i");
    var stepTxt = box.querySelector(".wiz-step");
    var pctTxt = box.querySelector(".wiz-pct");
    var G = null, ans = [], step = 0, contact = {}, first = true;

    function esc(s) {
      return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
      });
    }
    function num(v) { var n = parseFloat(v); return isNaN(n) ? null : n; }
    function qs() { return G ? G.fragen || [] : []; }
    function hasResult() { return qs().length > 0; }
    // Schritte: 0 = Vorhaben, 1..n = Fragen, n+1 = Preisspanne (falls Fragen), danach Kontakt, danach Danke
    function resultStep() { return hasResult() ? qs().length + 1 : -1; }
    function contactStep() { return qs().length + (hasResult() ? 2 : 1); }
    function lastStep() { return G ? contactStep() : 7; }
    function eur(n) { return n.toLocaleString("de-DE") + " €"; }

    function price() {
      var lo = 0, hi = 0, f = 1, priced = false;
      qs().forEach(function (q, i) {
        var o = q.optionen[ans[i]];
        if (!o) return;
        var mn = num(o.min), mx = num(o.max), fk = num(o.faktor);
        if (mn !== null || mx !== null) priced = true;
        lo += mn || 0; hi += mx || 0;
        if (fk) f *= fk;
      });
      if (!priced || hi <= 0) return null;
      return [Math.floor(lo * f / 100) * 100, Math.ceil(hi * f / 100) * 100];
    }
    function priceText() {
      var p = price();
      if (!p) return D.ergebnis_ohne_preis;
      return p[0] === p[1] ? "ca. " + eur(p[0]) : "ca. " + p[0].toLocaleString("de-DE") + " – " + eur(p[1]);
    }
    function hints() {
      var out = [];
      qs().forEach(function (q, i) { var o = q.optionen[ans[i]]; if (o && o.hinweis) out.push(o.hinweis); });
      if (G && G.hinweis) out.push(G.hinweis);
      return out;
    }
    function summaryLines() {
      var l = ["Vorhaben: " + G.label];
      qs().forEach(function (q, i) {
        var o = q.optionen[ans[i]];
        if (o) l.push(q.frage + " " + o.label + (o.sub ? " (" + o.sub + ")" : ""));
      });
      if (hasResult()) l.push("Grobe Preisvorstellung: " + priceText());
      return l;
    }

    function opts(list, sel, cls) {
      return '<div class="wiz-opts' + (cls ? " " + cls : "") + '">' + list.map(function (o, i) {
        return '<button type="button" class="wiz-opt" data-i="' + i + '" aria-pressed="' + (sel === i) + '">' +
          (o.icon ? '<i class="ph ' + esc(o.icon) + '" aria-hidden="true"></i>' : "") +
          "<strong>" + esc(o.label) + "</strong>" + (o.sub ? "<span>" + esc(o.sub) + "</span>" : "") + "</button>";
      }).join("") + "</div>";
    }
    function back() {
      return step > 0 ? '<button type="button" class="wiz-back"><i class="ph ph-arrow-left" aria-hidden="true"></i> Zurück</button>' : "";
    }

    function render() {
      var n = qs().length, html = "";
      box.classList.toggle("is-start", step === 0);
      if (step === 0) {
        html = '<h4 class="wiz-q">' + esc(D.start_frage) + "</h4>" + opts(D.gewerke, G ? D.gewerke.indexOf(G) : -1, "wiz-opts-start");
      } else if (step <= n) {
        var q = qs()[step - 1];
        html = '<h4 class="wiz-q">' + esc(q.frage) + "</h4>" + (q.hilfe ? '<p class="wiz-help">' + esc(q.hilfe) + "</p>" : "") +
          opts(q.optionen, ans[step - 1]) + '<div class="wiz-nav">' + back() + "</div>";
      } else if (step === resultStep()) {
        var p = price();
        html = '<p class="wiz-kicker">' + esc(D.ergebnis_titel) + "</p>" +
          '<p class="wiz-price' + (p ? "" : " none") + '">' + esc(priceText()) + "</p>" +
          (p ? '<p class="wiz-help">' + esc(D.ergebnis_hinweis) + "</p>" : "") +
          (G.enthalten && G.enthalten.length ? '<h5>Enthalten</h5><ul class="wiz-list">' + G.enthalten.map(function (x) { return '<li><i class="ph ph-check" aria-hidden="true"></i>' + esc(x) + "</li>"; }).join("") + "</ul>" : "") +
          hints().map(function (h) { return '<p class="wiz-note"><i class="ph ph-info" aria-hidden="true"></i><span>' + esc(h) + "</span></p>"; }).join("") +
          '<details class="wiz-sum"><summary>Ihre Angaben</summary><ul>' + summaryLines().slice(0, -1).map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></details>" +
          '<button type="button" class="btn btn-light wiz-next">' + esc(D.weiter_knopf) + ' <i class="ph ph-arrow-right" aria-hidden="true"></i></button>' +
          '<div class="wiz-nav">' + back() + "</div>";
      } else if (step === contactStep()) {
        html = '<h4 class="wiz-q">' + esc(D.kontakt_titel) + "</h4>" + '<p class="wiz-help">' + esc(D.kontakt_text) + "</p>" +
          (hasResult() ? '<p class="wiz-chip"><i class="ph ph-' + "calculator" + '" aria-hidden="true"></i>' + esc(G.label) + ": " + esc(priceText()) + "</p>" : "") +
          '<form class="wiz-form" novalidate>' +
          '<div class="frow">' +
          '<div class="field"><label for="w-name">Name</label><input id="w-name" name="name" autocomplete="name" required value="' + esc(contact.name) + '"><span class="err" data-err="name"></span></div>' +
          '<div class="field"><label for="w-kontakt">Telefon oder E-Mail</label><input id="w-kontakt" name="kontakt" autocomplete="tel" required value="' + esc(contact.kontakt) + '"><span class="err" data-err="kontakt"></span></div>' +
          "</div>" +
          '<div class="field"><label for="w-ort">PLZ und Ort <span class="opt">(optional)</span></label><input id="w-ort" name="ort" autocomplete="postal-code" value="' + esc(contact.ort) + '"></div>' +
          '<div class="field"><label for="w-nachricht">Nachricht <span class="opt">(optional)</span></label><textarea id="w-nachricht" name="nachricht" placeholder="Wunschtermin, Baujahr, Besonderheiten">' + esc(contact.nachricht) + "</textarea></div>" +
          '<label class="chk"><input type="checkbox" name="datenschutz" required><span>Ich bin einverstanden, dass meine Angaben zur Bearbeitung der Anfrage verwendet werden. Mehr in der <a href="datenschutz.html">Datenschutzerklärung</a>.</span></label>' +
          '<span class="err" data-err="datenschutz" style="display:block;margin:-10px 0 16px"></span>' +
          '<button class="btn btn-light" type="submit">' + esc(D.senden_knopf) + ' <i class="ph ph-paper-plane-tilt" aria-hidden="true"></i></button>' +
          '<p class="form-note">' + esc(D.senden_hinweis) + "</p></form>" +
          '<div class="wiz-nav">' + back() + "</div>";
      } else {
        html = '<div class="wiz-done" role="status"><i class="ph ph-check-circle" aria-hidden="true"></i><h4>' + esc(D.danke_titel) + "</h4><p>" + esc(D.danke_text) + "</p></div>";
      }
      body.innerHTML = html;

      var last = lastStep(), pct = Math.min(100, Math.round(step / (last + 1) * 100));
      bar.style.width = Math.max(pct, 4) + "%";
      stepTxt.textContent = step > last ? "Fertig" : "Schritt " + (step + 1) + " von " + (last + 1);
      pctTxt.textContent = pct + " % geschafft";

      if (!first) {
        body.focus({ preventScroll: true });
        var r = box.getBoundingClientRect();
        if (r.top < 70 || r.top > window.innerHeight * 0.6) {
          window.scrollTo({ top: window.scrollY + r.top - 90, behavior: reduce ? "auto" : "smooth" });
        }
      }
      first = false;
      var f = body.querySelector(".wiz-form");
      if (f) bindForm(f);
    }

    body.addEventListener("click", function (e) {
      var b = e.target.closest(".wiz-opt");
      if (b) {
        var i = +b.getAttribute("data-i");
        if (step === 0) {
          var g = D.gewerke[i];
          if (g !== G) { G = g; ans = []; }
        } else {
          ans[step - 1] = i;
        }
        [].forEach.call(body.querySelectorAll(".wiz-opt"), function (x) { x.setAttribute("aria-pressed", x === b); });
        setTimeout(function () { step++; render(); }, reduce ? 0 : 160);
        return;
      }
      if (e.target.closest(".wiz-back")) {
        var form = body.querySelector(".wiz-form");
        if (form) keep(form);
        step--; render(); return;
      }
      if (e.target.closest(".wiz-next")) { step++; render(); }
    });

    function keep(form) {
      ["name", "kontakt", "ort", "nachricht"].forEach(function (k) { contact[k] = form.elements[k].value; });
    }

    function bindForm(form) {
      var F = form.elements;
      function setErr(el, text) {
        var b = form.querySelector('[data-err="' + el.name + '"]');
        el.setAttribute("aria-invalid", text ? "true" : "false");
        if (b) b.textContent = text || "";
      }
      [].forEach.call(form.querySelectorAll("input, textarea"), function (el) {
        el.addEventListener("input", function () { if (el.getAttribute("aria-invalid") === "true") setErr(el, ""); });
      });
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var ok = true, bad = null;
        [
          [F.name, F.name.value.trim().length > 1, "Bitte geben Sie Ihren Namen an."],
          [F.kontakt, /\S+@\S+\.\S+|[\d\s+\/()-]{6,}/.test(F.kontakt.value.trim()), "Bitte eine Telefonnummer oder E-Mail-Adresse angeben."],
          [F.datenschutz, F.datenschutz.checked, "Bitte stimmen Sie der Verarbeitung Ihrer Angaben zu."]
        ].forEach(function (c) {
          setErr(c[0], c[1] ? "" : c[2]);
          if (!c[1]) { ok = false; bad = bad || c[0]; }
        });
        if (!ok) { bad.focus(); return; }
        keep(form);
        var text = summaryLines().join("\n") + "\n\n" +
          "Name: " + contact.name.trim() + "\n" +
          "Kontakt: " + contact.kontakt.trim() + "\n" +
          "PLZ/Ort: " + (contact.ort.trim() || "-") + "\n\n" +
          (contact.nachricht.trim() || "");
        var subject = "Anfrage: " + G.label + (price() ? " (" + priceText() + ")" : "");
        var to = box.getAttribute("data-mail");
        var endpoint = box.getAttribute("data-endpoint");
        var mail = function () {
          location.href = "mailto:" + to + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(text);
        };
        var done = function () { step++; render(); };
        if (endpoint) {
          var fd = new FormData(form);
          fd.append("vorhaben", G.label);
          fd.append("zusammenfassung", text);
          fetch(endpoint, { method: "POST", body: fd }).then(function (r) { if (!r.ok) throw r; done(); }, function () { mail(); done(); });
        } else {
          mail();
          done();
        }
      });
    }

    // Von den Gewerke-Seiten kommt ?anliegen=klima usw.: Vorhaben ist dann schon gewählt
    var pre = new URLSearchParams(location.search).get("anliegen");
    D.gewerke.forEach(function (g) { if (g.id === pre) { G = g; step = 1; } });
    render();
  }

  // Nach dem Entsperren erscheint die ganze Seite auf einmal; der Browser kann dabei die Position
  // verschieben (Fokus, Scroll-Verankerung). Deshalb ausdrücklich und ohne Animation nach oben.
  function toTop() { window.scrollTo({ top: 0, left: 0, behavior: "instant" }); }

  function afterUnlock() {
    window.M4.ready = true;
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    initReveal();
    if (pendingTarget) { goPending(); return; }
    toTop();
    requestAnimationFrame(toTop);
    setTimeout(toTop, 150);
    setTimeout(toTop, 600);
  }

  document.addEventListener("DOMContentLoaded", function () {
    [].forEach.call(document.querySelectorAll("[data-year]"), function (el) { el.textContent = new Date().getFullYear(); });
    initAnchors();
    initFallback();
    initStory();
    initNav();
    initSlots();
    initWizard();
    if (root.classList.contains("locked")) buildGate();
    else afterUnlock();
  });
})();
