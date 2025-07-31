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

import { cva, type VariantProps } from 'class-variance-authority';

const shortcutCommandVariants = cva(
  [
    'mr-8px',
    'rounded-[99px]',
    'border-[1px]',
    'border-solid',
    'overflow-hidden',
  ],
  {
    variants: {
      color: {
        grey: [
          'coz-stroke-primary',
          'coz-mg-secondary',
          'backdrop-blur-[3.45px]',
        ],
        white: ['coz-stroke-primary', 'coz-bg-max', 'backdrop-blur-[3.45px]'],
        blur: [
          'coz-stroke-image-bots',
          'coz-bg-image-bots',
          'backdrop-blur-[20px]',
        ],
      },
    },
  },
);

const shortcutCommandTextVariants = cva(['text-lg', 'font-medium'], {
  variants: {
    color: {
      grey: ['coz-fg-primary'],
      white: ['coz-fg-primary'],
      blur: ['coz-fg-images-bots'],
    },
  },
});

export const typeSafeShortcutCommandVariants: (
  props: Required<VariantProps<typeof shortcutCommandVariants>>,
) => string = shortcutCommandVariants;

export const typeSafeShortcutCommandTextVariants: (
  props: Required<VariantProps<typeof shortcutCommandTextVariants>>,
) => string = shortcutCommandTextVariants;
