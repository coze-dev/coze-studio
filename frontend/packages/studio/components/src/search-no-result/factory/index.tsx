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

import React, { type JSX } from 'react';

import { type Theme } from '@coze-arch/coze-design';
export interface COZTheme {
  theme: Theme;
}
interface Props extends COZTheme {
  className?: string;
  components: {
    dark: JSX.Element;
    light: JSX.Element;
  };
}
export function ThemeFactory({ theme, components, className }: Props) {
  const ComponentRender =
    theme === 'light' ? components.light : components.dark;
  return <div className={className}>{ComponentRender}</div>;
}
