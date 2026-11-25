"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { FLAVOURS, productHref } from "@/lib/products";
import { MOTION_OK, gsap } from "@/lib/motion";
import ui from "@/components/home/ui.module.css";
import styles from "./conveyor.module.css";

/**
 * The line, in real 3D (three.js): a steel conveyor loop in three-quarter perspective, toy-factory
 * style. Plates of each flavour's ingredients (modelled in 3D), with a heap of raw makhana, ride
 * down into the Makzo's roaster and come out the other side as that flavour's pack, lying on
 * its back on the plate as a puffed bag. It never stops: off the right edge of the
 * frame every plate quietly swaps back to the next flavour's ingredients, so the loop runs forever.
 *
 * The belt always runs slowly, at one steady pace. Hovering a plate lifts it and names the flavour; a tap opens it.
 * Reduced motion gets the same scene, standing still.
 *
 * World units: the visible ground is 100 tall on wide screens and 100 wide on phones.
 */

// ---------------------------------------------------------------- the loop's path

type Seg =
  | { kind: "line"; len: number; x: number; z: number; dx: number; dz: number }
  | { kind: "arc"; len: number; cx: number; cz: number; a0: number; r: number };
type At = { x: number; z: number; tx: number; tz: number };

/**
 * A rounded rectangle walked by arc length, top straight first (moving left), so on screen the
 * belt runs down the left side, right along the bottom and back up the right: the reference's way.
 */
function makeLoop(L: number, R: number, T: number, B: number, r: number) {
  const hx = R - L - 2 * r, vz = B - T - 2 * r, arc = (Math.PI * r) / 2;
  const segs: Seg[] = [
    { kind: "line", len: hx, x: R - r, z: T, dx: -1, dz: 0 },
    { kind: "arc", len: arc, cx: L + r, cz: T + r, a0: -Math.PI / 2, r },
    { kind: "line", len: vz, x: L, z: T + r, dx: 0, dz: 1 },
    { kind: "arc", len: arc, cx: L + r, cz: B - r, a0: Math.PI, r },
    { kind: "line", len: hx, x: L + r, z: B, dx: 1, dz: 0 },
    { kind: "arc", len: arc, cx: R - r, cz: B - r, a0: Math.PI / 2, r },
    { kind: "line", len: vz, x: R, z: B - r, dx: 0, dz: -1 },
    { kind: "arc", len: arc, cx: R - r, cz: T + r, a0: 0, r },
  ];
  const len = segs.reduce((a, s) => a + s.len, 0);
  const at = (s: number, out: At = { x: 0, z: 0, tx: 0, tz: 0 }): At => {
    s = ((s % len) + len) % len;
    for (const g of segs) {
      if (s > g.len) { s -= g.len; continue; }
      if (g.kind === "line") { out.x = g.x + g.dx * s; out.z = g.z + g.dz * s; out.tx = g.dx; out.tz = g.dz; }
      else { const a = g.a0 - s / g.r; out.x = g.cx + g.r * Math.cos(a); out.z = g.cz + g.r * Math.sin(a); out.tx = Math.sin(a); out.tz = -Math.cos(a); }
      return out;
    }
    return out;
  };
  // Where the left and right straights are halfway: the roaster, and the hidden swap.
  const leftMid = hx + arc + vz / 2;
  const rightMid = 2 * hx + 3 * arc + vz + vz / 2;
  return { L, R, T, B, r, len, at, leftMid, rightMid };
}
type Loop = ReturnType<typeof makeLoop>;

/** A rounded rectangle as a flat shape (y in the shape is -z in the world). */
function roundedRect(L: number, R: number, T: number, B: number, r: number, path: THREE.Path) {
  path.moveTo(L + r, -T);
  path.lineTo(R - r, -T); path.absarc(R - r, -T - r, r, Math.PI / 2, 0, true);
  path.lineTo(R, -B + r); path.absarc(R - r, -B + r, r, 0, -Math.PI / 2, true);
  path.lineTo(L + r, -B); path.absarc(L + r, -B + r, r, -Math.PI / 2, -Math.PI, true);
  path.lineTo(L, -T - r); path.absarc(L + r, -T - r, r, Math.PI, Math.PI / 2, true);
  return path;
}

// ---------------------------------------------------------------- sizes

const BW = 15;            // belt width
const HOUSE = 3.2;        // the steel housing either side of the belt
const BED = 3;            // housing height
const SLAT_Y = BED + 0.3; // top of the slats, where plates sit
const SLAT = 2.5;         // slat pitch
const PLATE_R = 6.4;
const PITCH = 19;         // plate spacing, roughly
const PW = 7.8, PH = PW * (1414 / 960);
const LIE_H = 5;          // how high a bag lying on its plate stands, puff and all
const SPEED = 3.5;        // units per second: always slow, never sped up
const STAND = Math.PI / 2 - 0.22; // how far a standing ingredient is tipped up
const MW = BW + 2 * HOUSE + 5, ML = 18, MH = 17; // the roaster: tall enough to hide a standing bag

const mod = (a: number, n: number) => ((a % n) + n) % n;
/** Moving forward from a to b, did we pass c? */
const crossed = (a: number, b: number, c: number, n: number) => { const ab = mod(b - a, n), ac = mod(c - a, n); return ac > 0 && ac <= ab; };

// ---------------------------------------------------------------- what's on the plates

type Piece =
  | { k: "makhana"; x: number; y: number; z: number; s: number; v: 0 | 1 | 2 }
  | { k: "pepper" | "mustard" | "cumin"; n: number; x: number; z: number; spread: number }
  | { k: "anise" | "tamarind" | "jaggery" | "cheese" | "butter" | "sugar" | "cocoa" | "macaroni" | "bean" | "tomato" | "chilliDry" | "chilliFresh" | "sprig"; x: number; z: number; rot: number; s?: number; /** Stand it up on its edge, facing the camera, like the bags. */ up?: boolean };

const ING = "/brand/ingredients/";
/** Raw makhana piled up at the front of every plate: four, then two, then one on top. */
const pile = (cx: number, cz: number): Piece[] =>
  ([[-1.35, 0.25, 0.5], [1.35, 0.25, 0.5], [0, 0.25, -0.9], [0, 0.25, 1.8], [-0.7, 1.3, 0.3], [0.7, 1.3, 0.3], [0, 2.3, 0.2]] as const)
    .map(([x, y, z], i) => ({ k: "makhana", x: cx + x, y, z: cz + z, s: 1.3 - y * 0.06, v: (i % 3) as 0 | 1 | 2 }));

