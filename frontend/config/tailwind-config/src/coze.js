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

// tailwindcss-plugin.js
const plugin = require('tailwindcss/plugin');

// theme colors
const lightModeVariables = require('./light');
const darkModeVariables = require('./dark');

// Helper functions for generating CSS variables
function generateCssVariables(variables, theme) {
  return Object.entries(variables).reduce((acc, [key, value]) => {
    acc[`--${key}`] = theme ? theme(value) : value;
    return acc;
  }, {});
}

// style semantics
function generateSemanticVariables(semantics, theme, property) {
  return Object.entries(semantics).map(([key, value]) => ({
    [`.${key}`]: {
      [property]: theme(value),
    },
  }));
}

const semanticForeground = {
  /* Theme */
  'coz-fg-hglt-plus': 'colors.foreground.5',
  'coz-fg-hglt-plus-dim': 'colors.foreground.5',
  'coz-fg-hglt': 'colors.brand.5',
  'coz-fg-hglt-dim': 'colors.brand.3',
  'coz-fg-plus': 'colors.foreground.4',
  'coz-fg': 'colors.foreground.3',
  'coz-fg-primary': 'colors.foreground.3',
  'coz-fg-secondary': 'colors.foreground.2',
  'coz-fg-dim': 'colors.foreground.1',
  'coz-fg-white': 'colors.foreground.7',
  'coz-fg-white-dim': 'colors.foreground.white',
  'coz-fg-hglt-ai': 'colors.purple.5',
  'coz-fg-hglt-ai-dim': 'colors.purple.3',
  /* Functional Color */
  'coz-fg-hglt-red': 'colors.red.5',
  'coz-fg-hglt-red-dim': 'colors.red.3',
  'coz-fg-hglt-yellow': 'colors.yellow.5',
  'coz-fg-hglt-yellow-dim': 'colors.yellow.3',
  'coz-fg-hglt-green': 'colors.green.5',
  'coz-fg-hglt-green-dim': 'colors.green.3',
  /* Chart, Tag Only */
  'coz-fg-color-orange': 'colors.yellow.5',
  'coz-fg-color-orange-dim': 'colors.yellow.3',
  'coz-fg-color-emerald': 'colors.green.5',
  'coz-fg-color-emerald-dim': 'colors.green.3',
  'coz-fg-color-cyan': 'colors.cyan.50',
  'coz-fg-color-cyan-dim': 'colors.cyan.30',
  'coz-fg-color-blue': 'colors.blue.50',
  'coz-fg-color-blue-dim': 'colors.blue.30',
  'coz-fg-color-purple': 'colors.purple.50',
  'coz-fg-color-purple-dim': 'colors.purple.30',
  'coz-fg-color-magenta': 'colors.magenta.50',
  'coz-fg-color-magenta-dim': 'colors.magenta.3',
  'coz-fg-color-yellow': 'colors.yellow.50',
  'coz-fg-color-yellow-dim': 'colors.yellow.30',
  /* Code Only */
  'coz-fg-hglt-orange': 'colors.orange.5',
  'coz-fg-hglt-orange-dim': 'colors.orange.3',
  'coz-fg-hglt-emerald': 'colors.emerald.5',
  'coz-fg-hglt-emerald-dim': 'colors.emerald.3',
  'coz-fg-hglt-cyan': 'colors.cyan.5',
  'coz-fg-hglt-cyan-dim': 'colors.cyan.3',
  'coz-fg-hglt-blue': 'colors.blue.5',
  'coz-fg-hglt-blue-dim': 'colors.blue.3',
  'coz-fg-hglt-purple': 'colors.purple.5',
  'coz-fg-hglt-purple-dim': 'colors.purple.3',
  'coz-fg-hglt-magenta': 'colors.magenta.5',
  'coz-fg-hglt-magenta-dim': 'colors.magenta.3',
  /* branding Only */
  'coz-fg-color-brand': 'colors.brand.50',
  'coz-fg-color-brand-dim': 'colors.brand.30',
  'coz-fg-color-alternative': 'colors.alternative.50',
  'coz-fg-color-alternative-dim': 'colors.alternative.30',
};

