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

const fileCardVariants = cva(
  [
    'select-none',
    'relative',
    'overflow-hidden',
    'flex',
    'flex-row',
    'items-center',
    'box-border',
    'p-12px',
    'border-[1px]',
    'border-solid',
    'rounded-normal',
    'coz-mg-card',
    'w-full',
  ],
  {
    variants: {
      layout: {
        pc: ['min-w-[282px]', 'max-w-[320px]'],
        mobile: ['w-full'],
      },
      isError: {
        true: ['coz-stroke-hglt-red'],
        false: ['coz-stroke-primary'],
      },
      showBackground: {
        true: ['!coz-bg-image-bots', '!coz-stroke-image-bots'],
        false: [],
      },
    },
    compoundVariants: [
      {
        showBackground: true,
        isError: false,
        className: [],
      },
    ],
  },
);

const fileCardNameVariants = cva(['text-lg', 'font-normal', 'leading-[20px]'], {
  variants: {
    layout: {
      pc: ['w-[180px]'],
      mobile: ['w-full', 'max-w-[calc(100vw-170px)]'],
    },
    isCanceled: {
      true: ['coz-fg-dim'],
      false: ['coz-fg-primary'],
    },
  },
});

export const typeSafeFileCardVariants: (
  props: Required<VariantProps<typeof fileCardVariants>>,
) => string = fileCardVariants;

export const typeSafeFileCardNameVariants: (
  props: Required<VariantProps<typeof fileCardNameVariants>>,
) => string = fileCardNameVariants;
