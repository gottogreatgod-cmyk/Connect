"use client";

/**
 * HeroTerrain — an elegant, gently swaying low-poly wireframe relief of the
 * Kestrel Vale alpine valley, rendered in copper on a transparent background.
 *
 * Scene composition (all procedural, no assets):
 *  - A 90×90 world-unit plane (110×110 segments) whose vertices are displaced by
 *    a deterministic, hand-rolled pseudo-noise function (four sine/cosine
 *    octaves with mixed frequencies and rotations — no noise library).
 *    The height field shapes a valley: a lake basin below y=0 in the
 *    center-front, mountain ridges rising toward the back, side walls, and a
 *    valley notch running through the middle.
 *  - The wireframe is drawn with an unlit copper MeshBasicMaterial (opacity 0.5)
 *    over a solid deep-pine plane at y=-2 (opacity 0.22) that reads as water
 *    through the mesh.
 *  - Four small warm-gold octahedron markers float above key "settled" spots of
 *    the valley (lakeshore + notch) with a subtle 6s bob.
 *  - The whole relief is tilted back (rotation.x = -0.42) like a museum
 *    topographic model and slowly sways ±0.12 rad around a base yaw of 0.35
 *    (18s pendulum, never a continuous spin). Pointer movement adds a damped
 *    parallax on top.
 *  - `prefers-reduced-motion`: the canvas renders a single frame in the base
 *    pose ("demand" frameloop + one invalidate), with sway and parallax off.
 *  - If a WebGL context cannot be created, the component throws so the parent
 *    error boundary can render a static poster fallback.
 *
 * Sizing contract: the wrapper defaults to a ~460px square (aspect-square,
 * max-width 460) that fills its parent; passing a `className` overrides sizing
 * entirely (e.g. "relative h-[460px] w-[460px]"). The canvas fills the wrapper
 * at 100%×100% and is fully resize-responsive.
 */

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";

/* ------------------------------------------------------------------ */
/* Palette (copper / gold / deep pine only — no cool hues)             */
/* ------------------------------------------------------------------ */

const COPPER = "#C08555";
const GOLD = "#E4B363";
const DEEP_PINE = "#1F3D33";

/* ------------------------------------------------------------------ */
/* Tuning constants                                                    */
/* ------------------------------------------------------------------ */

/** Side length of the terrain plane in pre-scale world units. */
const PLANE_SIZE = 90;
/** Grid resolution of the plane (110×110 → ~0.82-unit cells). */
const PLANE_SEGMENTS = 110;
/** Height of the implied water plane below the relief. */
const WATER_Y = -2;
/**
 * Presentation scale for the rig. The 90-unit relief cannot fit the fixed
 * camera (fov 42 @ [0, 9, 26]) at scale 1, so the whole group is scaled down
 * while every internal measurement stays in the spec'd 90-unit space.
 */
const RIG_SCALE = 0.31;
/** Vertical lift (post-scale, world units) that centers the composition. */
const RIG_LIFT = 0.8;
/** Base tilt of the relief (spec: rotation.x = -0.42). Negative X rotation
 *  tips the near edge up toward the camera — a receding relief-model pose that
 *  keeps the basin, ridges and front frame inside the fixed 42° fov. */
const BASE_TILT_X = -0.42;
/** Base yaw around which the pendulum sway oscillates. */
const BASE_YAW_Y = 0.35;
/** Sway amplitude (rad) — a gentle pendulum, never a full spin. */
const SWAY_AMPLITUDE = 0.12;
/** Sway period: 9s per half-swing → 18s full pendulum. */
const SWAY_PERIOD_SECONDS = 18;
/** Pointer parallax gains added on top of the sway (rad per NDC unit). */
const PARALLAX_YAW_GAIN = 0.08;
const PARALLAX_TILT_GAIN = 0.05;
/** Damping: how quickly the rig eases toward its target pose (per frame @60fps). */
const DAMPING_PER_FRAME = 0.06;

/** Marker geometry (pre-scale world units). */
const MARKER_SIZE = 0.8;
/** Markers hover this far above their terrain spot (pre-scale units). */
const MARKER_HOVER = 2;
/** Marker bob amplitude / period (pre-scale units). */
const MARKER_BOB_AMPLITUDE = 0.4;
const MARKER_BOB_PERIOD_SECONDS = 6;