const semanticMiddleground = {
  /* Theme */
  'coz-mg-hglt-plus-pressed': 'colors.brand.7',
  'coz-mg-hglt-plus-hovered': 'colors.brand.6',
  'coz-mg-hglt-plus': 'colors.brand.5',
  'coz-mg-hglt-plus-dim': 'colors.brand.3',
  'coz-mg-hglt-secondary-pressed': 'colors.brand.2',
  'coz-mg-hglt-secondary-hovered': 'colors.brand.1',
  'coz-mg-hglt-secondary': 'colors.brand.0',
  'coz-mg-hglt-secondary-red': 'colors.red.0',
  'coz-mg-hglt-secondary-yellow': 'colors.yellow.0',
  'coz-mg-hglt-secondary-green': 'colors.green.0',
  'coz-mg-plus-pressed': 'colors.background.8',
  'coz-mg-plus-hovered': 'colors.background.7',
  'coz-mg-plus': 'colors.background.6',
  'coz-mg-hglt-pressed': 'colors.brand.3',
  'coz-mg-hglt-hovered': 'colors.brand.2',
  'coz-mg-hglt-plus-ai-pressed': 'colors.purple.7',
  'coz-mg-hglt-plus-ai-hovered': 'colors.purple.6',
  'coz-mg-hglt-plus-ai': 'colors.purple.5',
  'coz-mg-hglt-plus-ai-dim': 'colors.purple.3',
  'coz-mg-hglt': 'colors.brand.1',
  'coz-mg-hglt-ai-pressed': 'colors.purple.3',
  'coz-mg-hglt-ai-hovered': 'colors.purple.2',
  'coz-mg-hglt-ai': 'colors.purple.1',
  /* Functional Color */
  'coz-mg-hglt-plus-red-pressed': 'colors.red.7',
  'coz-mg-hglt-plus-red-hovered': 'colors.red.6',
  'coz-mg-hglt-plus-red': 'colors.red.5',
  'coz-mg-hglt-plus-red-dim': 'colors.red.3',
  'coz-mg-hglt-plus-yellow-pressed': 'colors.yellow.7',
  'coz-mg-hglt-plus-yellow-hovered': 'colors.yellow.6',
  'coz-mg-hglt-plus-yellow': 'colors.yellow.5',
  'coz-mg-hglt-plus-yellow-dim': 'colors.yellow.3',
  'coz-mg-hglt-plus-green-pressed': 'colors.green.7',
  'coz-mg-hglt-plus-green-hovered': 'colors.green.6',
  'coz-mg-hglt-plus-green': 'colors.green.5',
  'coz-mg-hglt-plus-green-dim': 'colors.green.3',
  'coz-mg-hglt-red-pressed': 'colors.red.3',
  'coz-mg-hglt-red-hovered': 'colors.red.2',
  'coz-mg-hglt-red': 'colors.red.1',
  'coz-mg-hglt-yellow-pressed': 'colors.yellow.3',
  'coz-mg-hglt-yellow-hovered': 'colors.yellow.2',
  'coz-mg-hglt-yellow': 'colors.yellow.1',
  'coz-mg-hglt-green-pressed': 'colors.green.3',
  'coz-mg-hglt-green-hovered': 'colors.green.2',
  'coz-mg-hglt-green': 'colors.green.1',
  /* Card, Tag, Avatar Only */
  'coz-mg-color-plus-orange': 'colors.yellow.5',
  'coz-mg-color-plus-emerald': 'colors.green.5',
  'coz-mg-color-plus-cyan': 'colors.cyan.50',
  'coz-mg-color-plus-blue': 'colors.blue.50',
  'coz-mg-color-plus-purple': 'colors.purple.50',
  'coz-mg-color-plus-magenta': 'colors.magenta.50',
  'coz-mg-color-plus-yellow': 'colors.yellow.50',
  'coz-mg-color-orange-pressed': 'colors.yellow.3',
  'coz-mg-color-orange-hovered': 'colors.yellow.2',
  'coz-mg-color-orange': 'colors.yellow.1',
  'coz-mg-color-emerald-pressed': 'colors.green.3',
  'coz-mg-color-emerald-hovered': 'colors.green.2',
  'coz-mg-color-emerald': 'colors.green.1',
  'coz-mg-color-cyan-pressed': 'colors.cyan.30',
  'coz-mg-color-cyan-hovered': 'colors.cyan.20',
  'coz-mg-color-cyan': 'colors.cyan.10',
  'coz-mg-color-blue-pressed': 'colors.blue.30',
  'coz-mg-color-blue-hovered': 'colors.blue.20',
  'coz-mg-color-blue': 'colors.blue.10',
  'coz-mg-color-purple-pressed': 'colors.purple.30',
  'coz-mg-color-purple-hovered': 'colors.purple.20',
  'coz-mg-color-purple': 'colors.purple.10',
  'coz-mg-color-magenta-pressed': 'colors.magenta.30',
  'coz-mg-color-magenta-hovered': 'colors.magenta.20',
  'coz-mg-color-magenta': 'colors.magenta.10',
  'coz-mg-primary-pressed': 'colors.background.7',
  'coz-mg-primary-hovered': 'colors.background.6',
  'coz-mg-primary': 'colors.background.5',
  'coz-mg-secondary-pressed': 'colors.background.6',
  'coz-mg-secondary-hovered': 'colors.background.5',
  'coz-mg-secondary': 'colors.background.4',
  'coz-mg': 'colors.background.4',
  'coz-mg-mask': 'colors.mask.5',
  'coz-mg-table-fixed-hovered': 'colors.background.0',
  'coz-mg-card-pressed': 'colors.background.3',
  'coz-mg-card-hovered': 'colors.background.3',
  'coz-mg-card': 'colors.background.3',
  /** brand */
  'coz-mg-color-plus-brand': 'colors.brand.50',
};

