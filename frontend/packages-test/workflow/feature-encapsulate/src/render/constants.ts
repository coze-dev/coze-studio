const isMacOS = /(Macintosh|MacIntel|MacPPC|Mac68K|iPad)/.test(
  navigator.userAgent,
);

const CTRL = isMacOS ? '⌘' : 'Ctrl';
const SHIFT = isMacOS ? '⇧' : 'Shift';

export const ENCAPSULATE_SHORTCUTS = {
  encapsulate: `${CTRL} G`,
  decapsulate: `${CTRL} ${SHIFT} G`,
};
