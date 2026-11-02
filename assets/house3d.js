/* 4M Gebäudetechnik GmbH: das Haus als 3D-Anlagenschema (Three.js)
   Glashaus mit Heizung, Klima und Sanitär. Vorlauf rot, Rücklauf blau, beides Vollton;
   hart abgesetzte hellere Striche laufen in Flussrichtung. Zustand kommt aus window.M4 (assets/site.js). */
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const host = document.querySelector("[data-house]");
if (host) start(host);

function start(host) {
  const mode = host.getAttribute("data-house"); // "story" oder fest: heat | cool | water
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch (e) {
    return; // Rückfall: das SVG-Schema bleibt sichtbar
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.className = "house-canvas";
  renderer.domElement.setAttribute("aria-hidden", "true");
  host.appendChild(renderer.domElement);
  host.classList.add("gl-on");

  const labelBox = document.createElement("div");
  labelBox.className = "house-labels";
  labelBox.setAttribute("aria-hidden", "true");
  host.appendChild(labelBox);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;

  const camera = new THREE.PerspectiveCamera(28, 1, 0.5, 200);

  // ---------- Licht ----------
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(9, 18, 12);
  key.castShadow = true;
  const small = innerWidth < 820;
  key.shadow.mapSize.set(small ? 1024 : 2048, small ? 1024 : 2048);
  Object.assign(key.shadow.camera, { left: -13, right: 13, top: 13, bottom: -6, near: 1, far: 50 });
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.03;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffffff, 0.6);
  rim.position.set(-12, 8, -10);
  scene.add(rim);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x101012, 0.35));

  // ---------- Materialien ----------
  const M = {
    slab: new THREE.MeshStandardMaterial({ color: 0x18191c, roughness: 0.85 }),
    back: new THREE.MeshStandardMaterial({ color: 0x0f1012, roughness: 0.95 }),
    glass: new THREE.MeshStandardMaterial({ color: 0xc4cad1, roughness: 0.08, transparent: true, opacity: 0.06, depthWrite: false, side: THREE.DoubleSide }),
    edge: new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.32 }),
    floorEdge: new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 }),
  };
  const circuitMats = { heat: [], cool: [], water: [], shared: [] };
  const deviceMat = (k, color = 0xe9ebee, rough = 0.36) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0.04 });
    m.userData.base = 1;
    circuitMats[k].push(m);
    return m;
  };
  const darkMat = (k) => deviceMat(k, 0x2a2c30, 0.55);

  const world = new THREE.Group();
  scene.add(world);

  function add(geo, mat, x, y, z, parent = world, edges = null) {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    if (edges) {
      const l = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 25), edges);
      l.position.copy(mesh.position);
      l.rotation.copy(mesh.rotation);
      parent.add(l);
      mesh.userData.edges = l;
    }
    return mesh;
  }

  // ---------- Boden (nur Schatten, keine Fläche) ----------
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.ShadowMaterial({ opacity: 0.55 }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  world.add(ground);

  // ---------- Gebäude ----------
  const house = new THREE.Group();
  world.add(house);
  add(new THREE.BoxGeometry(10.6, 0.26, 7.4), M.slab, 0, 0.13, 0, house, M.floorEdge);
  add(new THREE.BoxGeometry(10.2, 0.2, 7), M.slab, 0, 3.4, 0, house, M.floorEdge);
  add(new THREE.BoxGeometry(10.2, 0.14, 7), M.slab, 0, 6.67, 0, house, M.floorEdge);
  add(new THREE.BoxGeometry(10.2, 6.5, 0.16), M.back, 0, 3.47, -3.5, house, M.edge);
  add(new THREE.BoxGeometry(0.1, 6.5, 7), M.glass, -5.1, 3.47, 0, house, M.edge);
  add(new THREE.BoxGeometry(0.1, 6.5, 7), M.glass, 5.1, 3.47, 0, house, M.edge);
  add(new THREE.BoxGeometry(0.08, 3.1, 7), M.glass, -0.6, 5.05, 0, house, M.edge);
  add(new THREE.BoxGeometry(0.08, 3.05, 7), M.glass, -1.9, 1.8, 0, house, M.edge);

  // Giebel hinten
  const gable = new THREE.Shape();
  gable.moveTo(-5.1, 0); gable.lineTo(5.1, 0); gable.lineTo(0, 2.75); gable.closePath();
  const gableGeo = new THREE.ExtrudeGeometry(gable, { depth: 0.16, bevelEnabled: false });
  const g = add(gableGeo, M.back, 0, 6.74, -3.58, house, M.edge);
  g.castShadow = false;
  const win = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.035, 12, 48), new THREE.MeshBasicMaterial({ color: 0xbfc4ca }));
  win.position.set(0, 7.75, -3.4);
  house.add(win);

  // Dachflächen aus Glas
  const roofLen = Math.hypot(5.75, 3.0);
  const roofAng = Math.atan2(3.0, 5.75);
  [-1, 1].forEach((s) => {
    const geo = new THREE.BoxGeometry(roofLen, 0.1, 7.7);
    const r = new THREE.Mesh(geo, M.glass);
    r.position.set(s * 2.875, 6.45 + 1.5, 0);
    r.rotation.z = -s * roofAng;
    house.add(r);
    const l = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 25), M.edge);
    l.position.copy(r.position);
    l.rotation.copy(r.rotation);
    house.add(l);
  });

  // Speicher (gehört zu Heizung und Warmwasser)
  const tankMat = deviceMat("shared", 0xeef0f2, 0.3);
  add(new THREE.CylinderGeometry(0.62, 0.62, 2.35, 48), tankMat, -3.3, 1.45, -2.4, house);
  add(new THREE.CylinderGeometry(0.64, 0.64, 0.06, 48), darkMat("shared"), -3.3, 2.0, -2.4, house);

  // ---------- Heizung ----------
  const heat = new THREE.Group();
  world.add(heat);
  const hp = deviceMat("heat");
  add(new RoundedBoxGeometry(2.35, 1.6, 1.0, 4, 0.12), hp, -7.3, 1.0, -1.3, heat);
  add(new THREE.BoxGeometry(0.16, 0.18, 0.9), darkMat("heat"), -8.2, 0.09, -1.3, heat);
  add(new THREE.BoxGeometry(0.16, 0.18, 0.9), darkMat("heat"), -6.4, 0.09, -1.3, heat);
  const fan = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.56, 0.05, 48), darkMat("heat"));
  fan.rotation.x = Math.PI / 2;
  fan.position.set(-7.7, 1.0, -0.78);
  heat.add(fan);
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.07, 24), deviceMat("heat", 0x9aa0a6, 0.4));
  hub.rotation.x = Math.PI / 2;
  hub.position.set(-7.7, 1.0, -0.76);
  heat.add(hub);
  for (let i = 0; i < 5; i++) add(new THREE.BoxGeometry(0.5, 0.035, 0.03), darkMat("heat"), -6.75, 0.62 + i * 0.19, -0.79, heat);

  const radMat = deviceMat("heat", 0xf2f3f5, 0.4);
  [0, 3.2].forEach((x) => {
    add(new RoundedBoxGeometry(1.8, 1.0, 0.2, 2, 0.04), radMat, x, 1.3, -3.26, heat);
    for (let i = 0; i < 8; i++) add(new THREE.BoxGeometry(0.05, 0.86, 0.04), darkMat("heat"), x - 0.7 + i * 0.2, 1.3, -3.14, heat);
  });

  // ---------- Klima ----------
  const cool = new THREE.Group();
  world.add(cool);
  add(new RoundedBoxGeometry(2.9, 0.72, 0.52, 4, 0.14), deviceMat("cool"), 2.5, 5.75, -3.16, cool);
  add(new THREE.BoxGeometry(2.5, 0.05, 0.05), darkMat("cool"), 2.5, 5.46, -2.9, cool);
  add(new RoundedBoxGeometry(1.7, 1.3, 0.72, 4, 0.1), deviceMat("cool"), 6.3, 4.5, -1.6, cool);
  const fan2 = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.05, 40), darkMat("cool"));
  fan2.rotation.x = Math.PI / 2;
  fan2.position.set(6.1, 4.5, -1.23);
  cool.add(fan2);
  add(new THREE.BoxGeometry(1.2, 0.06, 0.9), darkMat("cool"), 5.75, 3.82, -1.6, cool);

  // ---------- Sanitär ----------
  const water = new THREE.Group();
  world.add(water);
  add(new RoundedBoxGeometry(1.1, 0.26, 0.62, 3, 0.1), deviceMat("water"), -3.6, 4.3, -2.95, water);
  add(new RoundedBoxGeometry(0.9, 1.0, 0.04, 2, 0.02), deviceMat("water", 0x9ea4ab, 0.1), -3.6, 5.3, -3.38, water);
  add(new RoundedBoxGeometry(1.5, 0.08, 1.5, 2, 0.03), deviceMat("water"), -1.35, 3.54, -2.65, water);
  const head = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.05, 32), deviceMat("water", 0xd9dce0, 0.25));
  head.position.set(-1.35, 6.05, -2.75);
  water.add(head);
  add(new THREE.BoxGeometry(0.05, 0.05, 0.55), deviceMat("water", 0xd9dce0, 0.25), -1.35, 6.1, -3.05, water);
  const screen = add(new THREE.BoxGeometry(1.5, 2.3, 0.03), M.glass, -1.35, 4.75, -1.9, water, M.edge);
  screen.castShadow = false;

  // Duschstrahl als fallende Punkte
  const dropCount = 70;
  const dropPos = new Float32Array(dropCount * 3);
  const dropSeed = [];
  for (let i = 0; i < dropCount; i++) {
    dropSeed.push(Math.random());
    dropPos[i * 3] = -1.35 + (Math.random() - 0.5) * 0.32;
    dropPos[i * 3 + 2] = -2.75 + (Math.random() - 0.5) * 0.32;
  }
  const dropGeo = new THREE.BufferGeometry();
  dropGeo.setAttribute("position", new THREE.BufferAttribute(dropPos, 3));
  const dropMat = new THREE.PointsMaterial({ color: 0xd7dce1, size: 0.05, transparent: true, opacity: 0.9, depthWrite: false });
  dropMat.userData.base = 0.9;
  circuitMats.water.push(dropMat);
  water.add(new THREE.Points(dropGeo, dropMat));

  // ---------- Leitungen ----------
  const pipes = { heat: [], cool: [], water: [] };
  const V = (x, y, z) => new THREE.Vector3(x, y, z);

  function roundedPath(pts, r = 0.28) {
    const path = new THREE.CurvePath();
    let start = pts[0].clone();
    for (let i = 1; i < pts.length; i++) {
      const cur = pts[i];
      if (i < pts.length - 1) {
        const next = pts[i + 1];
        const d1 = cur.clone().sub(pts[i - 1]).normalize();
        const d2 = next.clone().sub(cur).normalize();
        const rr = Math.min(r, cur.distanceTo(pts[i - 1]) / 2, next.distanceTo(cur) / 2);
        const a = cur.clone().addScaledVector(d1, -rr);
        const b = cur.clone().addScaledVector(d2, rr);
        if (a.distanceTo(start) > 1e-4) path.add(new THREE.LineCurve3(start, a));
        path.add(new THREE.QuadraticBezierCurve3(a, cur.clone(), b));
        start = b;
      } else {
        path.add(new THREE.LineCurve3(start, cur.clone()));
      }
    }
    return path;
  }

  const PIPE_VERT = "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }";
  const PIPE_FRAG = `
    uniform float uTime, uLen, uDraw, uOpacity, uSpeed;
    uniform vec3 uBase, uGlow;
    varying vec2 vUv;
    void main(){
      if (vUv.x > uDraw) discard;
      float s = vUv.x * uLen - uTime * uSpeed;
      float f = fract(s / 1.15);
      vec3 c = f < 0.18 ? uGlow : uBase;
      gl_FragColor = vec4(c, uOpacity);
      #include <colorspace_fragment>
    }`;

  function pipe(k, pts, hot, radius = 0.095) {
    const path = roundedPath(pts.map((p) => V(...p)));
    const len = path.getLength();
    const geo = new THREE.TubeGeometry(path, Math.max(24, Math.ceil(len * 14)), radius, 10, false);
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 }, uLen: { value: len }, uDraw: { value: 0 }, uOpacity: { value: 1 }, uSpeed: { value: 1.3 },
        uBase: { value: new THREE.Color(hot ? 0xc1121c : 0x0e518d) },
        uGlow: { value: new THREE.Color(hot ? 0xf06a70 : 0x6fa6dc) },
      },
      vertexShader: PIPE_VERT,
      fragmentShader: PIPE_FRAG,
      transparent: true,
    });
    const mesh = new THREE.Mesh(geo, mat);
    world.add(mesh);
    pipes[k].push(mat);
    return mesh;
  }

  // Heizung: Wärmepumpe -> Speicher -> Heizkörper und zurück
  pipe("heat", [[-6.12, 1.3, -1.3], [-4.5, 1.3, -1.3], [-4.5, 1.3, -2.4], [-3.92, 1.3, -2.4]], true);
  pipe("heat", [[-3.92, 0.62, -2.4], [-4.5, 0.62, -2.4], [-4.5, 0.62, -1.3], [-6.12, 0.62, -1.3]], false);
  pipe("heat", [[-2.68, 2.25, -2.4], [-2.2, 2.25, -2.4], [-2.2, 2.25, -3.05], [3.9, 2.25, -3.05], [3.9, 1.8, -3.05]], true);
  pipe("heat", [[0.7, 2.25, -3.05], [0.7, 1.8, -3.05]], true);
  pipe("heat", [[2.5, 0.8, -3.05], [2.5, 0.48, -3.05], [-2.2, 0.48, -3.05], [-2.2, 0.48, -2.4], [-2.68, 0.48, -2.4]], false);
  pipe("heat", [[-0.7, 0.8, -3.05], [-0.7, 0.48, -3.05]], false);

  // Klima: Kältemittelleitungen zum Außengerät
  pipe("cool", [[3.95, 5.95, -3.12], [5.55, 5.95, -3.12], [5.55, 5.95, -1.8], [5.55, 5.15, -1.8]], true, 0.06);
  pipe("cool", [[5.85, 5.15, -1.42], [5.85, 5.62, -1.42], [5.85, 5.62, -3.0], [3.95, 5.62, -3.0]], false, 0.06);
  // Luftströme unter dem Innengerät
  [1.7, 2.5, 3.3].forEach((x) => {
    const pts = [];
    for (let i = 0; i <= 12; i++) pts.push([x + Math.sin(i * 0.9) * 0.1, 5.3 - i * 0.07, -2.82 + i * 0.04]);
    const m = pipe("cool", pts, false, 0.022);
    m.material.uniforms.uBase.value.set(0x1b2a3b);
    m.material.uniforms.uGlow.value.set(0x6fa6dc);
    m.material.uniforms.uSpeed.value = 0.7;
  });

  // Sanitär: Hausanschluss kalt, Warmwasser aus dem Speicher
  pipe("water", [[-9.6, 0.12, 1.4], [-4.75, 0.12, 1.4], [-4.75, 0.12, -3.18], [-4.75, 5.55, -3.18], [-1.15, 5.55, -3.18], [-1.15, 5.2, -3.18]], false);
  pipe("water", [[-4.75, 0.9, -3.18], [-4.2, 0.9, -3.18], [-4.2, 0.9, -2.4], [-3.92, 0.9, -2.4]], false);
  pipe("water", [[-4.75, 4.12, -3.18], [-4.0, 4.12, -3.18]], false);
  pipe("water", [[-2.68, 1.95, -2.4], [-2.55, 1.95, -2.4], [-2.55, 5.32, -2.4], [-2.55, 5.32, -3.1], [-1.55, 5.32, -3.1], [-1.55, 5.2, -3.1]], true);
  pipe("water", [[-2.55, 3.95, -2.4], [-2.55, 3.95, -3.1], [-3.2, 3.95, -3.1]], true);

  // ---------- Beschriftungen ----------
  const LABELS = [
    ["heat", "Wärmepumpe", V(-7.3, 2.25, -1.3)],
    ["heat", "Speicher", V(-3.3, 2.95, -2.4)],
    ["heat", "Heizkörper", V(1.6, 2.65, -3.1)],
    ["cool", "Klimagerät", V(2.5, 6.55, -3.1)],
    ["cool", "Außengerät", V(6.3, 5.55, -1.6)],
    ["water", "Hausanschluss", V(-8.2, 0.75, 1.4)],
    ["water", "Waschtisch", V(-3.6, 4.85, -2.95)],
    ["water", "Dusche", V(-1.35, 6.55, -2.75)],
    ["water", "Speicher", V(-3.3, 2.95, -2.4)],
  ].map(([k, text, pos]) => {
    const el = document.createElement("span");
    el.className = "hl";
    el.textContent = text;
    labelBox.appendChild(el);
    return { k, el, pos, on: false };
  });

  // ---------- Kamera-Stationen ----------
  const ST = {
    intro: { az: 0.55, el: 0.15, r: 38, t: V(-0.6, 3.7, 0) },
    heat: { az: -0.5, el: 0.14, r: 29, t: V(-2.6, 2.2, -1.2) },
    cool: { az: 0.6, el: 0.16, r: 31, t: V(2.6, 4.4, -1.4) },
    water: { az: -0.28, el: 0.18, r: 29, t: V(-2.9, 3.9, -1.6) },
  };
  const FIX_X = { heat: 2.4, cool: -0.8, water: 2.2 };
  const KEYS = [["intro", 0], ["heat", 0.36], ["cool", 0.62], ["water", 0.88]];
  const smooth = (x) => x * x * (3 - 2 * x);

  function wanted(p) {
    // Unterseiten: etwas weiter weg und so ausgerichtet, dass das ganze Haus neben dem Text steht
    if (mode !== "story") return { ...ST[mode], r: ST[mode].r * 1.18, t: ST[mode].t.clone().add(V(FIX_X[mode], 0.5, 0)) };
    for (let i = 0; i < KEYS.length - 1; i++) {
      const [a, pa] = KEYS[i], [b, pb] = KEYS[i + 1];
      if (p <= pb) {
        const t = smooth(Math.min(1, Math.max(0, (p - pa) / (pb - pa))));
        const A = ST[a], B = ST[b];
        return { az: A.az + (B.az - A.az) * t, el: A.el + (B.el - A.el) * t, r: A.r + (B.r - A.r) * t, t: A.t.clone().lerp(B.t, t) };
      }
    }
    return { ...ST.water };
  }

  const cam = { az: ST.intro.az + 0.5, el: ST.intro.el + 0.08, r: ST.intro.r + 9, t: ST.intro.t.clone() };
  if (mode !== "story") Object.assign(cam, { az: ST[mode].az + 0.5, el: ST[mode].el + 0.08, r: ST[mode].r + 8, t: ST[mode].t.clone() });
  const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  addEventListener("pointermove", (e) => {
    pointer.x = e.clientX / innerWidth - 0.5;
    pointer.y = e.clientY / innerHeight - 0.5;
  }, { passive: true });

  // ---------- Größe und Bildausschnitt ----------
  let W = 0, H = 0, shiftX = 0, shiftY = 0, rScale = 1;
  function resize() {
    const r = host.getBoundingClientRect();
    W = Math.round(r.width);
    H = Math.round(r.height);
    if (!W || !H) return;
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    // Das Haus rückt neben den Text: auf breiten Bildschirmen nach rechts, auf schmalen nach oben
    const wide = W / H > 1.05;
    shiftX = wide ? (mode === "story" ? (camera.aspect < 1.5 ? 0.2 : 0.17) : 0.23) : 0;
    shiftY = wide ? 0 : 0.25;
    // Schmale Bühnen (Tablet, Handy): Kamera weiter weg, damit das ganze Haus in die Breite passt
    rScale = camera.aspect < 1.6 ? Math.min(2.5, 1.55 / camera.aspect) : 1;
    camera.setViewOffset(W * (1 + 2 * shiftX), H * (1 + 2 * shiftY), 0, 2 * shiftY * H, W, H);
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(host);
  resize();
  cam.r *= rScale;

  // ---------- Schleife ----------
  let visible = true;
  new IntersectionObserver((es) => { visible = es[0].isIntersecting; }).observe(host);
  const fade = { heat: 1, cool: 1, water: 1, shared: 1 };
  let introT = reduce ? 1 : 0;
  let time = 0;
  let last = performance.now();
  const tmp = new THREE.Vector3();

  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const state = window.M4 || { p: 0, k: "intro", ready: true };
    if (!visible || !W || !H || document.hidden || !state.ready) return;

    if (!reduce) time += dt;
    introT = Math.min(1, introT + dt / 2.2);

    // Kamera folgt kritisch gedämpft, nie sprunghaft
    const want = wanted(state.p);
    // Hochformat: Blick mehr zur Hausmitte, damit nichts aus dem Bild läuft
    if (camera.aspect < 1.05) {
      want.t = want.t.clone().setX(want.t.x * 0.45 - 0.3);
      want.r = Math.max(want.r, 35);
    }
    const k = 1 - Math.exp(-dt * (reduce ? 60 : 3.2));
    const idle = reduce ? 0 : Math.sin(time * 0.25) * 0.05;
    pointer.sx += (pointer.x - pointer.sx) * (1 - Math.exp(-dt * 4));
    pointer.sy += (pointer.y - pointer.sy) * (1 - Math.exp(-dt * 4));
    cam.az += (want.az + idle + pointer.sx * 0.16 - cam.az) * k;
    cam.el += (want.el - pointer.sy * 0.06 - cam.el) * k;
    cam.r += (want.r * rScale - cam.r) * k;
    cam.t.lerp(want.t, k);
    camera.position.set(
      cam.t.x + cam.r * Math.cos(cam.el) * Math.sin(cam.az),
      cam.t.y + cam.r * Math.sin(cam.el),
      cam.t.z + cam.r * Math.cos(cam.el) * Math.cos(cam.az)
    );
    camera.lookAt(cam.t);

    // Aktiver Kreis voll, die anderen gedimmt
    const active = state.k;
    const fk = 1 - Math.exp(-dt * 6);
    ["heat", "cool", "water"].forEach((c) => {
      const target = active === "intro" || active === c ? 1 : 0.1;
      fade[c] += (target - fade[c]) * (reduce ? 1 : fk);
    });
    fade.shared = Math.max(fade.heat, fade.water);
    Object.keys(circuitMats).forEach((c) => {
      circuitMats[c].forEach((m) => {
        const op = m.userData.base * fade[c];
        const tr = op < 0.99;
        if (m.transparent !== tr) { m.transparent = tr; m.needsUpdate = true; }
        m.opacity = op;
        m.depthWrite = op > 0.5;
      });
    });

    // Leitungen zeichnen sich beim Start, dann fließen die Impulse
    let i = 0;
    Object.keys(pipes).forEach((c) => {
      pipes[c].forEach((u) => {
        const d = Math.min(1, Math.max(0, (introT - 0.15 - i * 0.025) / 0.45));
        u.uniforms.uDraw.value = d < 1 ? d * d * (3 - 2 * d) : 1.01;
        u.uniforms.uTime.value = time;
        u.uniforms.uOpacity.value = fade[c];
        u.depthWrite = fade[c] > 0.5;
        i++;
      });
    });

    // Duschstrahl
    for (let n = 0; n < dropCount; n++) {
      const f = (dropSeed[n] + time * 1.4) % 1;
      dropPos[n * 3 + 1] = 5.98 - f * 2.4;
    }
    dropGeo.attributes.position.needsUpdate = true;

    // Beschriftungen nur für den aktiven Kreis
    LABELS.forEach((L) => {
      const on = active === L.k && fade[L.k] > 0.6;
      if (on !== L.on) { L.el.classList.toggle("on", on); L.on = on; }
      if (!on && !L.el.classList.contains("on")) return;
      tmp.copy(L.pos).project(camera);
      const half = L.el.offsetWidth / 2 + 10;
      const x = Math.min(W - half, Math.max(half, (tmp.x * 0.5 + 0.5) * W));
      const y = (-tmp.y * 0.5 + 0.5) * H;
      L.el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -100%)`;
    });

    renderer.render(scene, camera);
  }
  requestAnimationFrame(frame);
}
