"use client";

/**
 * RoomTour — a stylized, low-poly virtual gallery of the Aspen Suite at
 * Kestrel Vale, rendered as a warm "dollhouse" diorama (boxes + cylinders only,
 * no models or textures).
 *
 * Scene composition:
 *  - Warm oak floor (12×9) with three cream walls (inward-facing single-sided
 *    planes: the orbiting camera sees into the room from any side) and deep-pine
 *    baseboards. The ceiling is implied by lighting only.
 *  - Center-left: an oak bed (base, rounded mattress, offset duvet with a
 *    copper throw across the foot, two stacked pillow pairs, slim pine
 *    headboard) on a woven-look cream rug, with a low oak bench at its foot.
 *  - Back wall: a recessed pine-framed window whose emissive dusk pane
 *    (#E8B36A, intensity 1.6) is divided by two thin mullions and glows warm.
 *  - Right: a rust reading armchair with a side table and a lit table lamp —
 *    a real PointLight (#FFC97E, intensity 6, distance 7) visibly warms the
 *    nearby floor and wall.
 *  - Left wall: two thin deep-pine framed art panels.
 *  - Lighting: warm ambient (0.35), a soft directional from the window
 *    direction, the lamp point light, and drei ContactShadows grounding the
 *    furniture cluster (static — rendered once).
 *  - Controls: damped OrbitControls, slow autoRotate, no zoom/pan, polar angle
 *    clamped to pleasant interior angles. `prefers-reduced-motion` disables
 *    autoRotate (initial pose only) while keeping the normal render loop.
 *  - If WebGL is unavailable the component throws so the parent error boundary
 *    can render a fallback image.
 *
 * Sizing contract: the wrapper defaults to ~640×420 (aspect 640/420,
 * max-width 640) that fills its parent; passing a `className` overrides sizing
 * entirely (e.g. "relative h-[420px] w-[640px]"). The canvas fills the wrapper
 * at 100%×100% and is fully resize-responsive.
 */

import { useEffect, useState } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, OrbitControls, RoundedBox } from "@react-three/drei";

/* ------------------------------------------------------------------ */
/* Palette (warm earth tones only — no cool hues)                      */
/* ------------------------------------------------------------------ */

const OAK = "#8A6B4F"; // floor, bed base, bench, table, chair legs (spec palette only)
const CREAM = "#F1EAD9"; // walls, duvet
const CREAM_SOFT = "#EFE7D2"; // mattress, pillows, lamp shade
const CREAM_DEEP = "#DCD2BC"; // rug
const DEEP_PINE = "#1F3D33"; // baseboards, headboard, window frame, art frames
const COPPER = "#C08555"; // bed throw
const RUST = "#A96038"; // armchair fabric, one art inset
const DUSK_GLOW = "#E8B36A"; // emissive window pane
const LAMP_GLOW = "#FFC97E"; // lamp point light / shade emissive
const AMBIENT_WARM = "#FFF4E4"; // ambient light color
const WINDOW_LIGHT = "#FFD9A0"; // directional light color
const CONTACT_SHADOW = "#3a2f22"; // contact shadow color

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
 * to a static image. Probes once per page (the throwaway context is released).
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
    throw new Error("RoomTour requires WebGL, which is unavailable in this browser.");
  }
}

/* ------------------------------------------------------------------ */
/* Room shell                                                          */
/* ------------------------------------------------------------------ */

/** Floor + three inward-facing walls + baseboards. Walls are single-sided so
 *  the orbiting camera sees through them from outside (dollhouse cutaway). */
