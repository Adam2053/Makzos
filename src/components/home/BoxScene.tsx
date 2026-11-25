"use client";

import { useEffect, useImperativeHandle, useRef, type Ref } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { byId } from "@/lib/products";
import { MOTION_OK, gsap } from "@/lib/motion";
import { makhanaImage } from "./Makhana";
import { spiceDataUri } from "./spicePattern";

/**
 * The Makzo's mailer box in real 3D (three.js), printed as box option 1 (makzosassets): white
 * board, Paprika sides, kraft inside, the wordmark on the front and the spice band across the
 * lid. The lid is hinged at the back with a tuck lip and two white rounded ears.
 *
 * The packs stand in it like a deck of cards, the first pick at the back; a new one drops in,
 * hovering lifts one, tapping takes it out. pack() lays the deck down flat, swings the lid shut,
 * stamps the seal, then hands a picture of the closed box to `fly` (the cart flies it into the
 * bag) and, once `done` has emptied the picks, slides a fresh open box in.
 *
 * Units are the old CSS box's (cqw of a 100-wide stage): 36 wide, 52 deep, 21 tall.
 */
export type BoxSceneHandle = { pack: (fly: (snapshot: HTMLElement) => void, done: () => void) => void };

const W = 36, D = 52, H = 21, T = 0.6;
const PH = 37, PW = PH * (960 / 1414);
const LID_OPEN = THREE.MathUtils.degToRad(-104);
const PUFF = 1.15;
const LEAN = THREE.MathUtils.degToRad(-9);
const slotZ = (i: number) => -19 + i * 6.2;


type Built = {
  renderer: THREE.WebGLRenderer; scene: THREE.Scene; camera: THREE.PerspectiveCamera;
  root: THREE.Group; lid: THREE.Group; deck: THREE.Group; seal: THREE.Mesh;
  drawFront: (label: string) => void; dispose: () => void;
};

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((ok, fail) => { const i = new Image(); i.onload = () => ok(i); i.onerror = fail; i.src = src; });
}

function canvasTexture(cw: number, ch: number, draw: (c: CanvasRenderingContext2D) => void) {
  const canvas = document.createElement("canvas");
  canvas.width = cw; canvas.height = ch;
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  const redraw = () => { const c = canvas.getContext("2d")!; c.clearRect(0, 0, cw, ch); draw(c); tex.needsUpdate = true; };
  redraw();
  return { tex, redraw };
}

/** Letter-spaced text, with a fallback for browsers without ctx.letterSpacing. */
function spacedText(c: CanvasRenderingContext2D, text: string, x: number, y: number, spacing: number) {
  const ls = c as unknown as { letterSpacing?: string };
  if (ls.letterSpacing !== undefined) { ls.letterSpacing = `${spacing}px`; c.fillText(text, x + spacing / 2, y); ls.letterSpacing = "0px"; return; }
  const widths = [...text].map((ch) => c.measureText(ch).width);
  let at = x - (widths.reduce((a, b) => a + b, 0) + spacing * (text.length - 1)) / 2;
  const align = c.textAlign; c.textAlign = "left";
  [...text].forEach((ch, i) => { c.fillText(ch, at, y); at += widths[i] + spacing; });
  c.textAlign = align;
}

/** Fine paper grain, as a bump map: the board's surface catches the light the way card does. */
function grainTexture() {
  const n = 256, c = document.createElement("canvas"); c.width = c.height = n;
  const x = c.getContext("2d")!, img = x.createImageData(n, n);
  for (let i = 0; i < n * n; i++) { const v = 118 + Math.random() * 20; img.data.set([v, v, v, 255], i * 4); }
  x.putImageData(img, 0, 0);
  // Faint ribs, the flutes of the corrugated board showing through the liner.
  x.globalAlpha = 0.06; x.fillStyle = "#000";
  for (let y = 0; y < n; y += 8) x.fillRect(0, y, n, 3);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(5, 5);
  return t;
}

