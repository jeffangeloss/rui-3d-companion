"use client";

import { Component, ReactNode, Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import AvatarModel from "./AvatarModel";
import { useCompanionStore } from "@/store/companion-store";
import { DEFAULT_CAMERA, getPreset } from "@/lib/avatar-config";

/** Catches a failed VRM load (e.g. file missing) and reports it to the store. */
class ModelErrorBoundary extends Component<
  { onError: (msg: string) => void; children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    this.props.onError(error.message);
  }

  render() {
    // On error, render nothing in the 3D graph; the DOM overlay explains it.
    return this.state.hasError ? null : this.props.children;
  }
}

/** Friendly DOM overlay shown while loading or when the model can't be found. */
function StagePlaceholder({ message }: { message: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div className="w-64 rounded-2xl border border-white/10 bg-stage-panel/80 px-5 py-4 text-center backdrop-blur">
        <div className="text-4xl">🎭</div>
        <div className="mt-2 text-sm font-semibold text-white">{message}</div>
      </div>
    </div>
  );
}

export default function AvatarScene() {
  const presetId = useCompanionStore((s) => s.presetId);
  const avatarReady = useCompanionStore((s) => s.avatarReady);
  const avatarError = useCompanionStore((s) => s.avatarError);
  const setAvatarError = useCompanionStore((s) => s.setAvatarError);
  const preset = getPreset(presetId);

  // Reset any prior error when the preset changes (lets a retry surface).
  useEffect(() => {
    setAvatarError(null);
  }, [presetId, setAvatarError]);

  return (
    <div
      className="relative h-full w-full"
      style={{ background: preset.background }}
    >
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: DEFAULT_CAMERA.position, fov: DEFAULT_CAMERA.fov }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight
          color={preset.ambient}
          intensity={preset.ambientIntensity}
        />
        <directionalLight
          color={preset.keyLight}
          intensity={preset.keyIntensity}
          position={[2, 4, 3]}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight
          color={preset.keyLight}
          intensity={preset.keyIntensity * 0.4}
          position={[-3, 2, -2]}
        />

        <Suspense fallback={null}>
          <ModelErrorBoundary onError={(msg) => setAvatarError(msg)}>
            <group position={[0, 0, 0]}>
              <AvatarModel />
            </group>
          </ModelErrorBoundary>
        </Suspense>

        <ContactShadows
          position={[0, 0, 0]}
          opacity={0.5}
          scale={6}
          blur={2.4}
          far={3}
          color="#000000"
        />

        <OrbitControls
          target={DEFAULT_CAMERA.target}
          enablePan={false}
          minDistance={1.4}
          maxDistance={4}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.8}
          enableDamping
        />
      </Canvas>

      {/* DOM overlays (kept out of the WebGL canvas so Next can prerender). */}
      {avatarError ? (
        <StagePlaceholder message="Coloca tu modelo en public/models/rui-local.vrm" />
      ) : (
        !avatarReady && <StagePlaceholder message="Preparando el escenario…" />
      )}
    </div>
  );
}
