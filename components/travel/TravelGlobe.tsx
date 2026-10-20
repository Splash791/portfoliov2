"use client";

import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Line, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { Trip } from "@/data/trips";

// Default export only (dynamically imported with { ssr: false } from
// Travel.tsx) -- this file must never run on the server.

const RADIUS = 2;
const PIN_COLORS = ["#ff6f59", "#8c7ae6", "#f6ae2d"];

function latLngToVector3(lat: number, lng: number, radius: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

function arcPoints(a: THREE.Vector3, b: THREE.Vector3, radius: number) {
  const mid = a.clone().add(b).normalize().multiplyScalar(radius * 1.25);
  const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
  return curve.getPoints(32);
}

function Pin({
  position,
  color,
  onSelect,
}: {
  position: THREE.Vector3;
  color: string;
  onSelect: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <mesh
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <sphereGeometry args={[hovered ? 0.07 : 0.05, 16, 16]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={hovered ? 0.8 : 0.4}
      />
    </mesh>
  );
}

// Grows the arc in over ~1.5s by progressively revealing more of its
// sampled points -- satisfies "animated route arcs ... drawn" (section 7).
// Under reduced motion it renders fully formed immediately (animate=false).
function AnimatedArc({
  points,
  color,
  animate,
}: {
  points: THREE.Vector3[];
  color: string;
  animate: boolean;
}) {
  const progressRef = useRef(animate ? 0 : 1);
  const [visiblePoints, setVisiblePoints] = useState(
    animate ? points.slice(0, 2) : points,
  );

  useFrame((_, delta) => {
    if (!animate || progressRef.current >= 1) return;
    progressRef.current = Math.min(1, progressRef.current + delta * 0.6);
    const count = Math.max(2, Math.floor(points.length * progressRef.current));
    setVisiblePoints(points.slice(0, count));
  });

  if (visiblePoints.length < 2) return null;

  return (
    <Line points={visiblePoints} color={color} lineWidth={1.5} transparent opacity={0.9} />
  );
}

function Routes({ trips, animate }: { trips: Trip[]; animate: boolean }) {
  const arcs = useMemo(() => {
    const result: { key: string; points: THREE.Vector3[] }[] = [];
    for (const trip of trips) {
      const stopByName = new Map(trip.stops.map((s) => [s.name, s]));
      trip.routes.forEach((route, i) => {
        const from = stopByName.get(route.from);
        const to = stopByName.get(route.to);
        if (!from || !to) return;
        const a = latLngToVector3(from.lat, from.lng, RADIUS);
        const b = latLngToVector3(to.lat, to.lng, RADIUS);
        result.push({ key: `${trip.slug}-${i}`, points: arcPoints(a, b, RADIUS) });
      });
    }
    return result;
  }, [trips]);

  return (
    <>
      {arcs.map((arc) => (
        <AnimatedArc key={arc.key} points={arc.points} color="#8c7ae6" animate={animate} />
      ))}
    </>
  );
}

function GlobeScene({
  trips,
  reducedMotion,
  onSelectTrip,
}: {
  trips: Trip[];
  reducedMotion: boolean;
  onSelectTrip: (slug: string) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    // No continuous auto-rotation under reduced motion -- user-driven
    // OrbitControls rotate/zoom stay enabled either way, this only gates
    // the automatic spin.
    if (reducedMotion) return;
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.05;
  });

  return (
    // Starting yaw of PI: with this camera, a stop's longitude alone decides
    // front- vs. back-facing (0-180°E lands on the far side by default), and
    // three of our four trip stops are East-hemisphere, clustered together —
    // without this offset a visitor sees a bare sphere with zero pins until
    // they manually orbit it. Rotating the start point by half a turn puts
    // that cluster facing the camera on load instead.
    <group ref={groupRef} rotation={[0, Math.PI, 0]}>
      <mesh>
        {/* Low-poly sphere (32 segments) + capped pixel ratio on the
            Canvas below -- section 2's mobile-perf requirement. */}
        <sphereGeometry args={[RADIUS, 32, 32]} />
        <meshStandardMaterial color="#1e1b4b" roughness={0.9} metalness={0.1} />
      </mesh>
      <Routes trips={trips} animate={!reducedMotion} />
      {trips.map((trip, ti) =>
        trip.stops.map((stop, si) => (
          <Pin
            key={`${trip.slug}-${si}`}
            position={latLngToVector3(stop.lat, stop.lng, RADIUS)}
            color={PIN_COLORS[ti % PIN_COLORS.length]}
            onSelect={() => onSelectTrip(trip.slug)}
          />
        )),
      )}
    </group>
  );
}

export default function TravelGlobe({
  trips,
  reducedMotion,
  onSelectTrip,
}: {
  trips: Trip[];
  reducedMotion: boolean;
  onSelectTrip: (slug: string) => void;
}) {
  return (
    <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 5], fov: 45 }}>
      {/* Three.js r155+ defaults to physically-correct (photometric) light
          units, where point-light intensity is candela-scaled and falls off
          with real inverse-square distance — the old-style "intensity: 1"
          that used to look like a normal fill light now renders as
          essentially unlit/black at a few world units away. Bumped to
          actually illuminate the sphere; tuned by eye against a real
          render, not copied from a pre-r155 example. */}
      <ambientLight intensity={1.5} />
      <pointLight position={[5, 5, 5]} intensity={150} />
      <GlobeScene trips={trips} reducedMotion={reducedMotion} onSelectTrip={onSelectTrip} />
      <OrbitControls enablePan={false} minDistance={3} maxDistance={8} />
    </Canvas>
  );
}