function RoomShell() {
  return (
    <group>
      {/* Floor: 12×9 warm oak */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[12, 9]} />
        <meshStandardMaterial color={OAK} roughness={0.85} metalness={0} />
      </mesh>
      {/* Back wall (faces +Z, into the room) */}
      <mesh position={[0, 2.75, -4.5]}>
        <planeGeometry args={[12, 5.5]} />
        <meshStandardMaterial color={CREAM} roughness={0.95} metalness={0} />
      </mesh>
      {/* Left wall (faces +X) */}
      <mesh position={[-6, 2.75, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[9, 5.5]} />
        <meshStandardMaterial color={CREAM} roughness={0.95} metalness={0} />
      </mesh>
      {/* Right wall (faces -X) */}
      <mesh position={[6, 2.75, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[9, 5.5]} />
        <meshStandardMaterial color={CREAM} roughness={0.95} metalness={0} />
      </mesh>
      {/* Baseboards in deep pine */}
      <mesh position={[0, 0.14, -4.45]}>
        <boxGeometry args={[12, 0.28, 0.08]} />
        <meshStandardMaterial color={DEEP_PINE} roughness={0.7} metalness={0} />
      </mesh>
      <mesh position={[-5.94, 0.14, 0]}>
        <boxGeometry args={[0.08, 0.28, 9]} />
        <meshStandardMaterial color={DEEP_PINE} roughness={0.7} metalness={0} />
      </mesh>
      <mesh position={[5.94, 0.14, 0]}>
        <boxGeometry args={[0.08, 0.28, 9]} />
        <meshStandardMaterial color={DEEP_PINE} roughness={0.7} metalness={0} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Bed cluster (center-left)                                           */
/* ------------------------------------------------------------------ */

/** Bed center in XZ; headboard end faces the back wall. */
const BED_X = -1.8;
const BED_Z = -2.4;

/** Oak bed with rounded mattress, offset duvet, copper throw, two stacked
 *  pillow pairs and a slim deep-pine headboard. */
function Bed() {
  return (
    <group>
      {/* Base */}
      <mesh position={[BED_X, 0.275, BED_Z]}>
        <boxGeometry args={[4.4, 0.55, 3]} />
        <meshStandardMaterial color={OAK} roughness={0.8} metalness={0} />
      </mesh>
      {/* Mattress */}
      <RoundedBox
        args={[4.2, 0.35, 2.8]}
        radius={0.09}
        smoothness={2}
        bevelSegments={2}
        position={[BED_X, 0.725, BED_Z]}
      >
        <meshStandardMaterial color={CREAM_SOFT} roughness={0.9} metalness={0} />
      </RoundedBox>
      {/* Duvet, slightly offset toward the foot */}
      <RoundedBox
        args={[4.24, 0.16, 1.85]}
        radius={0.06}
        smoothness={2}
        bevelSegments={2}
        position={[BED_X, 0.985, BED_Z + 0.35]}
      >
        <meshStandardMaterial color={CREAM} roughness={0.95} metalness={0} />
      </RoundedBox>
      {/* Copper throw strip across the foot */}
      <mesh position={[BED_X, 1.02, BED_Z + 1.05]}>
        <boxGeometry args={[4.26, 0.2, 0.5]} />
        <meshStandardMaterial color={COPPER} roughness={0.8} metalness={0} />
      </mesh>
      {/* Pillows: two stacked pairs */}
      <RoundedBox args={[1.75, 0.24, 0.62]} radius={0.1} smoothness={2} bevelSegments={2} position={[BED_X - 0.95, 1.02, BED_Z - 0.95]}>
        <meshStandardMaterial color={CREAM_SOFT} roughness={0.9} metalness={0} />
      </RoundedBox>
      <RoundedBox args={[1.75, 0.24, 0.62]} radius={0.1} smoothness={2} bevelSegments={2} position={[BED_X + 0.95, 1.02, BED_Z - 0.95]}>
        <meshStandardMaterial color={CREAM_SOFT} roughness={0.9} metalness={0} />
      </RoundedBox>
      <RoundedBox args={[1.75, 0.24, 0.62]} radius={0.1} smoothness={2} bevelSegments={2} position={[BED_X - 0.78, 1.25, BED_Z - 0.82]} rotation={[0, 0.06, 0]}>
        <meshStandardMaterial color={CREAM_SOFT} roughness={0.9} metalness={0} />
      </RoundedBox>
      <RoundedBox args={[1.75, 0.24, 0.62]} radius={0.1} smoothness={2} bevelSegments={2} position={[BED_X + 0.78, 1.25, BED_Z - 0.82]} rotation={[0, -0.06, 0]}>
        <meshStandardMaterial color={CREAM_SOFT} roughness={0.9} metalness={0} />
      </RoundedBox>
      {/* Slim headboard panel */}
      <mesh position={[BED_X, 1.05, BED_Z - 1.59]}>
        <boxGeometry args={[4.6, 1.5, 0.14]} />
        <meshStandardMaterial color={DEEP_PINE} roughness={0.7} metalness={0} />
      </mesh>
    </group>
  );
}

/** Woven-look rug plane under the bed area. */
function Rug() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[BED_X, 0.012, -2.2]}>
      <planeGeometry args={[6.4, 4.6]} />
      <meshStandardMaterial color={CREAM_DEEP} roughness={1} metalness={0} />
    </mesh>
  );
}

/** Low oak bench at the foot of the bed. */
function Bench() {
  return (
    <group>
      <mesh position={[BED_X, 0.3, -0.35]}>
        <boxGeometry args={[2.9, 0.1, 0.75]} />
        <meshStandardMaterial color={OAK} roughness={0.8} metalness={0} />
      </mesh>
      <mesh position={[BED_X, 0.125, -0.63]}>
        <boxGeometry args={[2.6, 0.25, 0.08]} />
        <meshStandardMaterial color={OAK} roughness={0.8} metalness={0} />
      </mesh>
      <mesh position={[BED_X, 0.125, -0.07]}>
        <boxGeometry args={[2.6, 0.25, 0.08]} />
        <meshStandardMaterial color={OAK} roughness={0.8} metalness={0} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Window (back wall)                                                  */
/* ------------------------------------------------------------------ */

/** Recessed pine frame with an emissive dusk pane and two mullion bars. */
function BackWindow() {
  const frameColor = <meshStandardMaterial color={DEEP_PINE} roughness={0.7} metalness={0} />;
  return (
    <group>
      {/* Emissive dusk pane (double-sided so it still glows when the orbit
          camera looks through the cutaway back wall) */}
      <mesh position={[2.2, 2.6, -4.46]}>
        <planeGeometry args={[3.2, 2.2]} />
        <meshStandardMaterial
          color={DUSK_GLOW}
          emissive={DUSK_GLOW}
          emissiveIntensity={1.6}
          roughness={1}
          metalness={0}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Frame: top, bottom, left, right */}
      <mesh position={[2.2, 3.77, -4.44]}>
        <boxGeometry args={[3.48, 0.14, 0.12]} />
        {frameColor}
      </mesh>
      <mesh position={[2.2, 1.43, -4.44]}>
        <boxGeometry args={[3.48, 0.14, 0.12]} />
        {frameColor}
      </mesh>
      <mesh position={[0.48, 2.6, -4.44]}>
        <boxGeometry args={[0.14, 2.48, 0.12]} />
        {frameColor}
      </mesh>
      <mesh position={[3.92, 2.6, -4.44]}>
        <boxGeometry args={[0.14, 2.48, 0.12]} />
        {frameColor}
      </mesh>
      {/* Two thin mullions dividing the pane */}
      <mesh position={[2.2, 2.6, -4.42]}>
        <boxGeometry args={[0.05, 2.2, 0.06]} />
        {frameColor}
      </mesh>
      <mesh position={[2.2, 2.6, -4.42]}>
        <boxGeometry args={[3.2, 0.05, 0.06]} />
        {frameColor}
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Reading corner (right side)                                         */
/* ------------------------------------------------------------------ */

/** Rust reading armchair: seat + backrest boxes on four cylinder legs. */
function Armchair() {
  return (
    <group position={[3.5, 0, 1.1]} rotation={[0, 2.7, 0]}>
      {/* Seat */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[1.15, 0.4, 1.05]} />
        <meshStandardMaterial color={RUST} roughness={0.95} metalness={0} />
      </mesh>
      {/* Backrest, slightly reclined */}
      <mesh position={[0, 1.18, -0.48]} rotation={[-0.14, 0, 0]}>
        <boxGeometry args={[1.15, 1.1, 0.22]} />
        <meshStandardMaterial color={RUST} roughness={0.95} metalness={0} />
      </mesh>
      {/* Legs */}
      <mesh position={[-0.45, 0.15, -0.4]}>
        <cylinderGeometry args={[0.05, 0.05, 0.3, 10]} />
        <meshStandardMaterial color={OAK} roughness={0.8} metalness={0} />
      </mesh>
      <mesh position={[0.45, 0.15, -0.4]}>
        <cylinderGeometry args={[0.05, 0.05, 0.3, 10]} />
        <meshStandardMaterial color={OAK} roughness={0.8} metalness={0} />
      </mesh>
      <mesh position={[-0.45, 0.15, 0.4]}>
        <cylinderGeometry args={[0.05, 0.05, 0.3, 10]} />
        <meshStandardMaterial color={OAK} roughness={0.8} metalness={0} />
      </mesh>
      <mesh position={[0.45, 0.15, 0.4]}>
        <cylinderGeometry args={[0.05, 0.05, 0.3, 10]} />
        <meshStandardMaterial color={OAK} roughness={0.8} metalness={0} />
      </mesh>
    </group>
  );
}

/** Side table with a lit lamp: thin stem, small cone shade, and a real
 *  PointLight that visibly warms the nearby floor and wall. */
function SideTableWithLamp() {
  return (
    <group position={[2.35, 0, 1.75]}>
      {/* Table: top, stem, base */}
      <mesh position={[0, 0.56, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 0.05, 20]} />
        <meshStandardMaterial color={OAK} roughness={0.8} metalness={0} />
      </mesh>
      <mesh position={[0, 0.29, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.5, 10]} />
        <meshStandardMaterial color={OAK} roughness={0.8} metalness={0} />
      </mesh>
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.2, 0.22, 0.05, 16]} />
        <meshStandardMaterial color={OAK} roughness={0.8} metalness={0} />
      </mesh>
      {/* Lamp: thin stem + small cone shade */}
      <mesh position={[0, 0.76, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.34, 10]} />
        <meshStandardMaterial color={DEEP_PINE} roughness={0.7} metalness={0} />
      </mesh>
      <mesh position={[0, 0.98, 0]}>
        <coneGeometry args={[0.19, 0.26, 20]} />
        <meshStandardMaterial
          color={CREAM_SOFT}
          emissive={LAMP_GLOW}
          emissiveIntensity={0.55}
          roughness={0.9}
          metalness={0}
        />
      </mesh>
      {/* The actual light */}
      <pointLight position={[0, 1.0, 0]} color={LAMP_GLOW} intensity={6} distance={7} />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Wall art (left wall)                                                */
/* ------------------------------------------------------------------ */

/** Thin deep-pine frame with a warm accent panel, hung on the left wall. */
function WallArt({ z, accent }: { z: number; accent: string }) {
  return (
    <group>
      <mesh position={[-5.96, 2.55, z]}>
        <boxGeometry args={[0.07, 1.15, 0.85]} />
        <meshStandardMaterial color={DEEP_PINE} roughness={0.7} metalness={0} />
      </mesh>
      <mesh position={[-5.925, 2.55, z]}>
        <boxGeometry args={[0.03, 0.98, 0.68]} />
        <meshStandardMaterial color={accent} roughness={0.9} metalness={0} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Scene + component                                                   */
/* ------------------------------------------------------------------ */

/** Full room scene: shell, furniture, lights, shadows and controls. */
function RoomScene({ reduced }: { reduced: boolean }) {
  return (
    <group>
      <RoomShell />
      <Rug />
      <Bed />
      <Bench />
      <BackWindow />
      <Armchair />
      <SideTableWithLamp />
      <WallArt z={-2.7} accent={RUST} />
      <WallArt z={-0.9} accent={COPPER} />

      {/* Lighting: warm ambient, soft directional from the window direction,
          plus the lamp's point light inside SideTableWithLamp. */}
      <ambientLight intensity={0.35} color={AMBIENT_WARM} />
      <directionalLight position={[2.2, 4.6, -3.4]} intensity={1.1} color={WINDOW_LIGHT} />

      {/* Soft grounding shadows under the furniture cluster (static scene —
          rendered once for performance). */}
      <ContactShadows
        position={[0, 0.02, -0.75]}
        scale={11.5}
        far={2.6}
        blur={2.6}
        opacity={0.35}
        color={CONTACT_SHADOW}
        frames={1}
      />

      <OrbitControls
        makeDefault
        enableZoom={false}
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minPolarAngle={Math.PI / 3.2}
        maxPolarAngle={Math.PI / 2.05}
        autoRotate={!reduced}
        autoRotateSpeed={0.55}
        target={[0, 1.6, 0]}
      />
    </group>
  );
}

export default function RoomTour({ className }: { className?: string }) {
  const reduced = usePrefersReducedMotion();
  assertWebGLAvailable();

  // ~640×420 by default; a caller-provided className owns sizing fully.
  const wrapperClass = className ?? "relative aspect-[640/420] w-full max-w-[640px]";

  return (
    <div
      className={wrapperClass}
      role="img"
      aria-label="Interactive 3D tour of the Aspen Suite — drag to orbit the room"
    >
      <Canvas
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        camera={{ fov: 38, position: [10.5, 5.2, 12.5], near: 0.5, far: 70 }}
        style={{ width: "100%", height: "100%" }}
      >
        <RoomScene reduced={reduced} />
      </Canvas>
    </div>
  );
}
