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

// Common tailwind configurations and tool functions for consumers and producers

export function designTokenToTailwindConfig(
  tokenJson: Record<string, unknown>,
) {
  const res = {
    colors: {},
    spacing: {},
    borderRadius: {},
  };
  const palette = tokenJson.palette ?? {};
  const tokens = tokenJson.tokens ?? {};
  for (const [k, v] of Object.entries(tokens)) {
    switch (k) {
      case 'color': {
        res.colors = colorTransformer(
          v,
          genColorValueFormatter(
            palette as Record<string, Record<string, string>>,
          ),
        );
        break;
      }
      case 'spacing': {
        res.spacing = spacingTransformer(v);
        break;
      }
      case 'border-radius': {
        res.borderRadius = borderRadiusTransformer(v);
        break;
      }
      default: {
        break;
      }
    }
  }
  return res;
}

function colorTransformer(
  colorObj: Record<string, Record<string, string>>,
  valueFormatter: (theme: string, colorValue: string) => string,
) {
  const res = {};
  for (const theme of Object.keys(colorObj)) {
    const valueObj = colorObj[theme];
    for (const [colorKey, colorValue] of Object.entries(valueObj)) {
      const newColorKey = `${colorKey.split('-color-')?.[1] ?? ''}-${theme}`;
      res[newColorKey] = valueFormatter(theme, colorValue);
    }
  }
  return res;
}

function genColorValueFormatter(
  palette: Record<string, Record<string, string>>,
) {
  return (theme: string, colorValue: string) => {
    const re = /var\((.+?)\)/;
    const match = colorValue.match(re);
    const whole = match?.[0] ?? '';
    if (!whole) {
      return colorValue;
    }
    const key = match?.[1] ?? '';
    const valueObj = palette[theme];
    const v = valueObj[key];
    return colorValue.replace(whole, v);
  };
}

function spacingTransformer(spacingObj: Record<string, string>) {
  const res = {};
  for (const [k, v] of Object.entries(spacingObj)) {
    const newKey = `${k.replace('$spacing-', '')}`;
    res[newKey] = v;
  }
  return res;
}

function borderRadiusTransformer(borderRadiusObj: Record<string, string>) {
  const res = {};
  for (const [k, v] of Object.entries(borderRadiusObj)) {
    const newKey = `${k.replace('--semi-border-radius-', '')}`;
    res[newKey] = v;
  }
  return res;
}

// Get other packages and splice /src /**/*.{ ts, tsx}

export { getTailwindContents } from './tailwind-contents';
