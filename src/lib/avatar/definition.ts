// Hero avatar — a real OneWorks 3D scene definition, authored in code.
//
// The core package only seeds scene parameters; model geometry is resolved by
// the renderer from `scene.entity.preset`. We therefore fix a supported entity
// (bear) with an empty `parts` array so the renderer builds its authored
// geometry, then freeze the palette, camera and face the way the palette
// editor would.
//
// Seed is deterministic and frozen here: this is one concrete look, not a
// rollout. The warm palette and cream camera echo the profile photo
// (warm cream + orange "PA" accent); this is a mascot translation, not a
// portrait — OneWorks has no human entity.
import {
  createSeededAvatarDefinition,
  DEFAULT_AVATAR_FACE,
  parseAvatarDefinition,
  type AvatarDefinition,
  type AvatarFace,
} from '@oneworks/avatar';

export const HERO_AVATAR_SEED = 'nikita-boyarkin:product-analyst:bear-v1';

// Eye-open height, shared with the blink clip so the animation returns the
// eyes to this exact value instead of the library default.
export const HERO_AVATAR_EYE_HEIGHT = 62;

// Warm, professional palette: "spectacled-bear" carries a `spectacles` coat
// marking as a light nod to the glasses in the photo.
const HERO_AVATAR_PALETTE_ID = 'spectacled-bear';

// Cream camera background, matching the profile photo backdrop.
const HERO_AVATAR_CAMERA_BACKGROUND = '#efe5cc';

const BEAR_FACE: AvatarFace = {
  ...DEFAULT_AVATAR_FACE,
  eyeRoundness: 100,
  eyeShape: 'rounded',
  height: HERO_AVATAR_EYE_HEIGHT,
  width: 30,
  gap: 38,
  noseEnabled: true,
  noseShape: 'rounded',
  noseWidth: 16,
  noseHeight: 14,
  noseY: 22,
  mouthEnabled: false,
};

const seeded = createSeededAvatarDefinition({
  seed: HERO_AVATAR_SEED,
  name: 'Nikita Boyarkin',
});

export const heroAvatarDefinition: AvatarDefinition = parseAvatarDefinition({
  ...seeded,
  // Drop the generated seed metadata: every value below is frozen by hand.
  metadata: { name: 'Nikita Boyarkin' },
  scene: {
    ...seeded.scene,
    appearance: {
      ...seeded.scene.appearance,
      backgroundStyle: 'solid',
      paletteId: HERO_AVATAR_PALETTE_ID,
    },
    camera: {
      ...seeded.scene.camera,
      background: HERO_AVATAR_CAMERA_BACKGROUND,
      frame: 'circle',
      size: 256,
    },
    // Empty parts + a supported preset lets the renderer resolve the authored
    // bear geometry; we never hand-author serialized entity parts.
    entity: { preset: 'bear', parts: [] },
    face: BEAR_FACE,
    view: {
      ...seeded.scene.view,
      positionY: 72,
      scale: 1.72,
      roll: 0,
    },
  },
});