/* ------------------------------------------------------------------ */
/* Deterministic pseudo-noise height field                             */
/* ------------------------------------------------------------------ */

/** Hermite smoothstep between two edges, clamped to [0, 1]. */
function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/**
 * Terrain height at (x, z) in pre-scale plane space, where z < 0 is the back
 * of the relief (ridges) and z > 0 the front (approach + lake). Deterministic:
 * four hand-rolled sine/cosine octaves plus analytic valley shaping.
 */
function terrainHeight(x: number, z: number): number {
  // Four pseudo-noise octaves: mixed frequencies, phases and a 45° rotation.
  let h =
    1.35 * Math.sin(x * 0.062 + 1.1) * Math.cos(z * 0.055 - 0.7) +
    0.95 * Math.sin((x + z) * 0.078 + 2.0) * Math.cos((x - z) * 0.084 - 0.3) +
    0.5 * Math.sin(x * 0.19 + z * 0.16 + 2.6) +
    0.32 * Math.cos(x * 0.27 - z * 0.21 + 0.4);

  // Mountain ridges rising toward the back of the relief.
  const backness = smoothstep(6, -34, z);
  const ridge =
    5.2 + 3.4 * Math.sin(x * 0.085 + 0.4) + 2.0 * Math.sin(x * 0.19 - 1.2) * Math.cos(z * 0.07 + 0.8);
  h += backness * ridge;

  // Gentle side walls so the whole thing reads as a valley.
  const sidewall = smoothstep(14, 44, Math.abs(x));
  h += sidewall * (2.6 + 1.8 * Math.cos(z * 0.075 + x * 0.02));

  // Valley notch running through the middle — deepest where it cuts the ridge.
  const notch = Math.exp(-(x * x) / 128);
  h -= notch * (1.2 + backness * (4.6 + 1.6 * Math.sin(z * 0.09 + 0.5)));

  // Lake basin below y=0 in the center-front.
  const bx = x / 9;
  const bz = (z - 13) / 11;
  h -= Math.exp(-(bx * bx + bz * bz)) * 7.5;

  // A slight rise at the very front frames the diorama.
  h += smoothstep(24, 44, z) * 1.6;

  // Flatten the lake floor so the water plane reads clearly.
  return Math.max(h, -3.2);
}

/** Marker spots: lakeshore cabins and one holdout up the valley notch. */
const MARKERS: Array<{ position: [number, number, number]; phase: number }> = (
  [
    [-10, 12],
    [9, 19],
    [-4, 3],
    [3, -18],
  ] as Array<[number, number]>
).map(([x, z], i) => ({
  position: [x, terrainHeight(x, z) + MARKER_HOVER, z],
  phase: i * 1.6,
}));

/* ------------------------------------------------------------------ */
/* Environment guards (duplicated per-file: two-file scope constraint) */
/* ------------------------------------------------------------------ */

/** Reactive `prefers-reduced-motion` (false during SSR, updates live). */
function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reduced;
}

let webglSupport: boolean | null = null;

/**
 * Throws when WebGL is unavailable so the parent error boundary can fall back
 * to a static poster. Probes once per page (the throwaway context is released).
 */
function assertWebGLAvailable(): void {
  if (typeof document === "undefined") return; // SSR — R3F initializes client-side
  if (webglSupport === null) {
    const probe = document.createElement("canvas");
    const gl = probe.getContext("webgl2") ?? probe.getContext("webgl");
    webglSupport = gl !== null;
    if (gl) gl.getExtension("WEBGL_lose_context")?.loseContext();
  }
  if (!webglSupport) {
    throw new Error("HeroTerrain requires WebGL, which is unavailable in this browser.");
  }
}

/* ------------------------------------------------------------------ */
/* Scene pieces                                                        */
/* ------------------------------------------------------------------ */

/** The displaced wireframe relief itself (one draw call). */
function TerrainMesh() {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(PLANE_SIZE, PLANE_SIZE, PLANE_SEGMENTS, PLANE_SEGMENTS);
    geo.rotateX(-Math.PI / 2); // lie flat in XZ, height along +Y
    const position = geo.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < position.count; i++) {
      position.setY(i, terrainHeight(position.getX(i), position.getZ(i)));
    }
    position.needsUpdate = true;
    return geo;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <mesh geometry={geometry} renderOrder={1}>
      <meshBasicMaterial color={COPPER} wireframe transparent opacity={0.5} />
    </mesh>
  );
}

