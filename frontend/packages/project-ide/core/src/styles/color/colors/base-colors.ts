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

import { type ColorDefinition } from '../../types';

// white
const baseWhite: ColorDefinition = {
  id: 'flowide.color.base.white',
  defaults: {
    dark: 'rgba(255, 255, 255)',
    light: 'rgba(255, 255, 255)',
  },
};

// background
const baseBg0: ColorDefinition = {
  id: 'flowide.color.base.bg.0',
  defaults: {
    dark: 'rgba(22, 22, 26, 1)',
    light: 'rgba(255, 255, 255)',
  },
};
const baseBg1: ColorDefinition = {
  id: 'flowide.color.base.bg.1',
  defaults: {
    dark: 'rgba(35, 36, 41, 1)',
    light: 'rgba(255, 255, 255)',
  },
};
const baseBg2: ColorDefinition = {
  id: 'flowide.color.base.bg.2',
  defaults: {
    dark: 'rgba(53, 54, 60, 1)',
    light: 'rgba(255, 255, 255)',
  },
};

// text
const baseText0: ColorDefinition = {
  id: 'flowide.color.base.text.0',
  defaults: {
    dark: 'rgba(249,249,249)',
    light: 'rgba(28,31,35)',
  },
};
const baseText1: ColorDefinition = {
  id: 'flowide.color.base.text.1',
  defaults: {
    dark: 'rgba(249,249,249, 0.8)',
    light: 'rgba(28,31,35, 0.8)',
  },
};
const baseText2: ColorDefinition = {
  id: 'flowide.color.base.text.2',
  defaults: {
    dark: 'rgba(249,249,249, 0.6)',
    light: 'rgba(28,31,35, 0.62)',
  },
};

// border color
const baseBorder: ColorDefinition = {
  id: 'flowide.color.base.border',
  defaults: {
    dark: 'rgba(255, 255, 255, 0.08)',
    light: 'rgba(28,31,35, 0.08)',
  },
};

// menu color
const menuBorder: ColorDefinition = {
  id: 'flowide.color.menu.border',
  defaults: {
    dark: '#454545',
    light: 'unset',
  },
};

// menu box shadow color
const menuBoxShadow: ColorDefinition = {
  id: 'flowide.color.menu.box.shadow',
  defaults: {
    dark: 'rgba(0, 0, 0, 0.36)',
    light: 'rgba(0, 0, 0, 0.16)',
  },
};

// fill color
const baseFill0: ColorDefinition = {
  id: 'flowide.color.base.fill.0',
  defaults: {
    dark: 'rgba(255,255,255, 0.12)',
    light: 'rgba(46,50,56, 0.05)',
  },
};
const baseFill1: ColorDefinition = {
  id: 'flowide.color.base.fill.1',
  defaults: {
    dark: 'rgba(255,255,255, 0.16)',
    light: 'rgba(46,50,56, 0.09)',
  },
};
const baseFill2: ColorDefinition = {
  id: 'flowide.color.base.fill.2',
  defaults: {
    dark: 'rgba(255,255,255, 0.2)',
    light: 'rgba(46,50,56, 0.05)',
  },
};

// primary
const basePrimary: ColorDefinition = {
  id: 'flowide.color.base.primary',
  defaults: {
    dark: 'rgb(84,169,255)',
    light: 'rgb(0,100,250)',
  },
};
const basePrimaryHover: ColorDefinition = {
  id: 'flowide.color.base.primary.hover',
  defaults: {
    dark: 'rgb(127,193,255)',
    light: 'rgb(0,98,214)',
  },
};

export {
  baseWhite,
  baseBg0,
  baseBg1,
  baseBg2,
  baseText0,
  baseText1,
  baseText2,
  baseBorder,
  menuBorder,
  menuBoxShadow,
  baseFill0,
  baseFill1,
  baseFill2,
  basePrimary,
  basePrimaryHover,
};
