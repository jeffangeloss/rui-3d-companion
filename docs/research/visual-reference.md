# Visual reference

> Moodboard / design direction only. Do **not** download or commit official
> imagery. Build **original** assets inspired by these traits.

## Palette (canonical-inspired)

| Role | Hex | Use |
|------|-----|-----|
| Primary | `#BB88EE` | lavender-purple — accents, primary actions |
| Gold | `#F7D84A` | spotlight, highlights |
| Cyan | `#2BC7D9` | secondary accents, glow |
| White | `#FFFFFF` | text, contrast |
| Black | `#111111` | deep backgrounds |

These are implemented in `tailwind.config.ts` (`stage.accent`, `stage.spot`,
`stage.accent2`) and `src/lib/character-config.ts` (`PALETTE`).

## Character silhouette & traits (for original art)

- **Hair:** lavender / purple, with **cyan** accents.
- **Eyes:** gold.
- **Build:** tall, slender silhouette.
- **Outfit:** theatrical "inventor coat" vibe — stage director meets tinkerer.
  Inspired by, **not** a direct copy of, official designs.
- **Expressions:** smirk, curious, delighted, dramatic, soft.

## Motifs

- Theater: curtains, stage, spotlights, masks.
- Invention: gears, robots, mechanisms, sparks, blueprints.
- Wonderland whimsy: balloons, stars, playful geometry.

## Scene direction (`/companion`)

- Dark, theatrical backdrop with a warm key light (gold) and cool fill (cyan).
- Stage presets ("escenario" mode): spotlight, twilight, lab, comfort.
- Avatar centered/left; glassmorphism chat panel on the right (desktop) or
  below (mobile).

## Avatar

- Until an original VRM is provided, the app renders a **friendly placeholder**
  (no official model). See `AvatarScene.tsx`.
- Original VRM goes in `public/models/private/` (gitignored).