/** A warm-gold octahedron gently bobbing above a valley spot. */
function ValleyMarker({
  position,
  phase,
  reduced,
}: {
  position: [number, number, number];
  phase: number;
  reduced: boolean;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const mesh = ref.current;
    // Reduced motion: freeze exactly at the resting hover height (+2 over the
    // spot) so stray invalidate() calls (e.g. pointer events) can't jog it.
    if (!mesh || reduced) return;
    const t = state.clock.elapsedTime;
    mesh.position.y =
      position[1] +
      Math.sin((t * Math.PI * 2) / MARKER_BOB_PERIOD_SECONDS + phase) * MARKER_BOB_AMPLITUDE;
  });
  return (
    <mesh ref={ref} position={position}>
      <octahedronGeometry args={[MARKER_SIZE]} />
      <meshBasicMaterial color={GOLD} />
    </mesh>
  );
}

/**
 * Presentation rig: receding tilt (rotation.x = -0.42), pendulum sway around
 * the base yaw, damped pointer parallax. Reduced motion freezes everything at
 * the base pose.
 */
function TerrainRig({ reduced, children }: { reduced: boolean; children: ReactNode }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group || reduced) return;
    const t = state.clock.elapsedTime;
    const sway = Math.sin((t * Math.PI * 2) / SWAY_PERIOD_SECONDS) * SWAY_AMPLITUDE;
    const targetYaw = BASE_YAW_Y + sway + state.pointer.x * PARALLAX_YAW_GAIN;
    const targetTilt = BASE_TILT_X + state.pointer.y * PARALLAX_TILT_GAIN;
    // Frame-rate independent damping (~0.06 per frame at 60fps).
    const k = 1 - Math.pow(1 - DAMPING_PER_FRAME, Math.min(delta, 0.1) * 60);
    group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, targetYaw, k);
    group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, targetTilt, k);
  });
  return (
    <group ref={groupRef} position={[0, RIG_LIFT, 0]} rotation={[BASE_TILT_X, BASE_YAW_Y, 0]}>
      <group scale={RIG_SCALE}>{children}</group>
    </group>
  );
}

/** Aims the default camera at the origin and, under reduced motion, renders
 *  exactly one frame ("demand" frameloop needs a manual invalidate). */
function CameraSetup({ reduced }: { reduced: boolean }) {
  const camera = useThree((state) => state.camera);
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    if (reduced) invalidate();
  }, [camera, invalidate, reduced]);
  return null;
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export default function HeroTerrain({ className }: { className?: string }) {
  const reduced = usePrefersReducedMotion();
  assertWebGLAvailable();

  // ~460px square by default; a caller-provided className owns sizing fully.
  const wrapperClass = className ?? "relative aspect-square w-full max-w-[460px]";

  return (
    <div className={wrapperClass} role="img" aria-label="Wireframe topographic relief of the Kestrel Vale alpine valley">
      <Canvas
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        flat
        camera={{ fov: 42, position: [0, 9, 26], near: 0.5, far: 220 }}
        frameloop={reduced ? "demand" : "always"}
        style={{ width: "100%", height: "100%" }}
      >
        <CameraSetup reduced={reduced} />
        {/* Keyed remount guarantees the exact base pose when reduced motion
            is toggled on mid-session (frozen loop keeps the last pose). */}
        <TerrainRig key={reduced ? "static" : "live"} reduced={reduced}>
          <TerrainMesh />
          {/* Solid water plane seen through the wireframe. */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, WATER_Y, 0]} renderOrder={0}>
            <planeGeometry args={[PLANE_SIZE, PLANE_SIZE]} />
            <meshBasicMaterial color={DEEP_PINE} transparent opacity={0.22} depthWrite={false} />
          </mesh>
          {MARKERS.map((marker) => (
            <ValleyMarker
              key={`${marker.position[0]}:${marker.position[2]}`}
              position={marker.position}
              phase={marker.phase}
              reduced={reduced}
            />
          ))}
        </TerrainRig>
      </Canvas>
    </div>
  );
}
