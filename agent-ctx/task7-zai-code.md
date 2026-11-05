# Task 7 — Three.js scene components (HeroTerrain + RoomTour)

Agent: Z.ai Code (zai-code)
Status: COMPLETE — lint clean (exit 0), `tsc --noEmit` clean for both files (only pre-existing errors remain in `examples/` + `skills/`, which are outside this task's scope and excluded from ESLint ignores).

## Files touched (exactly two, per brief)

1. `src/components/three/HeroTerrain.tsx` — default export `HeroTerrain`, `'use client'`, props `{ className?: string }`.
2. `src/components/three/RoomTour.tsx` — default export `RoomTour`, `'use client'`, props `{ className?: string }`.

Both were found already drafted from a prior partial run of this task; I reviewed them line-by-line against the brief, fixed spec deviations (see "Changes I made"), and re-verified. No other files were created or modified. No `next build` was run.

## What each file delivers

### HeroTerrain.tsx
- 90×90-unit `PlaneGeometry`, 110×110 segments, displaced by a hand-rolled deterministic 4-octave sine/cosine height field (no noise libs): lake basin below y=0 center-front (floor clamped −3.2, water at −2), ridges rising to the back, side walls, central valley notch, slight front rise framing the diorama.
- Copper `#C08555` wireframe `MeshBasicMaterial` (opacity 0.5, transparent); solid `#1F3D33` plane at y=−2, opacity 0.22, depthWrite off, as the water hint.
- 4 gold `#E4B363` octahedron markers (0.8 units) hovering +2 above key spots, ±0.4 bob on a 6 s cycle, phase offsets i·1.6.
- Rig: tilt `rotation.x = -0.42` (spec-literal), sway `rotation.y = 0.35 + sin(t)·0.12` (18 s pendulum — never a full spin), pointer parallax ±0.08 yaw / ±0.05 tilt with 0.06 damping (frame-rate compensated).
- Camera fov 42 @ [0,9,26] lookAt origin; no OrbitControls; no textures/assets; dpr [1,1.75]; alpha; `flat` (no tone mapping so the copper/gold hues stay exact).
- `prefers-reduced-motion` → frameloop "demand" + one invalidate, sway/parallax/bob fully frozen (markers now guarded so stray pointer invalidates can't jog them; rig is keyed to remount in the base pose).
- WebGL unavailable → component throws (context probe, released via `WEBGL_lose_context`); parent error boundary owns the fallback.
- Budget: 6 draw calls (terrain, water, 4 markers); per-frame cost ≈ a dozen trig calls — far under 4 ms.

### RoomTour.tsx
- Dollhouse "Aspen Suite": 12×9 oak `#8A6B4F` floor; three cream `#F1EAD9` walls (5.5 high, single-sided so the orbit camera sees into the room from any side); deep-pine `#1F3D33` baseboards.
- Bed center-left: oak base 4.4×0.55×3, cream `#EFE7D2` mattress (drei `RoundedBox`, smoothness/bevelSegments 2), offset duvet, copper `#C08555` throw strip across the foot, 4 cream pillows in 2 stacked pairs, slim pine headboard; cream `#DCD2BC` rug beneath; low oak bench at the foot.
- Back-wall window 3.2×2.2: pine frame + emissive `#E8B36A` pane (emissiveIntensity 1.6, double-sided) + 2 mullions — warm-dusk glow.
- Right side: rust `#A96038` reading armchair (boxes + 4 cylinder legs), oak side table, lamp (cylinder stem + cone shade with warm emissive) and a REAL `pointLight` `#FFC97E` intensity 6 distance 7 that visibly warms the floor/wall.
- Left wall: two thin pine-framed art rects (rust + copper insets).
- Lighting: ambient 0.35 `#FFF4E4`, directional 1.1 `#FFD9A0` from the window, the lamp point light; drei `ContactShadows` (opacity 0.35, blur 2.6, color `#3a2f22`, `frames={1}` — static scene baked once to protect the frame budget).
- Controls: `OrbitControls` makeDefault, no zoom/pan, damping 0.08, polar clamps π/3.2…π/2.05, autoRotate 0.55 (disabled under reduced motion). Camera fov 38 @ [10.5,5.2,12.5], target [0,1.6,0].
- WebGL fail → throw; ~40 trivial box/cylinder/plane draw calls — well under 6 ms/frame.
- Palette: strictly the brief's colors (I removed an off-palette `#6E5137` "dark oak" the earlier draft had introduced; those parts now use the spec oak `#8A6B4F`). No blue/purple anywhere.

## Changes I made to the prior draft (deviations from draft, aligned to brief)

1. `BASE_TILT_X`: draft used +0.42; brief says **−0.42**. Verified via frustum math that −0.42 (near edge tipped up toward camera) keeps basin/ridges/front frame inside the fixed 42° fov (+0.42 cropped the near field ~10° outside the frame). Now spec-literal.
2. `RIG_SCALE` 0.33 → 0.31 for headroom at sway/parallax extremes. (Presentation scale is needed at all because a literal 90-unit plane cannot fit a camera at [0,9,26]; all internal measurements stay in the spec'd 90-unit space.)
3. Markers: added `reduced` guard so reduced-motion users get an exact static pose.
4. Wrappers: both components now have safe default sizes when `className` is omitted (`relative aspect-square w-full max-w-[460px]` / `relative aspect-[640/420] w-full max-w-[640px]`); a provided `className` overrides sizing entirely. Previously an omitted className collapsed the canvas to 0 height.
5. RoomTour palette fix (removed `#6E5137`), JSDoc updates for the above.

## Integration notes for other agents (page / hero section owner)

- Import: `import HeroTerrain from "@/components/three/HeroTerrain"` / `import RoomTour from "@/components/three/RoomTour"` (client components — import them from another client component or a server page is fine).
- **Wrap each in an error boundary**: both throw when WebGL is unavailable; render your static fallback there.
- Sizing: default sizes apply automatically; to control size, pass e.g. `className="relative h-[460px] w-[460px]"` (HeroTerrain) or `className="relative h-[420px] w-[640px]"` (RoomTour). Canvases fill the wrapper 100%×100% and track parent resizes.
- Reduced-motion and SSR are handled internally (matchMedia read post-mount, so no hydration mismatch).

## Verification

- `bun run lint 2>&1 | tail -20` → `eslint .`, exit 0, no findings.
- `bunx tsc --noEmit` → only pre-existing errors in `examples/websocket/*` and `skills/*` (not mine, not touched); both component files type-check clean.
- Installed versions confirmed: three 0.186.1, @types/three 0.186.0, @react-three/fiber 9.8.2, @react-three/drei 10.7.9.
- Environment init script not re-run: project already initialized (full deps + shadcn/ui present); re-running mid-parallel-build risked clobbering other agents' in-flight files.
