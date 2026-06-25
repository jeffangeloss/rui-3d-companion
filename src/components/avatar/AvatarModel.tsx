"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  VRM,
  VRMLoaderPlugin,
  VRMUtils,
} from "@pixiv/three-vrm";
import * as THREE from "three";
import { useCompanionStore } from "@/store/companion-store";
import {
  EXPRESSION_PRESETS,
  MOUTH_EXPRESSION,
  VRM_PATH,
} from "@/lib/avatar-config";

/**
 * Loads the VRM and animates it every frame:
 *  - subtle idle breathing + sway,
 *  - occasional blinks,
 *  - the active emotion from the store,
 *  - mouth openness from the lip-sync controller.
 *
 * Throws (via useLoader/Suspense) if the model is missing — the parent scene
 * catches that with an error boundary and shows a placeholder.
 */
export default function AvatarModel() {
  const gltf = useLoader(GLTFLoader, VRM_PATH, (loader) => {
    loader.register((parser) => new VRMLoaderPlugin(parser));
  });

  const vrm = gltf.userData.vrm as VRM | undefined;

  const setAvatarReady = useCompanionStore((s) => s.setAvatarReady);

  // Per-instance animation bookkeeping.
  const blink = useRef({ timer: 0, nextAt: 3, closing: 0 });
  const clock = useRef(0);
  const currentEmotion = useRef<string>("neutral");

  useEffect(() => {
    if (!vrm) return;

    // VRM0 models face -Z; rotate so Rui looks at the camera.
    VRMUtils.rotateVRM0(vrm);
    // Optimizations recommended by three-vrm.
    VRMUtils.removeUnnecessaryVertices(gltf.scene);
    VRMUtils.combineSkeletons(gltf.scene);

    vrm.scene.traverse((obj) => {
      obj.frustumCulled = false;
    });

    setAvatarReady(true);

    return () => {
      setAvatarReady(false);
      VRMUtils.deepDispose(gltf.scene);
    };
  }, [vrm, gltf.scene, setAvatarReady]);

  // Hand the chest bone to the idle animator once.
  const chest = useMemo(
    () => vrm?.humanoid?.getNormalizedBoneNode("chest") ?? null,
    [vrm]
  );
  const spine = useMemo(
    () => vrm?.humanoid?.getNormalizedBoneNode("spine") ?? null,
    [vrm]
  );

  useFrame((_, delta) => {
    if (!vrm) return;
    clock.current += delta;
    const t = clock.current;

    const em = vrm.expressionManager;
    const status = useCompanionStore.getState().status;
    const emotion = useCompanionStore.getState().emotion;
    const mouthOpen = useCompanionStore.getState().mouthOpen;

    // ── Idle breathing + gentle sway ──────────────────────
    const breath = Math.sin(t * 1.6) * 0.012;
    if (chest) {
      chest.rotation.x = breath;
      chest.position.y = breath * 0.3;
    }
    if (spine) {
      spine.rotation.y = Math.sin(t * 0.5) * 0.03;
    }

    if (em) {
      // ── Blinking ────────────────────────────────────────
      const b = blink.current;
      b.timer += delta;
      if (b.closing > 0) {
        b.closing -= delta;
        // Quick close/open triangle over ~0.18s.
        const phase = 1 - Math.abs(b.closing / 0.18 - 0.5) * 2;
        em.setValue("blink", THREE.MathUtils.clamp(phase, 0, 1));
        if (b.closing <= 0) em.setValue("blink", 0);
      } else if (b.timer >= b.nextAt) {
        b.timer = 0;
        b.nextAt = 2 + Math.random() * 4;
        b.closing = 0.18;
      }

      // ── Emotion (cross-fade to the active emotion) ──────
      const targetExpr =
        EXPRESSION_PRESETS[emotion as keyof typeof EXPRESSION_PRESETS] ??
        "neutral";
      if (currentEmotion.current !== targetExpr) {
        // Fade out the previous one.
        if (currentEmotion.current && currentEmotion.current !== "neutral") {
          em.setValue(currentEmotion.current, 0);
        }
        currentEmotion.current = targetExpr;
      }
      if (targetExpr !== "neutral") {
        const weight = em.getValue(targetExpr) ?? 0;
        em.setValue(targetExpr, Math.min(0.85, weight + delta * 3));
      }

      // ── Mouth / lip sync ────────────────────────────────
      const mouth = status === "speaking" ? mouthOpen : 0;
      em.setValue(MOUTH_EXPRESSION, mouth);
    }

    vrm.update(delta);
  });

  if (!vrm) return null;
  return <primitive object={vrm.scene} />;
}