/**
 * Each flavour's plate, from the notes on its pack (lib/products). Illustrative, not a recipe.
 * The big pieces stand at the back facing the camera, like the bags; the makhana pile sits in front.
 */
const PLATES: Record<string, Piece[]> = {
  rasam: [
    { k: "tomato", x: 1.8, z: -1.6, rot: 0, up: true },
    { k: "chilliDry", x: -1.4, z: -2.2, rot: 1.15, s: 0.9, up: true },
    { k: "pepper", n: 7, x: 2.4, z: 2.2, spread: 1.1 },
    ...pile(-1.3, 1.2),
  ],
  "sweet-tamarind": [
    { k: "tamarind", x: 0.6, z: -1.8, rot: 0.55, s: 0.85, up: true },
    { k: "jaggery", x: 2.7, z: 1.4, rot: 0.5 },
    { k: "cumin", n: 9, x: 1.4, z: 3.2, spread: 1 },
    ...pile(-1.4, 1.2),
  ],
  "mac-cheese": [
    { k: "cheese", x: 1.5, z: -1.8, rot: 0, up: true },
    { k: "macaroni", x: -1.9, z: -2.2, rot: 0.3, s: 0.85, up: true },
    { k: "butter", x: 2.8, z: 1.8, rot: 0.4 },
    ...pile(-1.3, 1.3),
  ],
  tiramisu: [
    { k: "bean", x: -0.2, z: -2.3, rot: 0.5, s: 1.2, up: true },
    { k: "bean", x: 1.9, z: -2.1, rot: -0.4, s: 1.2, up: true },
    { k: "bean", x: 3.2, z: -0.6, rot: 1.1, up: true },
    { k: "cocoa", x: 2.5, z: 1.9, rot: 0, s: 0.75 },
    ...pile(-1.4, 1.3),
  ],
  "curry-leaves": [
    { k: "sprig", x: 1.4, z: -1.9, rot: 0.12, up: true },
    { k: "chilliDry", x: -1.4, z: -2.4, rot: 1.0, s: 0.7, up: true },
    { k: "mustard", n: 12, x: 2.4, z: 2.2, spread: 1.2 },
    ...pile(-1.3, 1.2),
  ],
  chettinadu: [
    { k: "anise", x: 1.6, z: -2.1, rot: 0.2, up: true },
    { k: "chilliDry", x: -1.4, z: -2.4, rot: 1.35, up: true },
    { k: "anise", x: 3.2, z: -0.4, rot: 0.9, s: 0.75, up: true },
    { k: "pepper", n: 6, x: 2.2, z: 2.4, spread: 1 },
    ...pile(-1.3, 1.2),
  ],
  "thai-chilli": [
    { k: "chilliFresh", x: 0.4, z: -2.2, rot: 1.25, up: true },
    { k: "chilliFresh", x: 2.4, z: -1.6, rot: 1.75, s: 0.85, up: true },
    { k: "sugar", x: 2.4, z: 2, rot: 0.3 },
    ...pile(-1.4, 1.2),
  ],
};

// ---------------------------------------------------------------- the scene

type Item = {
  s0: number; s: number; flavour: number; pack: boolean;
  group: THREE.Group; content: THREE.Group; rim: THREE.Mesh; hit: THREE.Mesh; lift: number;
};

