/**
 * Avatar / stage configuration: where the VRM lives, how the camera frames it,
 * and the lighting/background presets used by "escenario" mode.
 */

export const VRM_PATH =
  process.env.NEXT_PUBLIC_VRM_PATH?.trim() || "/models/rui-local.vrm";

export interface CameraConfig {
  position: [number, number, number];
  /** Look-at target (roughly chest/face height). */
  target: [number, number, number];
  fov: number;
}

export const DEFAULT_CAMERA: CameraConfig = {
  position: [0, 1.35, 2.4],
  target: [0, 1.3, 0],
  fov: 30,
};

export interface StagePreset {
  id: string;
  label: string;
  /** CSS background for the stage container (behind the canvas). */
  background: string;
  /** Hex color of the key/spot light. */
  keyLight: string;
  keyIntensity: number;
  ambient: string;
  ambientIntensity: number;
}

/**
 * Lighting + backdrop presets for "escenario" mode. Background images can be
 * dropped into /public/backgrounds and referenced here later; for now we use
 * gradients so the app works with zero private assets.
 */
export const STAGE_PRESETS: StagePreset[] = [
  {
    id: "spotlight",
    label: "Spotlight",
    background:
      "radial-gradient(circle at 50% 35%, #2a1d3a 0%, #140d1f 60%, #0a0710 100%)",
    keyLight: "#ffd58a",
    keyIntensity: 2.2,
    ambient: "#5b4d7a",
    ambientIntensity: 0.7,
  },
  {
    id: "twilight",
    label: "Twilight",
    background:
      "linear-gradient(160deg, #1b2a4a 0%, #2d1b3d 55%, #120b1e 100%)",
    keyLight: "#9fb8ff",
    keyIntensity: 1.8,
    ambient: "#3a4a7a",
    ambientIntensity: 0.9,
  },
  {
    id: "lab",
    label: "Laboratorio",
    background:
      "linear-gradient(160deg, #0d2620 0%, #103a33 55%, #07140f 100%)",
    keyLight: "#8affd4",
    keyIntensity: 1.9,
    ambient: "#2f6e5c",
    ambientIntensity: 0.8,
  },
  {
    id: "comfort",
    label: "Comfort",
    background:
      "radial-gradient(circle at 50% 40%, #3a2230 0%, #241420 60%, #120a10 100%)",
    keyLight: "#ffb0c8",
    keyIntensity: 1.6,
    ambient: "#6a4658",
    ambientIntensity: 1.0,
  },
];

export const DEFAULT_PRESET_ID = STAGE_PRESETS[0].id;

export function getPreset(id: string): StagePreset {
  return STAGE_PRESETS.find((p) => p.id === id) ?? STAGE_PRESETS[0];
}

/**
 * Mapping of high-level emotions to VRM expression preset names.
 * @pixiv/three-vrm exposes these standard expression presets.
 */
export const EXPRESSION_PRESETS = {
  neutral: "neutral",
  happy: "happy",
  angry: "angry",
  sad: "sad",
  relaxed: "relaxed",
  surprised: "surprised",
} as const;

export type EmotionName = keyof typeof EXPRESSION_PRESETS;

/** Mouth (lip-sync) expression presets — the "aa" viseme drives volume sync. */
export const MOUTH_EXPRESSION = "aa";