/** Kraft liner: warm brown with fibres and specks, shaded toward `shade` edges (inside corners). */
function kraftTexture(w: number, h: number, shade: { bottom?: number; sides?: number; edges?: number } = {}) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const x = c.getContext("2d")!;
  x.fillStyle = "#b9875a"; x.fillRect(0, 0, w, h);
  for (let i = 0; i < (w * h) / 90; i++) {
    const px = Math.random() * w, py = Math.random() * h, len = 4 + Math.random() * 14, a = Math.random() * Math.PI;
    x.strokeStyle = Math.random() < 0.5 ? "rgba(120,70,25,.18)" : "rgba(235,190,140,.18)";
    x.lineWidth = 0.6 + Math.random();
    x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * len, py + Math.sin(a) * len); x.stroke();
  }
  for (let i = 0; i < (w * h) / 900; i++) { x.fillStyle = `rgba(70,35,10,${0.15 + Math.random() * 0.25})`; x.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5); }
  // Ambient occlusion, painted in: the board darkens where it meets another.
  const fade = (x0: number, y0: number, x1: number, y1: number, a: number) => {
    const g = x.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, `rgba(60,28,5,${a})`); g.addColorStop(1, "rgba(60,28,5,0)");
    x.fillStyle = g; x.fillRect(0, 0, w, h);
  };
  if (shade.bottom) fade(0, h, 0, h * 0.55, shade.bottom);
  if (shade.sides) { fade(0, 0, w * 0.12, 0, shade.sides); fade(w, 0, w * 0.88, 0, shade.sides); }
  if (shade.edges) { fade(0, 0, w * 0.15, 0, shade.edges); fade(w, 0, w * 0.85, 0, shade.edges); fade(0, 0, 0, h * 0.12, shade.edges); fade(0, h, 0, h * 0.88, shade.edges); }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}

/** A pillow pack: a plane puffed out in the middle, crimped flat along the top and bottom seals. */
function pillowGeometry(w: number, h: number, depth: number) {
  const g = new THREE.PlaneGeometry(w, h, 28, 40);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const u = p.getX(i) / w + 0.5, v = p.getY(i) / h + 0.5;
    const across = Math.pow(Math.sin(Math.PI * u), 0.55);
    const t = THREE.MathUtils.clamp((v - 0.07) / 0.86, 0, 1);
    const along = Math.pow(Math.sin(Math.PI * t), 0.45);
    p.setZ(i, depth * across * along);
  }
  g.computeVertexNormals();
  return g;
}