const semanticBackground = {
  'coz-bg-max': 'colors.background.3',
  'coz-bg-plus': 'colors.background.2',
  'coz-bg-primary': 'colors.background.1',
  'coz-bg': 'colors.background.1',
  'coz-bg-secondary': 'colors.background.0',
};

const semanticShadow = {
  'coz-shadow': 'boxShadow.normal',
  'coz-shadow-large': 'boxShadow.large',
  'coz-shadow-default': 'boxShadow.normal',
  'coz-shadow-small': 'boxShadow.small',
};

// Add button rounded definitions
const buttonRounded = {
  'coz-btn-rounded-large': 'btnBorderRadius.large',
  'coz-btn-rounded-normal': 'btnBorderRadius.normal',
  'coz-btn-rounded-small': 'btnBorderRadius.small',
  'coz-btn-rounded-mini': 'btnBorderRadius.mini',
};

const inputRounded = {
  'coz-input-rounded-large': 'inputBorderRadius.large',
  'coz-input-rounded-normal': 'inputBorderRadius.normal',
  'coz-input-rounded-small': 'inputBorderRadius.small',
};

const inputHeight = {
  'coz-input-height-large': 'inputHeight.large',
  'coz-input-height-normal': 'inputHeight.normal',
  'coz-input-height-small': 'inputHeight.small',
};

const semanticStroke = {
  'coz-stroke-hglt': 'colors.brand.5',
  'coz-stroke-plus': 'colors.stroke.6',
  'coz-stroke-primary': 'colors.stroke.5',
  'coz-stroke-hglt-red': 'colors.red.5',
  'coz-stroke-hglt-yellow': 'colors.yellow.5',
  'coz-stroke-hglt-green': 'colors.green.5',
  'coz-stroke-color-orange': 'colors.yellow.5',
  'coz-stroke-color-emerald': 'colors.green.5',
  'coz-stroke-color-cyan': 'colors.cyan.50',
  'coz-stroke-color-blue': 'colors.blue.50',
  'coz-stroke-color-purple': 'colors.purple.50',
  'coz-stroke-color-magenta': 'colors.magenta.50',
  'coz-stroke-color-yellow': 'colors.yellow.50',
  'coz-stroke-color-brand': 'colors.brand.50',
  'coz-stroke-opaque': 'colors.stroke.opaque',
  'coz-stroke-max': 'colors.stroke.max',
};

module.exports = plugin(function ({ addBase, addUtilities, theme }) {
  addBase({
    ':root': generateCssVariables(lightModeVariables),
    '.dark': generateCssVariables(darkModeVariables),
  });

  addBase({
    ':root': {
      ...generateCssVariables(semanticForeground, theme),
      ...generateCssVariables(semanticMiddleground, theme),
      ...generateCssVariables(semanticBackground, theme),
      ...generateCssVariables(semanticStroke, theme),
      ...generateCssVariables(semanticShadow, theme),
      ...generateCssVariables(buttonRounded, theme),
      ...generateCssVariables(inputRounded, theme),
      ...generateCssVariables(inputHeight, theme),
    },
  });

  addUtilities([
    ...generateSemanticVariables(semanticForeground, theme, 'color'),
    ...generateSemanticVariables(
      semanticMiddleground,
      theme,
      'background-color',
    ),
    ...generateSemanticVariables(semanticBackground, theme, 'background-color'),
    ...generateSemanticVariables(semanticStroke, theme, 'border-color'),
    ...generateSemanticVariables(semanticShadow, theme, 'box-shadow'),
    ...generateSemanticVariables(buttonRounded, theme, 'border-radius'),
    ...generateSemanticVariables(inputRounded, theme, 'border-radius'),
    ...generateSemanticVariables(inputHeight, theme, 'height'),
  ]);
});
