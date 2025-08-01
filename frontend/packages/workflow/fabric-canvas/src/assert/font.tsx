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

import { getUploadCDNAsset } from '@coze-workflow/base-adapter';

import { fonts, fontSvg, fontFamilyFilter } from '../share';

const cdnPrefix = `${getUploadCDNAsset('')}/fonts`;

export const supportFonts = fonts.map(fontFamilyFilter);

export const getFontUrl = (name: string) => {
  if (supportFonts.includes(name)) {
    const fontFullName = fonts.find(d => fontFamilyFilter(d) === name);
    return `${cdnPrefix}/image-canvas-fonts/${fontFullName}`;
  }
};

const fontsFormat: {
  value: string;
  label: React.ReactNode;
  order: number;
  name: string;
  groupName: string;
  children?: {
    value: string;
    order: number;
    label: React.ReactNode;
    name: string;
    groupName: string;
  }[];
}[] = fontSvg.map(d => {
  const dArr = d.replace('.svg', '').split('-');
  const name = dArr[1];
  const group = dArr[2];

  return {
    // Original name
    value: dArr[1],
    label: (
      <img
        alt={name}
        className="h-[12px]"
        src={`${cdnPrefix}/image-canvas-fonts-preview-svg/${d}`}
      />
    ),
    // order
    order: Number(dArr[0]),
    // first-level grouping name
    name,
    // Which group does it belong to?
    groupName: group,
  };
});

const groups = fontsFormat.filter(d => !d.groupName);
groups.forEach(group => {
  const children = fontsFormat.filter(d => d.groupName === group.name);
  group.children = children;
});

export const fontTreeData = groups.sort((a, b) => a.order - b.order);