function build(host: HTMLElement, fonts: { label: string; play: string }): Built {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  // Neutral tone mapping keeps the brand's Paprika true while the highlights roll off like a photo.
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  // Sized by its box, never by its pixel buffer (which is the CSS size times the pixel ratio).
  Object.assign(renderer.domElement.style, { display: "block", width: "100%", height: "100%", touchAction: "pan-y" });
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(22, 1, 10, 1000);
  // From the front right and a little above, as the CSS box was turned.
  const az = THREE.MathUtils.degToRad(34), el = THREE.MathUtils.degToRad(22), dist = 300;
  const target = new THREE.Vector3(0, 30, -8);
  camera.position.set(target.x + dist * Math.sin(az) * Math.cos(el), target.y + dist * Math.sin(el), target.z + dist * Math.cos(az) * Math.cos(el));
  camera.lookAt(target);

  // A studio: soft room light for the reflections and fill, one key light from above left.
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const env = pmrem.fromScene(room, 0.04).texture;
  room.dispose(); pmrem.dispose();
  scene.environment = env;
  scene.environmentIntensity = 0.6;
  scene.add(new THREE.HemisphereLight(0xffffff, 0xd9cfc4, 0.45));
  const sun = new THREE.DirectionalLight(0xfff6ec, 2.4);
  sun.position.set(-15, 170, 45);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -70, right: 70, top: 70, bottom: -70, near: 10, far: 300 });
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.04;
  scene.add(sun);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.ShadowMaterial({ opacity: 0.18 }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const disposables: { dispose: () => void }[] = [];
  disposables.push(env);
  const grain = grainTexture();
  disposables.push(grain);
  const mat = (o: THREE.MeshStandardMaterialParameters) => {
    const m = new THREE.MeshStandardMaterial({ roughness: 0.78, bumpMap: grain, bumpScale: 0.35, ...o }); disposables.push(m); return m;
  };
  const tex = (t: THREE.Texture) => { disposables.push(t); return t; };
  // Coated white board, a little satin; kraft is matt and fibrous.
  const white = mat({ color: "#fbfaf7", roughness: 0.62 });
  const kraft = mat({ map: tex(kraftTexture(512, 512)), roughness: 0.95, bumpScale: 0.6 });
  const kraftWall = mat({ map: tex(kraftTexture(1024, 600, { bottom: 0.45, sides: 0.25 })), roughness: 0.95, bumpScale: 0.6 });
  const kraftLid = mat({ map: tex(kraftTexture(1024, 1400, { edges: 0.28 })), roughness: 0.97, bumpScale: 0.6 });
  const kraftFloor = mat({ map: tex(kraftTexture(1024, 1400, { edges: 0.5 })), roughness: 0.95, bumpScale: 0.6 });

  // ---- Printed faces, drawn on canvases ----
  let logo: HTMLImageElement | null = null, spice: HTMLImageElement | null = null, seed: HTMLImageElement | null = null;
  let label = "Your box";

  const front = canvasTexture(1024, Math.round(1024 * H / W), (c) => {
    const { width: cw, height: ch } = c.canvas;
    const g = c.createLinearGradient(0, 0, 0, ch); g.addColorStop(0, "#ffffff"); g.addColorStop(1, "#ecebe7");
    c.fillStyle = g; c.fillRect(0, 0, cw, ch);
    if (logo) { const lw = cw * 0.64, lh = lw * (logo.height / logo.width); c.drawImage(logo, (cw - lw) / 2, ch * 0.36 - lh / 2, lw, lh); }
    c.fillStyle = "#b8351a"; c.textAlign = "center"; c.textBaseline = "middle";
    c.font = `${Math.round(ch * 0.064)}px ${fonts.label}`;
    spacedText(c, "ROASTED MAKHANA", cw / 2, ch * 0.62, ch * 0.024);
    // The count, on a black tag in the top corner.
    c.save(); c.translate(cw * 0.86, ch * 0.12); c.rotate(THREE.MathUtils.degToRad(5));
    c.font = `${Math.round(ch * 0.07)}px ${fonts.play}`;
    const tw = c.measureText(label).width + ch * 0.08, th = ch * 0.11;
    c.fillStyle = "#181818"; c.beginPath(); c.roundRect(-tw / 2, -th / 2, tw, th, th / 2); c.fill();
    c.fillStyle = "#fff"; c.fillText(label, 0, ch * 0.004);
    c.restore();
  });
  const side = canvasTexture(1024, Math.round(1024 * H / D), (c) => {
    const { width: cw, height: ch } = c.canvas;
    const g = c.createLinearGradient(0, 0, 0, ch); g.addColorStop(0, "#f2563a"); g.addColorStop(1, "#d63d1f");
    c.fillStyle = g; c.fillRect(0, 0, cw, ch);
    const sh = ch * 0.15, sy = ch - ch * 0.08 - sh;
    c.fillStyle = "#181818"; c.fillRect(0, sy, cw, sh);
    c.fillStyle = "#fff"; c.textAlign = "center"; c.textBaseline = "middle";
    c.font = `${Math.round(sh * 0.62)}px ${fonts.label}`;
    spacedText(c, "NOTHING ARTIFICIAL. NOTHING UNNECESSARY.", cw / 2, sy + sh / 2, sh * 0.06);
  });
  // The lid top: the canvas's top edge is the hinge. The spice band runs across near it.
  const lidTop = canvasTexture(1024, Math.round(1024 * D / (W + 0.8)), (c) => {
    const { width: cw, height: ch } = c.canvas;
    const g = c.createLinearGradient(0, 0, 0, ch); g.addColorStop(0, "#ffffff"); g.addColorStop(1, "#efede9");
    c.fillStyle = g; c.fillRect(0, 0, cw, ch);
    if (spice) {
      const tile = Math.round(cw * 12 / (W + 0.8));
      const p = document.createElement("canvas"); p.width = p.height = tile; p.getContext("2d")!.drawImage(spice, 0, 0, tile, tile);
      c.fillStyle = c.createPattern(p, "repeat")!;
      c.fillRect(0, ch * 0.12, cw, ch * 0.32);
    }
  });
  const sealTex = canvasTexture(256, 256, (c) => {
    c.fillStyle = "#fff"; c.strokeStyle = "#181818"; c.lineWidth = 10;
    c.beginPath(); c.arc(128, 128, 120, 0, Math.PI * 2); c.fill(); c.stroke();
    if (seed) c.drawImage(seed, 128 - 40, 52, 80, 80 * (144.36 / 125));
    c.fillStyle = "#181818"; c.textAlign = "center"; c.textBaseline = "middle";
    c.font = `46px ${fonts.play}`; c.fillText("Packed", 128, 186);
  });
  disposables.push(front.tex, side.tex, lidTop.tex, sealTex.tex);
  const frontMat = mat({ map: front.tex, roughness: 0.6 });
  const sideMat = mat({ map: side.tex, roughness: 0.6 });
  const lidTopMat = mat({ map: lidTop.tex, roughness: 0.6 });

  Promise.all([loadImage("/brand/logo-paprika.png"), loadImage(spiceDataUri("#fff", 480)), loadImage(makhanaImage("fill").slice(5, -2))])
    .then(([l, s, m]) => { logo = l; spice = s; seed = m; front.redraw(); lidTop.redraw(); sealTex.redraw(); })
    .catch(() => {});
  document.fonts?.ready.then(() => { front.redraw(); side.redraw(); sealTex.redraw(); });

  // ---- The box: thin boards, so the rolled edges catch the light ----
  const root = new THREE.Group();
  scene.add(root);
  const board = (w: number, h: number, d: number, mats: THREE.Material[], x: number, y: number, z: number, parent: THREE.Object3D = root) => {
    // Rounded a little at every edge, as folded board is; the face groups stay, so each side keeps its print.
    const g = new RoundedBoxGeometry(w, h, d, 3, Math.min(0.22, Math.min(w, h, d) / 2 - 0.02)); disposables.push(g);
    const m = new THREE.Mesh(g, mats); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
  };
  // Face order: +x, -x, +y, -y, +z, -z.
  board(W, H, T, [white, white, white, white, frontMat, kraftWall], 0, H / 2, D / 2 - T / 2);
  board(W, H, T, [white, white, white, white, kraftWall, white], 0, H / 2, -D / 2 + T / 2);
  board(T, H, D - 2 * T, [kraftWall, sideMat, white, white, white, white], -W / 2 + T / 2, H / 2, 0);
  board(T, H, D - 2 * T, [sideMat, kraftWall, white, white, white, white], W / 2 - T / 2, H / 2, 0);
  board(W - 2 * T, T, D - 2 * T, [kraft, kraft, kraftFloor, kraft, kraft, kraft], 0, T / 2, 0);

  // Contact shadow: the soft dark where the box sits on the table, which a shadow map can't give.
  const contact = document.createElement("canvas"); contact.width = 256; contact.height = 320;
  const cx = contact.getContext("2d")!;
  cx.shadowColor = "rgba(0,0,0,.55)"; cx.shadowBlur = 28; cx.shadowOffsetX = 1000;
  cx.fillStyle = "#000"; cx.fillRect(40 - 1000, 40, 176, 240);
  const contactTex = tex(new THREE.CanvasTexture(contact));
  const contactMesh = new THREE.Mesh(new THREE.PlaneGeometry(W * 1.45, D * 1.33), new THREE.MeshBasicMaterial({ map: contactTex, transparent: true, depthWrite: false, opacity: 0.7 }));
  disposables.push(contactMesh.geometry, contactMesh.material as THREE.Material);
  contactMesh.rotation.x = -Math.PI / 2;
  contactMesh.position.y = 0.03;
  contactMesh.renderOrder = -1;
  root.add(contactMesh);

  const seal = new THREE.Mesh(new THREE.CircleGeometry(4.7, 48), new THREE.MeshPhysicalMaterial({ map: sealTex.tex, transparent: true, roughness: 0.45, clearcoat: 0.8, clearcoatRoughness: 0.25 }));
  disposables.push(seal.geometry, seal.material as THREE.Material);
  seal.position.set(W / 2 - 6.5, 5.8, D / 2 + 0.08);
  seal.rotation.z = THREE.MathUtils.degToRad(-10);
  seal.visible = false;
  root.add(seal);

  // ---- The lid, hinged on the top of the back wall ----
  const lid = new THREE.Group();
  lid.position.set(0, H + 0.02, -D / 2);
  lid.rotation.x = LID_OPEN;
  root.add(lid);
  board(W + 0.8, T, D, [white, white, lidTopMat, kraftLid, white, white], 0, T / 2, D / 2, lid);
  board(W - 1, 5, T, [white, white, white, white, kraft, kraft], 0, -2.5 + T / 2, D - T - T / 2 - 0.05, lid);
  // The ears: white dust flaps, rounded at the bottom, hanging from the lid's sides.
  const eh = H * 0.82, z0 = D * 0.07, z1 = D * 0.93;
  const ear = new THREE.Shape();
  ear.moveTo(z0, 0); ear.lineTo(z1, 0); ear.lineTo(z1, -eh * 0.35);
  ear.bezierCurveTo(z1, -eh * 1.08, z0, -eh * 1.08, z0, -eh * 0.35); ear.closePath();
  const earGeo = new THREE.ExtrudeGeometry(ear, { depth: 0.24, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.08, bevelSegments: 2, curveSegments: 32 }); disposables.push(earGeo);
  // The ears face sideways, away from the key light: a whisper of glow keeps them reading as white board.
  const earMat = mat({ color: "#fbfaf7", roughness: 0.62, emissive: "#ffffff", emissiveIntensity: 0.2 });
  for (const sx of [-1, 1]) {
    const m = new THREE.Mesh(earGeo, earMat);
    m.rotation.y = -Math.PI / 2;
    m.position.set(sx * (W / 2 - T - 0.05) + (sx < 0 ? 0.3 : 0), 0, 0);
    m.castShadow = true;
    lid.add(m);
  }

  const deck = new THREE.Group();
  deck.position.y = T;
  root.add(deck);

  return {
    renderer, scene, camera, root, lid, deck, seal,
    drawFront: (l) => { label = l; front.redraw(); },
    dispose: () => { disposables.forEach((d) => d.dispose()); renderer.dispose(); renderer.domElement.remove(); },
  };
}

