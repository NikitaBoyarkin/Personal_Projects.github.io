// Deferred mount entry for the hero avatar.
//
// Kept in its own module so the hero's inline script can `import()` it after
// the page has loaded. Both the runtime and its stylesheet are loaded here at
// runtime — the stylesheet as a `?url` asset injected on demand — so neither is
// hoisted onto the page's critical path. The photo renders (and does the LCP
// work) first; the 3D scene takes over only once a real mount succeeds.
import avatarStylesUrl from '@oneworks/avatar-web/style.css?url';
import { HERO_AVATAR_ANIMATION_REF, heroAvatarAnimations } from './animations';
import { heroAvatarDefinition } from './definition';

const STYLE_MARKER = 'data-oneworks-avatar-styles';

function loadAvatarStyles(href: string): Promise<void> {
  const existing = document.querySelector<HTMLLinkElement>(
    `link[${STYLE_MARKER}]`,
  );
  if (existing) {
    return existing.sheet
      ? Promise.resolve()
      : new Promise((resolve) => {
          existing.addEventListener('load', () => resolve(), { once: true });
          existing.addEventListener('error', () => resolve(), { once: true });
        });
  }

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.setAttribute(STYLE_MARKER, '');
  const loaded = new Promise<void>((resolve) => {
    link.addEventListener('load', () => resolve(), { once: true });
    link.addEventListener('error', () => resolve(), { once: true });
  });
  document.head.append(link);
  return loaded;
}

export async function mountHeroAvatar(
  slot: HTMLElement,
): Promise<{ destroy: () => void } | null> {
  const mountEl = slot.querySelector<HTMLElement>('[data-hero-avatar-mount]');
  const fallback = slot.querySelector<HTMLElement>('[data-hero-avatar-fallback]');
  if (!mountEl) return null;

  const [runtime] = await Promise.all([
    import('@oneworks/avatar-web'),
    loadAvatarStyles(avatarStylesUrl),
  ]);

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches;

  const avatar = runtime.createAvatar(mountEl, {
    definition: heroAvatarDefinition,
    animationLibraries: [heroAvatarAnimations],
    animation: HERO_AVATAR_ANIMATION_REF,
    autoplay: !prefersReducedMotion,
    interactive: false,
  });

  await avatar.ready;

  mountEl.hidden = false;
  if (fallback) fallback.hidden = true;

  return avatar;
}
