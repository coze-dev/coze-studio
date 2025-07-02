import React from 'react';

const isMacOS = /(Macintosh|MacIntel|MacPPC|Mac68K|iPad)/.test(
  navigator.userAgent,
);

export const SHORTCUTS = {
  CTRL: isMacOS ? '⌘' : 'Ctrl',
  SHIFT: isMacOS ? '⇧' : '⇧',
  ALT: isMacOS ? '⌥' : 'Alt',
};

export interface ShortcutsProps {
  shortcuts?: string[][];
  label?: string;
}

export function Shortcuts({ shortcuts = [], label = '' }: ShortcutsProps = {}) {
  return (
    <div
      className="container"
      style={{
        display: 'inline-flex',
        marginLeft: 4,
        gap: 4,
        cursor: 'default',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div>{label}</div>
      {shortcuts.map((shortcutList, index) => (
        <>
          {index > 0 && <div>/</div>}
          {shortcutList.map(shortcut => (
            <div
              key={shortcut}
              className="tag"
              style={{
                display: 'inline-block',
                backgroundColor: '#6B6B75',
                padding: '0 8px',
                height: 20,
                lineHeight: '20px',
                borderRadius: 4,
              }}
            >
              {shortcut}
            </div>
          ))}
        </>
      ))}
    </div>
  );
}
