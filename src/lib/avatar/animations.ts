// Ambient motion for the hero avatar.
//
// OneWorks does not ship built-in clips through the runtime package, so the
// animation library is authored here against the documented
// `AvatarAnimationLibrary` contract and passed to the mount.
//
// The clip is `relative`: it re-anchors to the avatar's composed pose when
// playback starts and applies small offsets, so the frozen scene stays the
// source of truth. Keep the offsets small so they read as breathing, not drift.
//
// Clip validation requires every keyframe gap — and the tail from the final
// keyframe to `durationMs` — to be between 100 ms and 8000 ms, so the clip ends
// 200 ms after its last keyframe.
import type { AvatarAnimationLibrary } from '@oneworks/avatar';
import { HERO_AVATAR_EYE_HEIGHT } from './definition';

const TAIL_MS = 200;
const LAST_KEYFRAME_MS = 5200;

export const heroAvatarAnimations: AvatarAnimationLibrary = {
  id: 'hero-ambient',
  label: 'Hero ambient',
  groups: {
    ambient: {
      label: 'Ambient',
      defaultClip: 'idle',
      clips: {
        idle: {
          anchor: 'relative',
          durationMs: LAST_KEYFRAME_MS + TAIL_MS,
          playback: 'loop',
          label: 'Idle',
          keyframes: [
            {
              atMs: 0,
              easing: 'ease-in-out',
              patch: { view: { yaw: 0, pitch: 0, positionX: 0 } },
            },
            {
              atMs: 1300,
              easing: 'ease-in-out',
              patch: { view: { yaw: 0.07, pitch: 0.02, positionX: 6 } },
            },
            {
              atMs: 2600,
              easing: 'ease-in-out',
              patch: { view: { yaw: 0, pitch: 0, positionX: 0 } },
            },
            // Quick blink: open → closed → open, then hold.
            {
              atMs: 3090,
              easing: 'ease-out',
              patch: { face: { height: HERO_AVATAR_EYE_HEIGHT } },
            },
            { atMs: 3210, easing: 'ease-out', patch: { face: { height: 2 } } },
            {
              atMs: 3350,
              easing: 'ease-in',
              patch: { face: { height: HERO_AVATAR_EYE_HEIGHT } },
            },
            {
              atMs: 3900,
              easing: 'ease-in-out',
              patch: { view: { yaw: -0.07, pitch: 0.02, positionX: -6 } },
            },
            {
              atMs: LAST_KEYFRAME_MS,
              easing: 'ease-in-out',
              patch: { view: { yaw: 0, pitch: 0, positionX: 0 } },
            },
          ],
        },
      },
    },
  },
};

export const HERO_AVATAR_ANIMATION_REF = {
  libraryId: heroAvatarAnimations.id,
  groupId: 'ambient',
  clipId: 'idle',
} as const;
