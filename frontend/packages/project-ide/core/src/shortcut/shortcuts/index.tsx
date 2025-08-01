/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
