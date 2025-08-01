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

export enum ScreenRange {
  SM = 'sm',
  MD = 'md',
  LG = 'lg',
  XL = 'xl',
  XL1_5 = 'xl1.5',
  XL2 = '2xl',
}

export const SCREENS_TOKENS = {
  [ScreenRange.SM]: '640px',
  [ScreenRange.MD]: '768px',
  [ScreenRange.LG]: '1200px',
  [ScreenRange.XL]: '1600px',
  [ScreenRange.XL1_5]: '1680px',
  [ScreenRange.XL2]: '1920px',
};

export const SCREENS_TOKENS_2 = {
  [ScreenRange.XL1_5]: '1680px',
};

export type ResponsiveTokenMap = Partial<Record<ScreenRange | 'basic', number>>;