/**
 * One pack: a group pivoting on its bottom edge, holding the bag. The bag is two puffed
 * halves, front and back, with a glossy film over the print. The front half is the group's
 * first child (lifted on hover); the back hangs off it.
 */
const textures = new Map<string, THREE.Texture>();
function makePack(id: string) {
  let tex = textures.get(id);
  if (!tex) { tex = new THREE.TextureLoader().load(byId(id).pack); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8; textures.set(id, tex); }
  const geo = pillowGeometry(PW, PH, PUFF);
  const film = new THREE.MeshPhysicalMaterial({ map: tex, transparent: true, alphaTest: 0.4, roughness: 0.38, clearcoat: 0.7, clearcoatRoughness: 0.22, sheen: 0.2 });
  const depth = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: tex, alphaTest: 0.4 });
  const m = new THREE.Mesh(geo, film);
  m.position.y = PH / 2;
  m.castShadow = true; m.receiveShadow = true;
  m.customDepthMaterial = depth;
  const back = new THREE.Mesh(geo, film);
  back.scale.z = -1;
  back.castShadow = true; back.receiveShadow = true;
  back.customDepthMaterial = depth;
  m.add(back);
  const g = new THREE.Group();
  g.add(m);
  g.rotation.x = LEAN;
  return g;
}
function disposePack(g: THREE.Group) {
  const m = g.children[0] as THREE.Mesh;
  m.geometry.dispose(); (m.material as THREE.Material).dispose(); m.customDepthMaterial?.dispose();
}

