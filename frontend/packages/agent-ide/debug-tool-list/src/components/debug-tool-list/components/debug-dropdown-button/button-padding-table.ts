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

import { type CSSProperties } from 'react';

interface Entry {
  withTitle: boolean;
  withDropdown: boolean;
  left: number;
  right: number;
}

const buttonPaddingTable: Entry[] = [
  {
    withDropdown: true,
    withTitle: true,
    left: 15,
    right: 9,
  },
  {
    withDropdown: true,
    withTitle: false,
    left: 8,
    right: 6,
  },
  {
    withDropdown: false,
    withTitle: true,
    left: 15,
    right: 15,
  },
  {
    withDropdown: false,
    withTitle: false,
    left: 8,
    right: 8,
  },
];

type IndexProperty = Pick<Entry, 'withTitle' | 'withDropdown'>;

const getIndexByEntry = (entry: IndexProperty) =>
  `${entry.withDropdown}-${entry.withTitle}`;

const getStyleByEntry = (entry: Entry): CSSProperties => ({
  paddingLeft: entry.left,
  paddingRight: entry.right,
});

const initial: Record<string, CSSProperties> = {};
const indexTable = buttonPaddingTable.reduce((all, entry) => {
  all[getIndexByEntry(entry)] = getStyleByEntry(entry);
  return all;
}, initial);

export const getButtonPaddingStyle = (param: {
  withDropdown: boolean;
  withTitle: boolean;
}) => {
  const index = getIndexByEntry(param);
  return indexTable[index];
};
