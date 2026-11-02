/* 4M Gebäudetechnik GmbH: Code-Sperre, Anlagenschema, Navigation, Ablauf, Formular */
(function () {
  "use strict";

  var CODE = "1292";
  var KEY = "m4-vorschau";
  var root = document.documentElement;
  root.classList.add("js");

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
      '<img src="assets/logo-full.webp" alt="4M Gebäudetechnik GmbH" width="560" height="482">' +
      '<p id="gate-t">Diese Vorschau ist geschützt. Bitte geben Sie den Zugangscode ein.</p>' +
      '<div class="pins">' +
      [0, 1, 2, 3].map(function (i) {
        return '<input inputmode="numeric" pattern="[0-9]*" maxlength="1" autocomplete="off" aria-label="Ziffer ' + (i + 1) + '">';
      }).join("") +
      "</div>" +
      '<div class="gate-msg" aria-live="polite"></div>' +
      '<p class="gate-foot">4M Gebäudetechnik GmbH, Offenbach am Main</p>' +
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

  // ---------- Anlagenschema ----------
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

  var CAPTIONS = {
    heat: "Heizung: Die Wärmepumpe erzeugt die Wärme, der Speicher hält sie vor, die Heizkörper geben sie an die Räume ab.",
    cool: "Klima: Das Außengerät führt die Wärme nach draußen, das Innengerät kühlt den Raum leise und ohne Zugluft.",
    water: "Sanitär: Kaltwasser kommt vom Hausanschluss, Warmwasser aus dem Speicher, beides bis zu Dusche und Waschtisch."
  };

  function initSchema() {
    var holders = document.querySelectorAll("[data-schema]");
    if (!holders.length) return;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    [].forEach.call(holders, function (holder) {
      (holder.querySelector(".schema-slot") || holder).insertAdjacentHTML("afterbegin", SCHEMA);
      var svg = holder.querySelector("svg.schema");
      // Fluss-Striche über jede Leitung legen
      [].forEach.call(svg.querySelectorAll(".p"), function (p) {
        var f = p.cloneNode();
        f.setAttribute("class", "f");
        p.parentNode.insertBefore(f, p.nextSibling);
      });

      var fixed = holder.getAttribute("data-schema");
      var cap = holder.querySelector(".schema-cap");
      var btns = [].slice.call(holder.querySelectorAll("button[data-k]"));
      var words = [].slice.call(holder.querySelectorAll("[data-word]"));

      function show(k) {
        svg.setAttribute("data-active", k);
        btns.forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-k") === k ? "true" : "false"); });
        words.forEach(function (w) { w.classList.toggle("on", w.getAttribute("data-word") === k); });
        if (cap) cap.textContent = CAPTIONS[k];
      }

      if (fixed && fixed !== "cycle") { show(fixed); return; }

      var order = ["heat", "cool", "water"];
      show(order[0]);
      btns.forEach(function (b) {
        b.addEventListener("click", function () { holder.classList.remove("cycling"); show(b.getAttribute("data-k")); });
      });
      if (!reduce) {
        // Der Fortschrittsbalken des aktiven Gewerks gibt den Takt vor
        holder.classList.add("cycling");
        holder.addEventListener("animationend", function (e) {
          if (e.animationName !== "fill" || !holder.classList.contains("cycling")) return;
          var i = order.indexOf(svg.getAttribute("data-active"));
          show(order[(i + 1) % order.length]);
        });
        // Nur laufen lassen, solange der Bereich sichtbar ist
        if ("IntersectionObserver" in window) {
          new IntersectionObserver(function (es) {
            es.forEach(function (e) { holder.classList.toggle("paused", !e.isIntersecting); });
          }).observe(holder);
        }
      }
    });
  }

  // ---------- Navigation ----------
  function initNav() {
    var nav = document.querySelector(".nav");
    var burger = document.querySelector(".burger");
    var sheet = document.querySelector(".sheet");
    if (nav) {
      var onScroll = function () { nav.classList.toggle("scrolled", window.scrollY > 8); };
      var ticking = false;
      window.addEventListener("scroll", function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () { onScroll(); ticking = false; });
      }, { passive: true });
      onScroll();
    }
    if (burger && sheet) {
      var setOpen = function (open) {
        sheet.classList.toggle("open", open);
        burger.setAttribute("aria-expanded", open ? "true" : "false");
        burger.querySelector("i").className = open ? "ph ph-x" : "ph ph-list";
      };
      burger.addEventListener("click", function () { setOpen(!sheet.classList.contains("open")); });
      sheet.addEventListener("click", function (e) { if (e.target.closest("a")) setOpen(false); });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape") setOpen(false); });
    }
  }

  // ---------- Ablauf ----------
  function initRoute() {
    var route = document.querySelector(".route");
    if (!route) return;
    if (!("IntersectionObserver" in window)) { route.classList.add("on"); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { route.classList.add("on"); io.disconnect(); }
      });
    }, { threshold: 0.35 });
    io.observe(route);
  }

  // ---------- Bilder: Platzhalter, bis die echten Fotos da sind ----------
  function initSlots() {
    [].forEach.call(document.querySelectorAll("img[data-slot]"), function (img) {
      var mark = function () { img.closest("figure, .about-pic").classList.add("ph-slot"); };
      if (img.complete && img.naturalWidth === 0) mark();
      img.addEventListener("error", mark);
    });
  }

  // ---------- Kontaktformular ----------
  function initForm() {
    var form = document.querySelector("#anfrage");
    if (!form) return;
    var F = form.elements;
    var params = new URLSearchParams(location.search);
    var pre = params.get("anliegen");
    if (pre && F.anliegen) {
      [].forEach.call(F.anliegen.options, function (o) { if (o.value === pre) F.anliegen.value = pre; });
    }

    function setErr(el, text) {
      var box = form.querySelector('[data-err="' + el.name + '"]');
      el.setAttribute("aria-invalid", text ? "true" : "false");
      if (box) box.textContent = text || "";
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true, first = null;
      var checks = [
        [F.name, F.name.value.trim().length > 1, "Bitte geben Sie Ihren Namen an."],
        [F.kontakt, /\S+@\S+\.\S+|[\d\s+\/()-]{6,}/.test(F.kontakt.value.trim()), "Bitte eine Telefonnummer oder E-Mail-Adresse angeben."],
        [F.nachricht, F.nachricht.value.trim().length > 4, "Bitte beschreiben Sie kurz Ihr Anliegen."],
        [F.datenschutz, F.datenschutz.checked, "Bitte stimmen Sie der Verarbeitung Ihrer Angaben zu."]
      ];
      checks.forEach(function (c) {
        setErr(c[0], c[1] ? "" : c[2]);
        if (!c[1]) { ok = false; first = first || c[0]; }
      });
      if (!ok) { first.focus(); return; }

      var label = F.anliegen.options[F.anliegen.selectedIndex].text;
      var body =
        "Name: " + F.name.value.trim() + "\n" +
        "Kontakt: " + F.kontakt.value.trim() + "\n" +
        "Ort: " + (F.ort.value.trim() || "-") + "\n" +
        "Anliegen: " + label + "\n\n" + F.nachricht.value.trim();
      var to = form.getAttribute("data-mail");
      var endpoint = form.getAttribute("data-endpoint");
      var done = function () { form.closest(".form").classList.add("sent"); };

      if (endpoint) {
        fetch(endpoint, { method: "POST", body: new FormData(form) }).then(done, function () {
          location.href = "mailto:" + to + "?subject=" + encodeURIComponent("Anfrage: " + label) + "&body=" + encodeURIComponent(body);
          done();
        });
      } else {
        location.href = "mailto:" + to + "?subject=" + encodeURIComponent("Anfrage: " + label) + "&body=" + encodeURIComponent(body);
        done();
      }
    });
    [].forEach.call(form.querySelectorAll("input, textarea"), function (el) {
      el.addEventListener("input", function () { if (el.getAttribute("aria-invalid") === "true") setErr(el, ""); });
    });
  }

  function afterUnlock() {
    initRoute();
  }

  document.addEventListener("DOMContentLoaded", function () {
    var y = document.querySelectorAll("[data-year]");
    [].forEach.call(y, function (el) { el.textContent = new Date().getFullYear(); });
    initSchema();
    initNav();
    initSlots();
    initForm();
    if (root.classList.contains("locked")) buildGate();
    else afterUnlock();
  });
})();