export function BoxScene({ picks, onDrop, locked, label, ref }: {
  picks: string[]; onDrop: (i: number) => void; locked: boolean; label: string; ref: Ref<BoxSceneHandle>;
}) {
  const host = useRef<HTMLDivElement>(null);
  const built = useRef<Built | null>(null);
  const packs = useRef<{ id: string; g: THREE.Group }[]>([]);
  const hovered = useRef(-1);
  const lockedRef = useRef(locked);
  const dropRef = useRef(onDrop);
  useEffect(() => { lockedRef.current = locked; dropRef.current = onDrop; });

  // ---- Set up the scene once ----
  useEffect(() => {
    const el = host.current!;
    const css = getComputedStyle(el);
    const b = build(el, { label: css.getPropertyValue("--font-label").trim() || "sans-serif", play: css.getPropertyValue("--font-play").trim() || "sans-serif" });
    built.current = b;

    const size = () => { const r = el.getBoundingClientRect(); b.renderer.setSize(r.width, r.height, false); b.camera.aspect = r.width / Math.max(r.height, 1); b.camera.updateProjectionMatrix(); };
    size();
    const ro = new ResizeObserver(size); ro.observe(el);
    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }); io.observe(el);
    const tick = () => { if (visible) b.renderer.render(b.scene, b.camera); };
    gsap.ticker.add(tick);

    // Hover lifts a pack out of the deck like a card; a tap takes it out.
    const ray = new THREE.Raycaster(), pt = new THREE.Vector2();
    const hit = (e: PointerEvent) => {
      const r = b.renderer.domElement.getBoundingClientRect();
      pt.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(pt, b.camera);
      const meshes = packs.current.map((p) => p.g.children[0]);
      const h = ray.intersectObjects(meshes, false)[0];
      return h ? meshes.indexOf(h.object) : -1;
    };
    const lift = (i: number, on: boolean) => { const p = packs.current[i]; if (p) gsap.to(p.g.children[0].position, { y: PH / 2 + (on ? PH * 0.42 : 0), duration: 0.4, ease: on ? "back.out(1.8)" : "power2.out" }); };
    const move = (e: PointerEvent) => {
      const i = lockedRef.current ? -1 : hit(e);
      if (i === hovered.current) return;
      lift(hovered.current, false); lift(i, true); hovered.current = i;
      b.renderer.domElement.style.cursor = i >= 0 ? "pointer" : "";
    };
    const leave = () => { lift(hovered.current, false); hovered.current = -1; b.renderer.domElement.style.cursor = ""; };
    const click = (e: PointerEvent) => { if (lockedRef.current) return; const i = hit(e); if (i >= 0) { hovered.current = -1; dropRef.current(i); } };
    const cv = b.renderer.domElement;
    cv.addEventListener("pointermove", move); cv.addEventListener("pointerleave", leave); cv.addEventListener("click", click);

    return () => {
      gsap.ticker.remove(tick); ro.disconnect(); io.disconnect();
      cv.removeEventListener("pointermove", move); cv.removeEventListener("pointerleave", leave); cv.removeEventListener("click", click);
      packs.current.forEach((p) => disposePack(p.g)); packs.current = [];
      b.dispose(); built.current = null;
    };
  }, []);

  useEffect(() => { built.current?.drawFront(label); }, [label]);

  // ---- Keep the deck in step with the picks ----
  useEffect(() => {
    const b = built.current;
    if (!b) return;
    const prev = packs.current;
    const motion = window.matchMedia(MOTION_OK).matches;
    const place = (g: THREE.Group, i: number) => { g.position.set(0, 0, slotZ(i)); g.rotation.x = LEAN; };
    const dropIn = (g: THREE.Group, delay = 0) => {
      const m = g.children[0] as THREE.Mesh, mt = m.material as THREE.MeshStandardMaterial;
      if (!motion) return;
      gsap.fromTo(m.position, { y: PH / 2 + 46 }, { y: PH / 2, duration: 0.55, delay, ease: "back.out(1.3)" });
      gsap.fromTo(mt, { opacity: 0 }, { opacity: 1, duration: 0.25, delay });
    };
    const same = (n: number) => prev.slice(0, n).every((p, i) => p.id === picks[i]);

    if (picks.length > prev.length && same(prev.length)) {
      // Added at the end: drop the new ones in.
      picks.slice(prev.length).forEach((id, k) => {
        const g = makePack(id); place(g, prev.length + k); b.deck.add(g); dropIn(g, k * 0.05);
        prev.push({ id, g });
      });
    } else if (picks.length === prev.length - 1) {
      // One taken out: it goes, the ones in front slide back a slot.
      let gone = picks.findIndex((id, i) => id !== prev[i].id);
      if (gone < 0) gone = prev.length - 1;
      const [p] = prev.splice(gone, 1);
      gsap.killTweensOf(p.g.children[0].position);
      b.deck.remove(p.g); disposePack(p.g);
      prev.forEach((q, i) => gsap.to(q.g.position, { z: slotZ(i), duration: motion ? 0.35 : 0, ease: "power2.out" }));
    } else {
      // Anything else (a combo, a fresh box): start the deck over.
      prev.forEach((p) => { gsap.killTweensOf([p.g.position, p.g.rotation, p.g.children[0].position]); b.deck.remove(p.g); disposePack(p.g); });
      prev.length = 0;
      picks.forEach((id, i) => { const g = makePack(id); place(g, i); b.deck.add(g); dropIn(g, i * 0.05); prev.push({ id, g }); });
    }
    hovered.current = -1;
  }, [picks]);

  useImperativeHandle(ref, () => ({
    pack: (fly, done) => {
      const b = built.current;
      if (!b) return;
      const deck = packs.current;
      deck.forEach((p) => gsap.to(p.g.children[0].position, { y: PH / 2, duration: 0.2 }));
      const tl = gsap.timeline();
      // The deck lies down flat, back pack first, each landing on the last.
      deck.forEach((p, i) => {
        tl.to(p.g.rotation, { x: -Math.PI / 2, duration: 0.42, ease: "power2.inOut" }, i * 0.07)
          .to(p.g.position, { z: PH / 2, y: PUFF + 0.1 + i * PUFF * 2.05, duration: 0.42, ease: "power2.inOut" }, i * 0.07);
      });
      tl
        // The lid swings over on its hinge: up off the back, a breath at the top, then down.
        .to(b.lid.rotation, { x: THREE.MathUtils.degToRad(-62), duration: 0.42, ease: "power2.inOut" }, "-=0.2")
        .to(b.lid.rotation, { x: 0, duration: 0.26, ease: "power3.in" })
        .to(b.root.position, { y: -0.8, duration: 0.08, yoyo: true, repeat: 1, ease: "power1.out" })
        // The seal goes on.
        .call(() => { b.seal.visible = true; })
        .fromTo(b.seal.scale, { x: 2.2, y: 2.2 }, { x: 1, y: 1, duration: 0.38, ease: "back.out(2.2)" })
        .fromTo(b.seal.rotation, { z: THREE.MathUtils.degToRad(30) }, { z: THREE.MathUtils.degToRad(-10), duration: 0.38, ease: "back.out(2.2)" }, "<")
        .to({}, { duration: 0.3 })
        // Into the bag: a picture of the closed box is what the cart flies.
        .call(() => {
          const cv = b.renderer.domElement;
          b.renderer.render(b.scene, b.camera);
          const img = new Image();
          img.src = cv.toDataURL("image/png");
          Object.assign(img.style, { position: "absolute", inset: "0", width: "100%", height: "100%" });
          img.setAttribute("aria-hidden", "true");
          // Decoded first, so the copy the cart clones is never blank.
          img.decode().catch(() => {}).then(() => {
            host.current?.appendChild(img);
            fly(img);
            img.remove();
            cv.style.opacity = "0";
          });
        })
        .to({}, { duration: 0.75 })
        // A fresh, open box slides in.
        .call(() => {
          done();
          b.lid.rotation.x = LID_OPEN;
          b.seal.visible = false;
          b.root.position.y = -10;
          gsap.to(b.root.position, { y: 0, duration: 0.5, ease: "power3.out" });
          gsap.to(b.renderer.domElement.style, { opacity: 1, duration: 0.35 });
        });
    },
  }), []);

  return <div ref={host} style={{ position: "absolute", inset: 0, overflow: "hidden" }} />;
}
