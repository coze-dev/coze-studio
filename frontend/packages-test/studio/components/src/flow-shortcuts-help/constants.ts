const isMacOS = /(Macintosh|MacIntel|MacPPC|Mac68K|iPad)/.test(
  navigator.userAgent,
);

export const SHORTCUTS = {
  CTRL: isMacOS ? '⌘' : 'Ctrl',
  SHIFT: isMacOS ? '⇧' : '⇧',
  ALT: isMacOS ? '⌥' : 'Alt',
};