function build(host: HTMLElement) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  Object.assign(renderer.domElement.style, { display: "block", width: "100%", height: "100%", touchAction: "pan-y" });
  renderer.domElement.setAttribute("aria-hidden", "true");
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = envRT.texture;
  scene.environmentIntensity = 0.55;
  pmrem.dispose();

  const camera = new THREE.PerspectiveCamera(28, 1, 20, 2000);

  scene.add(new THREE.HemisphereLight(0xffffff, 0xf4d8cc, 1.1));
  const sun = new THREE.DirectionalLight(0xffffff, 2.4);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.02;
  scene.add(sun, sun.target);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.ShadowMaterial({ opacity: 0.28 }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // ---- shared resources: everything below is made once and reused by every plate ----
  const bin: { dispose: () => void }[] = [];
  const keep = <T extends { dispose: () => void }>(x: T) => { bin.push(x); return x; };
  const std = (o: THREE.MeshStandardMaterialParameters) => keep(new THREE.MeshStandardMaterial(o));

  const loader = new THREE.TextureLoader();
  const texCache = new Map<string, THREE.Texture>();
  const tex = (src: string) => {
    let t = texCache.get(src);
    if (!t) { t = keep(loader.load(src)); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; texCache.set(src, t); }
    return t;
  };

  const steel = std({ color: "#c9ccd0", metalness: 0.9, roughness: 0.32 });
  const steelDark = std({ color: "#8d9298", metalness: 0.85, roughness: 0.45 });
  const slatMat = std({ color: "#b9bdc2", metalness: 0.88, roughness: 0.38 });
  const ceramic = std({ color: "#ffffff", roughness: 0.22, metalness: 0 });
  const white = std({ color: "#fbfaf7", roughness: 0.45, emissive: "#ffffff", emissiveIntensity: 0.06 });
  const paprika = std({ color: "#ea4b2b", roughness: 0.5 });
  const ink = std({ color: "#141414", roughness: 0.7 });
  const lampMat = std({ color: "#ffb347", emissive: "#ff9a1f", emissiveIntensity: 0.8, roughness: 0.3 });
  const rimMats = FLAVOURS.map((f) => std({ color: f.field, roughness: 0.35 }));
  const flat = (w: number, h: number) => keep(new THREE.PlaneGeometry(w, h).rotateX(-Math.PI / 2));
  const upright = (w: number, h: number) => keep(new THREE.PlaneGeometry(w, h));

  // The plate: a lathe-turned dish with a raised rim, and a coloured ring on the rim for its flavour.
  const plateGeo = keep(new THREE.LatheGeometry([
    [0, 0], [4.4, 0], [4.9, 0.12], [5.7, 0.62], [6.3, 1.0], [PLATE_R, 0.96], [6.35, 0.86], [5.65, 0.5], [4.7, 0.3], [0, 0.3],
  ].map(([x, y]) => new THREE.Vector2(x, y)), 64));
  const rimGeo = keep(new THREE.TorusGeometry(5.95, 0.16, 8, 72).rotateX(Math.PI / 2));
  const hitGeo = keep(new THREE.CylinderGeometry(PLATE_R + 0.6, PLATE_R + 0.6, 8, 16).translate(0, 4, 0));
  const hitMat = keep(new THREE.MeshBasicMaterial({ visible: false }));

  // Makhana: a lumpy dome wearing a top-down photo of our own makhana, so it's ours, in 3D.
  const makhanaGeos = [0, 1].map((seed) => {
    const g = new THREE.SphereGeometry(1, 30, 18, 0, Math.PI * 2, 0, Math.PI * 0.62);
    const p = g.attributes.position, uv = g.attributes.uv;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      const b = 1 + 0.07 * Math.sin(7 * x + seed * 3) * Math.sin(6 * z + seed) + 0.05 * Math.sin(11 * y + 5 * x + seed * 2);
      p.setXYZ(i, x * b, (y + 0.37) * b * 0.8, z * b);
      // Kept inside the seed in the photo, so its transparent edge never wraps onto the ball.
      uv.setXY(i, 0.5 + x * b * 0.29, 0.5 - z * b * 0.32);
    }
    g.computeVertexNormals();
    return keep(g);
  });
  const makhanaMats = [1, 2, 3].map((n) => std({ map: tex(`${ING}makhana-${n}.webp`), roughness: 0.8 }));

  const pepperGeo = keep(new THREE.IcosahedronGeometry(0.4, 1));
  const pepperMat = std({ color: "#2a1a12", roughness: 0.75 });
  const mustardGeo = keep(new THREE.SphereGeometry(0.2, 10, 8));
  const mustardMat = std({ color: "#3b2414", roughness: 0.5 });
  const cuminGeo = keep(new THREE.SphereGeometry(0.22, 8, 6).scale(1, 0.6, 2.4));
  const cuminMat = std({ color: "#8a6a3e", roughness: 0.9 });
  const beanGeo = keep(new THREE.SphereGeometry(0.8, 18, 12).scale(1, 0.55, 0.72));
  const beanMat = std({ color: "#3e2214", roughness: 0.3 });
  const grooveGeo = keep(new THREE.BoxGeometry(1.3, 0.1, 0.09));
  const anise = new THREE.Shape();
  for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2, r = i % 2 ? 0.5 : 1.7; anise[i ? "lineTo" : "moveTo"](Math.cos(a) * r, Math.sin(a) * r); }
  const aniseGeo = keep(new THREE.ExtrudeGeometry(anise, { depth: 0.3, bevelEnabled: true, bevelSize: 0.18, bevelThickness: 0.2, bevelSegments: 2 }).rotateX(-Math.PI / 2));
  const aniseMat = std({ color: "#6b3820", roughness: 0.8 });
  const podGeo = keep(new THREE.SphereGeometry(1, 18, 12).scale(1.1, 0.7, 0.95));
  const podMat = std({ color: "#9b6436", roughness: 0.75 });
  const pulpMat = std({ color: "#4a1c0b", roughness: 0.45 });
  const cubeGeo = keep(new RoundedBoxGeometry(2.3, 1.5, 2.3, 2, 0.3));
  const jaggeryMat = std({ color: "#b06d33", roughness: 0.95 });
  const butterMat = std({ color: "#f8e6a0", roughness: 0.4 });
  const sugarMat = std({ color: "#ffffff", roughness: 0.9, emissive: "#ffffff", emissiveIntensity: 0.1 });
  const wedge = new THREE.Shape([new THREE.Vector2(-2.4, -1.6), new THREE.Vector2(2.6, -1.6), new THREE.Vector2(-2.4, 2)]);
  const cheeseGeo = keep(new THREE.ExtrudeGeometry(wedge, { depth: 1.8, bevelEnabled: true, bevelSize: 0.15, bevelThickness: 0.15, bevelSegments: 2 }).rotateX(-Math.PI / 2));
  const cheeseMat = std({ color: "#f5c63f", roughness: 0.55 });
  const holeGeo = keep(new THREE.CircleGeometry(1, 20).rotateX(-Math.PI / 2));
  const holeMat = std({ color: "#d99c1a", roughness: 0.7 });
  const macGeo = keep(new THREE.TorusGeometry(0.75, 0.32, 10, 16, Math.PI * 0.95).rotateX(-Math.PI / 2));
  const macMat = std({ color: "#f2cf6a", roughness: 0.5 });
  const cocoaGeo = keep(new THREE.ConeGeometry(2.1, 1.1, 32, 1));
  const cocoaMat = std({ color: "#5a3428", roughness: 1 });

  // A tube that tapers along its length: chillies and stems.
  const taperTube = (pts: [number, number, number][], radius: number, shape: (t: number) => number, wrinkle = 0) => {
    const curve = new THREE.CatmullRomCurve3(pts.map(([x, y, z]) => new THREE.Vector3(x, y, z)));
    const TS = 36, RS = 14;
    const g = new THREE.TubeGeometry(curve, TS, radius, RS, false);
    const p = g.attributes.position, c = new THREE.Vector3(), v = new THREE.Vector3();
    for (let i = 0; i <= TS; i++) {
      curve.getPointAt(i / TS, c);
      for (let j = 0; j <= RS; j++) {
        const k = i * (RS + 1) + j;
        const sc = shape(i / TS) * (1 + wrinkle * Math.sin(j * 2.3 + i * 1.1));
        v.fromBufferAttribute(p, k).sub(c).multiplyScalar(sc).add(c);
        p.setXYZ(k, v.x, v.y, v.z);
      }
    }
    g.computeVertexNormals();
    return keep(g);
  };
  const pod = (t: number) => (t < 0.12 ? 0.7 + (t / 0.12) * 0.3 : 1 - Math.pow((t - 0.12) / 0.88, 1.8) * 0.94);
  const chilliDryGeo = taperTube([[-2.6, 0.75, 0], [-0.8, 0.85, 0.4], [1, 0.75, 0.2], [2.6, 0.45, -0.5]], 0.78, pod, 0.07);
  const chilliDryMat = std({ color: "#7c130b", roughness: 0.5 });
  const chilliFreshGeo = taperTube([[-3, 0.5, 0], [-1, 0.55, 0.5], [1.2, 0.5, 0.3], [3, 0.4, -0.6]], 0.5, pod);
  const chilliFreshMat = std({ color: "#d8180c", roughness: 0.18 });
  const stemGeo = taperTube([[0, 0, 0], [-0.6, 0.15, 0.1], [-1.2, 0.45, 0.4]], 0.17, () => 1);
  const calyxGeo = keep(new THREE.SphereGeometry(0.62, 14, 10).scale(0.6, 1, 1));
  const greenStem = std({ color: "#3f7a24", roughness: 0.5 });
  const brownStem = std({ color: "#6d4b26", roughness: 0.8 });
  // The tomato: a wedge cut from a sphere, red skin on the outside, the flesh on the cut faces.
  const TW = 1.0, TR = 2.2;
  const tomatoSkin = keep(new THREE.SphereGeometry(TR, 24, 16, Math.PI / 2 - TW / 2, TW, 0, Math.PI));
  const tomatoCut = keep(new THREE.CircleGeometry(TR, 24, -Math.PI / 2, Math.PI));
  const tomatoCore = keep(new THREE.CircleGeometry(TR * 0.62, 20, -Math.PI / 2, Math.PI));
  const skinMat = std({ color: "#dc2a17", roughness: 0.22 });
  const fleshMat = std({ color: "#f04a2e", roughness: 0.4, side: THREE.DoubleSide });
  const coreMat = std({ color: "#ff8a5c", roughness: 0.35, side: THREE.DoubleSide });
  // A curry leaf: a lens, folded on its midrib and arched, glossy.
  const leafGeo = (() => {
    const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.quadraticCurveTo(0.95, 1.3, 0, 3.1); sh.quadraticCurveTo(-0.95, 1.3, 0, 0);
    const g = new THREE.ShapeGeometry(sh, 14);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i); p.setZ(i, 0.42 * Math.abs(x) + 0.35 - 0.07 * (y - 1.4) ** 2); }
    g.rotateX(-Math.PI / 2); g.computeVertexNormals();
    return keep(g);
  })();
  const leafMat = std({ color: "#2e7d2c", roughness: 0.3, side: THREE.DoubleSide });
  const sprigStem = taperTube([[0, 0.3, 2.6], [0.2, 0.45, 0], [0, 0.5, -2.8]], 0.12, (t) => 1 - t * 0.5);

  const mesh = (g: THREE.BufferGeometry, m: THREE.Material, x = 0, y = 0, z = 0) => {
    const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; return o;
  };
  // A seeded scatter, so each plate of a flavour looks the same every lap.
  const rand = (seed: number) => () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };

  const piece = (p: Piece, rnd: () => number): THREE.Object3D => {
    const g = new THREE.Group();
    switch (p.k) {
      case "tomato": {
        // Built standing (axis up, skin facing +z), then laid on its side, skin up.
        const w = new THREE.Group();
        w.add(mesh(tomatoSkin, skinMat));
        for (const phi of [Math.PI / 2 - TW / 2, Math.PI / 2 + TW / 2]) {
          const face = new THREE.Group(); face.rotation.y = Math.PI + phi;
          face.add(mesh(tomatoCut, fleshMat), mesh(tomatoCore, coreMat, 0.01 * (phi > Math.PI / 2 ? -1 : 1), 0, 0));
          w.add(face);
        }
        w.rotation.x = -Math.PI / 2; w.position.y = 0.5;
        g.add(w); break;
      }
      case "chilliDry": case "chilliFresh": {
        const dry = p.k === "chilliDry";
        g.add(mesh(dry ? chilliDryGeo : chilliFreshGeo, dry ? chilliDryMat : chilliFreshMat));
        const stem = dry ? brownStem : greenStem, x0 = dry ? -2.6 : -3, y0 = dry ? 0.75 : 0.5;
        const cx = mesh(calyxGeo, stem, x0 - 0.1, y0, 0); if (!dry) cx.scale.setScalar(0.75); g.add(cx);
        g.add(mesh(stemGeo, stem, x0 - 0.3, y0, 0));
        break;
      }
      case "sprig": {
        g.add(mesh(sprigStem, greenStem));
        // Leaves in pairs along the stem, smaller toward the tip, one more at the tip.
        [[1.9, 1], [0.4, 0.92], [-1.1, 0.8]].forEach(([z, sc]) => {
          for (const side of [-1, 1]) {
            const l = mesh(leafGeo, leafMat, 0.15 * side, 0.4, z);
            l.rotation.y = side * 1.15 + 0.15; l.scale.setScalar(sc); g.add(l);
          }
        });
        const tip = mesh(leafGeo, leafMat, 0, 0.5, -2.6); tip.scale.setScalar(0.75); g.add(tip);
        break;
      }
      case "makhana": {
        const o = mesh(makhanaGeos[p.v % 2], makhanaMats[p.v], p.x, p.y, p.z);
        o.scale.setScalar(p.s); o.rotation.y = rnd() * Math.PI * 2; return o;
      }
      case "pepper": case "mustard": case "cumin": {
        const [geo, mat] = p.k === "pepper" ? [pepperGeo, pepperMat] : p.k === "mustard" ? [mustardGeo, mustardMat] : [cuminGeo, cuminMat];
        for (let i = 0; i < p.n; i++) {
          const a = rnd() * Math.PI * 2, r = Math.sqrt(rnd()) * p.spread;
          const o = mesh(geo, mat, p.x + Math.cos(a) * r, 0.55, p.z + Math.sin(a) * r);
          o.rotation.set(rnd() * 3, rnd() * 3, rnd() * 3); g.add(o);
        }
        return g;
      }
      case "bean": g.add(mesh(beanGeo, beanMat, 0, 0.6, 0), mesh(grooveGeo, ink, 0, 1.03, 0)); break;
      case "anise": g.add(mesh(aniseGeo, aniseMat, 0, 0.35, 0)); break;
      case "tamarind":
        [-2.4, -0.8, 0.8].forEach((x, i) => { const o = mesh(podGeo, podMat, x, 0.9, (i % 2) * 0.35); o.rotation.y = i * 0.25; g.add(o); });
      {
        // The broken end, showing the sticky pulp.
        const pulp = mesh(podGeo, pulpMat, 2.1, 0.8, 0.25); pulp.scale.set(0.75, 0.85, 0.85); g.add(pulp);
        break;
      }
      case "jaggery": g.add(mesh(cubeGeo, jaggeryMat, 0, 1.05, 0)); break;
      case "butter": { const o = mesh(cubeGeo, butterMat, 0, 0.9, 0); o.scale.set(0.9, 0.75, 0.7); g.add(o); break; }
      case "sugar": { const o = mesh(cubeGeo, sugarMat, 0, 0.8, 0); o.scale.setScalar(0.6); g.add(o); const o2 = mesh(cubeGeo, sugarMat, 1.6, 0.8, -0.6); o2.scale.setScalar(0.55); o2.rotation.y = 0.6; g.add(o2); break; }
      case "cheese": {
        g.add(mesh(cheeseGeo, cheeseMat, 0, 0.45, 0));
        [[-1.2, -0.5, 0.45], [0.4, 0.4, 0.3], [-1.6, 1, 0.25]].forEach(([x, z, r]) => { const o = mesh(holeGeo, holeMat, x, 2.47, z); o.scale.setScalar(r); g.add(o); });
        break;
      }
      case "macaroni":
        [[0, 0, 0], [1.9, 0.5, 2.1], [0.8, -1.4, 4.2]].forEach(([x, z, r]) => { const o = mesh(macGeo, macMat, x, 0.65, z); o.rotation.y = r; g.add(o); });
        break;
      case "cocoa": g.add(mesh(cocoaGeo, cocoaMat, 0, 0.85, 0)); break;
    }
    if (p.s) g.scale.setScalar(p.s);
    if (!p.up) { g.position.set(p.x, 0, p.z); g.rotation.y = p.rot; return g; }
    // Stood up: turned in its own plane, then tipped up to face the camera, leaning back a touch,
    // and set down so its lowest point rests on the plate.
    g.rotation.set(STAND, p.rot, 0);
    const box = new THREE.Box3().setFromObject(g);
    g.position.set(p.x, 0.35 - box.min.y, p.z);
    return g;
  };

  // ---- The bag: a real puffed pouch. Its outline is traced from the pack art, row by row, so the
  // front and back meet exactly on the bag's edge; flat at the crimped seals, swelling into the body.
  const NU = 28, NV = 64, SEAL_T = 0.055, SEAL_B = 0.045, PUFF = 2;
  type Edges = (v: number) => [number, number];
  const pouch = (edges: Edges) => {
    const pos: number[] = [], uvs: number[] = [], idx: number[] = [];
    const ramp = (a: number) => { const t = Math.min(1, Math.max(0, a / 0.13)); return t * t * (3 - 2 * t); };
    for (let j = 0; j <= NV; j++) {
      const v = j / NV, [l, r] = edges(v), body = ramp(v - SEAL_B) * ramp(1 - SEAL_T - v);
      for (let i = 0; i <= NU; i++) {
        const t = i / NU, u = l + (r - l) * t;
        const across = Math.pow(Math.max(0, 1 - Math.pow(Math.abs(2 * t - 1), 2.4)), 0.55);
        pos.push((u - 0.5) * PW, v * PH, 0.015 + PUFF * across * body);
        uvs.push(u, v);
      }
    }
    for (let j = 0; j < NV; j++) for (let i = 0; i < NU; i++) {
      const a = j * (NU + 1) + i, b = a + 1, c = a + NU + 1, d = c + 1;
      idx.push(a, b, d, a, d, c);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    return keep(g);
  };
  const fallbackPouch = pouch(() => [0.05, 0.95]);
  const pouches: THREE.BufferGeometry[] = FLAVOURS.map(() => fallbackPouch);
  /** The left and right edge of the art's opaque area on each row, lightly smoothed. */
  const trace = (img: HTMLImageElement): Edges => {
    const W = 160, H = 236, c = document.createElement("canvas"); c.width = W; c.height = H;
    const ctx = c.getContext("2d", { willReadFrequently: true })!; ctx.drawImage(img, 0, 0, W, H);
    const a = ctx.getImageData(0, 0, W, H).data;
    let rows: [number, number][] = [];
    for (let y = 0; y < H; y++) {
      let x0 = -1, x1 = -1;
      for (let x = 0; x < W; x++) if (a[(y * W + x) * 4 + 3] > 128) { if (x0 < 0) x0 = x; x1 = x; }
      rows.push(x0 < 0 ? [0.08, 0.92] : [(x0 + 1) / W, x1 / W]);
    }
    for (let pass = 0; pass < 2; pass++) rows = rows.map((_, y) => {
      const n = [rows[Math.max(0, y - 1)], rows[y], rows[Math.min(H - 1, y + 1)]];
      return [(n[0][0] + n[1][0] + n[2][0]) / 3, (n[0][1] + n[1][1] + n[2][1]) / 3];
    });
    return (v) => rows[Math.min(H - 1, Math.max(0, Math.round((1 - v) * (H - 1))))];
  };
  // The back of a bag: its outline, filled with the flavour's colour. The same load traces the pouch.
  const packMats = FLAVOURS.map((f, k) => {
    const map = tex(f.pack);
    const canvas = document.createElement("canvas"); canvas.width = 240; canvas.height = 354;
    const backTex = keep(new THREE.CanvasTexture(canvas)); backTex.colorSpace = THREE.SRGBColorSpace;
    const img = new Image();
    img.onload = () => {
      const c = canvas.getContext("2d")!;
      c.drawImage(img, 0, 0, canvas.width, canvas.height);
      c.globalCompositeOperation = "source-in"; c.fillStyle = f.field; c.fillRect(0, 0, canvas.width, canvas.height);
      backTex.needsUpdate = true;
      pouches[k] = pouch(trace(img));
      scene.traverse((o) => { if (o.userData.pouch === k) (o as THREE.Mesh).geometry = pouches[k]; });
    };
    img.src = f.pack;
    return [std({ map, roughness: 0.5, envMapIntensity: 0.4 }),
      keep(new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking })),
      std({ map: backTex, roughness: 0.55, envMapIntensity: 0.4 })] as const;
  });
  // Each flavour turns its bag a little, so the pouch's puff and edge show.
  const YAW = [-0.3, 0.24, -0.14, 0.3, -0.24, 0.12, 0.28];

  const fill = (content: THREE.Group, flavour: number, pack: boolean) => {
    content.clear();
    content.scale.setScalar(pack ? 1 : 0.96);
    if (pack) {
      // Lying on its back on the plate, art up, its top end towards the far side and propped a
      // touch so the face catches the camera. The puffed pouch keeps its depth: the back half
      // swells down onto the plate, the front up.
      const [m, d, back] = packMats[flavour];
      const bag = new THREE.Group(), lean = 0.1, yaw = YAW[flavour % YAW.length] * 0.6;
      bag.rotation.set(-Math.PI / 2 + lean, yaw, 0, "YXZ");
      bag.position.set((PH / 2) * Math.sin(yaw), 2, (PH / 2) * Math.cos(yaw));
      const front = mesh(pouches[flavour], m); front.customDepthMaterial = d; front.userData.pouch = flavour;
      const rear = mesh(pouches[flavour], back); rear.scale.z = -1; rear.customDepthMaterial = d; rear.userData.pouch = flavour;
      bag.add(front, rear);
      content.add(bag);
    } else {
      const rnd = rand(flavour * 97 + 13);
      PLATES[FLAVOURS[flavour].id].forEach((p) => content.add(piece(p, rnd)));
    }
  };

  // ---- the roaster: a white housing over the belt, the wordmark on top, a Paprika band, a lamp ----
  const machine = new THREE.Group();
  const body = mesh(keep(new RoundedBoxGeometry(MW, MH, ML, 5, 2.2)), white, 0, MH / 2, 0);
  const band = mesh(keep(new RoundedBoxGeometry(MW + 0.3, 1.8, ML + 0.3, 3, 0.6)), paprika, 0, 2.2, 0);
  const logoTex = tex("/brand/logo-paprika.png");
  const logo = new THREE.Mesh(flat(MW - 8, (MW - 8) * (296 / 1200)), keep(new THREE.MeshStandardMaterial({ map: logoTex, transparent: true, roughness: 0.5 })));
  logo.position.set(0, MH + 0.03, -1.2);
  const lamp = mesh(keep(new THREE.SphereGeometry(0.9, 24, 16)), lampMat, MW / 2 - 3.6, MH, ML / 2 - 3.4);
  const vent = mesh(keep(new THREE.CylinderGeometry(1.4, 1.4, 0.2, 28)), ink, -MW / 2 + 4.2, MH + 0.02, ML / 2 - 3.4);
  // The wordmark again on the side that faces into the loop, toward the camera.
  const sideLogo = new THREE.Mesh(upright(ML - 4, (ML - 4) * (296 / 1200)), logo.material);
  sideLogo.position.set(MW / 2 + 0.03, MH * 0.58, 0); sideLogo.rotation.y = Math.PI / 2;
  machine.add(body, band, logo, sideLogo, lamp, vent);
  // The mouths, dark slots at each end, under a Paprika visor.
  for (const sz of [-1, 1]) {
    const mouth = new THREE.Mesh(keep(new THREE.PlaneGeometry(BW + 0.6, 13)), ink);
    mouth.position.set(0, BED + 6.5, sz * (ML / 2 + 0.02)); mouth.rotation.y = sz < 0 ? Math.PI : 0;
    const visor = mesh(keep(new RoundedBoxGeometry(BW + 4, 0.9, 2.4, 2, 0.35)), steelDark, 0, BED + 13.4, sz * (ML / 2 + 0.8));
    machine.add(mouth, visor);
  }
  scene.add(machine);

  // Makhana popping out of the vent as each plate goes through.
  const pops = Array.from({ length: 8 }, (_, i) => {
    const o = mesh(makhanaGeos[i % 2], makhanaMats[i % 3]); o.visible = false; o.scale.setScalar(1.1); scene.add(o);
    return { o, vx: 0, vy: 0, vz: 0, live: false };
  });

  // ---- the belt: housing, rails and slats, rebuilt whenever the frame changes shape ----
  const belt = new THREE.Group();
  scene.add(belt);
  const slatGeo = keep(new THREE.BoxGeometry(BW - 0.8, 0.5, SLAT - 0.3));
  const slats = new THREE.InstancedMesh(slatGeo, slatMat, 800);
  slats.castShadow = false; slats.receiveShadow = true;
  scene.add(slats);
  let beltBin: THREE.BufferGeometry[] = [];

  const layout = (loop: Loop) => {
    beltBin.forEach((g) => g.dispose()); beltBin = []; belt.clear();
    const { L, R, T, B, r } = loop, o = BW / 2 + HOUSE, i = BW / 2;
    // The housing: a rounded-rectangle ring, extruded and bevelled so its edges catch the light.
    const ring = roundedRect(L - o, R + o, T - o, B + o, r + o, new THREE.Shape()) as THREE.Shape;
    ring.holes.push(roundedRect(L + o, R - o, T + o, B - o, r - o, new THREE.Path()));
    const house = new THREE.ExtrudeGeometry(ring, { depth: BED - 0.4, bevelEnabled: true, bevelSize: 0.4, bevelThickness: 0.4, bevelSegments: 3, curveSegments: 24 }).rotateX(-Math.PI / 2);
    const trough = new THREE.ExtrudeGeometry(Object.assign(roundedRect(L - i, R + i, T - i, B + i, r + i, new THREE.Shape()) as THREE.Shape, {
      holes: [roundedRect(L + i, R - i, T + i, B - i, r - i, new THREE.Path())],
    }), { depth: 0.2, bevelEnabled: false, curveSegments: 24 }).rotateX(-Math.PI / 2).translate(0, BED - 0.5, 0);
    beltBin.push(house, trough);
    const h = mesh(house, steelDark); belt.add(h, mesh(trough, ink));
    // Rails along the top of both edges.
    for (const off of [i + 0.7, -(i + 0.7)]) {
      const pts: THREE.Vector3[] = [], a: At = { x: 0, z: 0, tx: 0, tz: 0 };
      for (let k = 0; k < 480; k++) { loop.at((k / 480) * loop.len, a); pts.push(new THREE.Vector3(a.x - a.tz * off, BED + 0.55, a.z + a.tx * off)); }
      const tube = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true, "centripetal"), 720, 0.6, 10, true);
      beltBin.push(tube); belt.add(mesh(tube, steel));
    }
    slats.count = Math.min(800, Math.floor(loop.len / SLAT));
  };

  const placeSlats = (loop: Loop, travel: number) => {
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0), p = new THREE.Vector3(), one = new THREE.Vector3(1, 1, 1);
    const pitch = loop.len / slats.count, a: At = { x: 0, z: 0, tx: 0, tz: 0 };
    for (let k = 0; k < slats.count; k++) {
      loop.at(k * pitch + travel, a);
      q.setFromAxisAngle(up, Math.atan2(a.tx, a.tz));
      m.compose(p.set(a.x, SLAT_Y - 0.25, a.z), q, one);
      slats.setMatrixAt(k, m);
    }
    slats.instanceMatrix.needsUpdate = true;
  };

  const newItem = (s0: number, flavour: number, pack: boolean): Item => {
    const group = new THREE.Group();
    const plate = mesh(plateGeo, ceramic);
    const rim = mesh(rimGeo, rimMats[flavour], 0, 0.98, 0);
    const content = new THREE.Group();
    const hit = new THREE.Mesh(hitGeo, hitMat);
    group.add(plate, rim, content, hit);
    fill(content, flavour, pack);
    scene.add(group);
    return { s0, s: s0, flavour, pack, group, content, rim, hit, lift: 0 };
  };
  const restyle = (it: Item) => { it.rim.material = rimMats[it.flavour]; fill(it.content, it.flavour, it.pack); };
  const dropItem = (it: Item) => { it.content.clear(); scene.remove(it.group); };

  return {
    renderer, scene, camera, sun, ground, machine, lamp, lampMat, body, pops, slats,
    layout, placeSlats, newItem, restyle, dropItem,
    dispose: () => {
      beltBin.forEach((g) => g.dispose()); bin.forEach((d) => d.dispose()); slats.dispose();
      envRT.dispose(); renderer.dispose(); renderer.domElement.remove();
    },
  };
}

// ---------------------------------------------------------------- the component

export function Conveyor() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const routerRef = useRef(router);
  useEffect(() => { routerRef.current = router; });
  const [hover, setHover] = useState<{ flavour: number; pack: boolean } | null>(null);

  useEffect(() => {
    const el = stage.current!, section = root.current!;
    const b = build(el);
    const motion = window.matchMedia(MOTION_OK);
    const wideQ = window.matchMedia("(min-width: 900px)");

    let loop: Loop | null = null;
    let items: Item[] = [];
    let travel = 0, speed = motion.matches ? SPEED : 0, pulse = 0, clock = 0;

    // ---- frame the loop to the stage: on wide screens the copy sits in the loop's hollow ----
    const frame = () => {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const aspect = r.width / r.height, wide = wideQ.matches;
      b.renderer.setSize(r.width, r.height, false);
      b.camera.aspect = aspect;
      b.camera.updateProjectionMatrix();

      // A three-quarter view: the loop is a fixed depth, the camera tilted down onto it and
      // moved until the loop's left end and its near and far edges sit inside the frame.
      const edge = BW / 2 + HOUSE, rad = 16;
      const D = wide ? 82 : 96, T = -D / 2, B = D / 2, L = 0;
      const tilt = THREE.MathUtils.degToRad(wide ? 50 : 44);
      const halfV = Math.tan(THREE.MathUtils.degToRad(b.camera.fov / 2));
      const v = new THREE.Vector3();
      const ndc = (x: number, y: number, z: number) => v.set(x, y, z).project(b.camera);
      let tx = L + 60, tz = 0, dist = 180;
      const place = () => {
        b.camera.position.set(tx, dist * Math.cos(tilt), tz + dist * Math.sin(tilt));
        b.camera.lookAt(tx, 0, tz);
        b.camera.updateMatrixWorld();
      };
      const [mTop, mBot, mLeft] = wide ? [0.16, 0.04, 0.05] : [0.06, 0.05, 0.04];
      for (let k = 0; k < 60; k++) {
        place();
        // The far edge (with a bag standing on it) and the near edge.
        const top = Math.max(ndc(L + rad, 0, T - edge).y, ndc(L + rad + 20, LIE_H + 4, T).y);
        const bot = ndc(L + rad, 0, B + edge).y;
        const want = 2 - mTop - mBot, span = top - bot;
        dist *= 1 + (span / want - 1) * 0.6;
        tz -= ((top + bot) / 2 - (mBot - mTop) / 2) * (D / Math.max(span, 0.1)) * 0.35;
        const left = Math.min(ndc(L - edge, 0, B - rad).x, ndc(L - edge, 0, T + rad).x, ndc(L - MW / 2, MH, -ML / 2).x, ndc(L - MW / 2, 0, ML / 2).x, ndc(L - MW / 2, MH, ML / 2).x);
        tx += (left - (-1 + mLeft)) * dist * halfV * aspect * 0.45;
      }
      place();
      // The right end runs off the frame: that's where plates turn back into ingredients.
      let R = L + 2 * rad + 40;
      while (R < 3000 && (ndc(R - rad, 0, T - edge).x < 1.06 || ndc(R - rad, LIE_H, B + edge).x < 1.06)) R += 4;
      loop = makeLoop(L, R, T, B, rad);
      b.layout(loop);
      const m = loop.at(loop.leftMid);
      b.machine.position.set(m.x, 0, m.z);

      // Light from the front left, so the bags' faces are lit and shadows fall behind them.
      const cx = (L + R) / 2, span = Math.max(R - L, D) * 0.62;
      b.ground.position.set(cx, 0, 0); b.ground.scale.set((R - L) * 3, D * 6, 1);
      b.sun.target.position.set(cx, 0, 0);
      b.sun.position.set(cx - 60, 150, 70);
      Object.assign(b.sun.shadow.camera, { left: -span, right: span, top: span, bottom: -span, near: 20, far: 500 });
      b.sun.shadow.camera.updateProjectionMatrix();

      // The plates: evenly spaced, the ones past the roaster already packed.
      items.forEach(b.dropItem);
      const n = Math.max(4, Math.round(loop.len / PITCH)), pitch = loop.len / n;
      const packedSpan = mod(loop.rightMid - loop.leftMid, loop.len);
      items = Array.from({ length: n }, (_, i) => {
        const s0 = i * pitch, s = mod(s0 + travel, loop!.len);
        return b.newItem(s0, mod(-i, FLAVOURS.length), mod(s - loop!.leftMid, loop!.len) < packedSpan);
      });

      // Hand the hollow's screen box to CSS, for the copy: right of the roaster, below the far
      // belt, above the bags standing on the near belt.
      const px = (x: number, y: number, z: number) => { ndc(x, y, z); return [(v.x + 1) / 2 * r.width, (1 - v.y) / 2 * r.height]; };
      const x0 = Math.max(px(L + MW / 2 + 3, MH, 0)[0], px(L + edge + 3, 0, T + edge)[0]);
      const y0 = px(L + 40, 0, T + edge + 2)[1];
      const y1 = Math.min(px(L + 40, 0, B - edge - 2)[1], px(L + 40, LIE_H + 3, B)[1]);
      const x1 = r.width - 24;
      section.style.setProperty("--hx", `${x0}px`); section.style.setProperty("--hy", `${y0}px`);
      section.style.setProperty("--hw", `${Math.max(0, x1 - x0)}px`); section.style.setProperty("--hh", `${Math.max(0, y1 - y0)}px`);
      step(0);
    };

    // ---- one frame of the line ----
    const at: At = { x: 0, z: 0, tx: 0, tz: 0 };
    let hovered: Item | null = null;
    const step = (dt: number) => {
      if (!loop) return;
      const target = motion.matches ? SPEED : 0;
      speed += (target - speed) * Math.min(1, dt * 2.5);
      travel += speed * dt;
      clock += dt * Math.min(1, speed / SPEED);
      b.placeSlats(loop, travel);

      for (const it of items) {
        const s = mod(it.s0 + travel, loop.len);
        if (crossed(it.s, s, loop.leftMid, loop.len) && !it.pack) {
          it.pack = true; b.restyle(it); pulse = 1; pop();
        }
        if (crossed(it.s, s, loop.rightMid, loop.len) && it.pack) {
          // Off the frame: the next flavour in the run takes this plate.
          it.pack = false; it.flavour = mod(it.flavour + items.length, FLAVOURS.length); b.restyle(it);
        }
        it.s = s;
        loop.at(s, at);
        it.lift += ((it === hovered ? 2.4 : 0) - it.lift) * Math.min(1, dt * 10);
        it.group.position.set(at.x, SLAT_Y, at.z);
        it.content.position.y = it.lift;
        // Bags rock gently on the belt, like they're riding it.
        it.content.rotation.z = it.pack ? Math.sin(clock * 3.2 + it.s0) * 0.02 : 0;
        it.content.rotation.x = it.lift * -0.03;
      }

      // The roaster thumps and its lamp flares as each plate goes through.
      pulse = Math.max(0, pulse - dt * 1.6);
      b.lampMat.emissiveIntensity = 0.8 + pulse * 4;
      const thump = Math.sin(Math.min(1, (1 - pulse) * 3) * Math.PI) * pulse;
      b.machine.scale.set(1 + thump * 0.02, 1 - thump * 0.035, 1 + thump * 0.02);

      for (const p of b.pops) {
        if (!p.live) continue;
        p.vy -= 70 * dt;
        p.o.position.x += p.vx * dt; p.o.position.y += p.vy * dt; p.o.position.z += p.vz * dt;
        p.o.rotation.x += dt * 6; p.o.rotation.z += dt * 4;
        if (p.vy < 0 && p.o.position.y < MH + 0.5) { p.live = false; p.o.visible = false; }
      }

      if (hovered && tagRef.current) {
        const v = new THREE.Vector3(hovered.group.position.x, SLAT_Y + (hovered.pack ? LIE_H + 3 : 6), hovered.group.position.z).project(b.camera);
        const r = el.getBoundingClientRect();
        tagRef.current.style.transform = `translate(${(v.x + 1) / 2 * r.width}px, ${(1 - v.y) / 2 * r.height}px) translate(-50%, -100%)`;
      }
    };
    const pop = () => {
      if (!motion.matches) return;
      const vent = b.machine.position;
      let n = 0;
      for (const p of b.pops) {
        if (p.live || n >= 2) continue;
        n++; p.live = true; p.o.visible = true;
        p.o.position.set(vent.x - MW / 2 + 4.2, MH + 1, vent.z + ML / 2 - 3.4);
        p.vx = (Math.random() - 0.3) * 8; p.vz = (Math.random() - 0.5) * 8; p.vy = 26 + Math.random() * 10;
      }
    };

    frame();
    const ro = new ResizeObserver(() => frame()); ro.observe(el);
    wideQ.addEventListener("change", frame);
    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { rootMargin: "100px" }); io.observe(el);
    const tick = (_t: number, deltaMs: number) => {
      if (!visible) return;
      step(Math.min(deltaMs, 50) / 1000);
      b.renderer.render(b.scene, b.camera);
    };
    gsap.ticker.add(tick);


    // Hover lifts a plate and names it; a tap opens the flavour.
    const ray = new THREE.Raycaster(), pt = new THREE.Vector2(), cv = b.renderer.domElement;
    const hit = (e: PointerEvent | MouseEvent) => {
      const r = cv.getBoundingClientRect();
      pt.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(pt, b.camera);
      const h = ray.intersectObjects(items.map((i) => i.hit), false)[0];
      return h ? items.find((i) => i.hit === h.object) ?? null : null;
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const it = hit(e);
      if (it === hovered && (!it || it.pack === hoverPack)) return;
      hovered = it; hoverPack = it?.pack ?? false;
      cv.style.cursor = it ? "pointer" : "";
      setHover(it ? { flavour: it.flavour, pack: it.pack } : null);
    };
    let hoverPack = false;
    const leave = () => { hovered = null; cv.style.cursor = ""; setHover(null); };
    const click = (e: MouseEvent) => { const it = hit(e); if (it) routerRef.current.push(productHref(FLAVOURS[it.flavour].id)); };
    cv.addEventListener("pointermove", move); cv.addEventListener("pointerleave", leave); cv.addEventListener("click", click);
    // Keep the tag honest when a hovered plate changes inside the roaster.
    const sync = window.setInterval(() => { if (hovered && hovered.pack !== hoverPack) { hoverPack = hovered.pack; setHover({ flavour: hovered.flavour, pack: hovered.pack }); } }, 150);

    return () => {
      gsap.ticker.remove(tick); ro.disconnect(); io.disconnect(); window.clearInterval(sync);
      wideQ.removeEventListener("change", frame);
      cv.removeEventListener("pointermove", move); cv.removeEventListener("pointerleave", leave); cv.removeEventListener("click", click);
      items.forEach(b.dropItem); b.dispose();
    };
  }, []);

  const f = hover ? FLAVOURS[hover.flavour] : null;
  return (
    <section ref={root} className={styles.line} aria-labelledby="line-title">
      <div ref={stage} className={styles.stage} />
      <header className={styles.copy}>
        <p className={`${ui.label} ${styles.eyebrow}`}>On the line</p>
        <h2 id="line-title" className={`${ui.display} ${styles.title}`}>The dish goes in. <span>The bag comes out.</span></h2>
        <p className={styles.lede}>
          Every flavour starts with the dish it&rsquo;s built around: the pepper of a rasam, the curry leaves of a tadka,
          the jaggery and tang of a tamarind chutney. Roasted with our makhana, seasoned, sealed. Tap a plate to meet the flavour.
        </p>
      </header>
      <div ref={tagRef} className={styles.tag} data-on={f ? "" : undefined} aria-hidden="true">
        {f && <><b>{f.name}</b><span>{hover!.pack ? "Shop the bag →" : "Going in →"}</span></>}
      </div>
    </section>
  );
}
