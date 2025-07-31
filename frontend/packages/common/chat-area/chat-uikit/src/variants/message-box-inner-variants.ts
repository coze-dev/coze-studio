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

const messageBoxInnerVariants = cva(
  [
    'coz-fg-primary',
    'w-fit',
    'max-w-full',
    'text-lg',
    'font-normal',
    'leading-[1.5]',
    'rounded-normal',
    'mb-4px',
    'overflow-hidden',
  ],
  {
    variants: {
      color: {
        primary: ['chat-uikit-message-box-bg-primary'],
        whiteness: ['bg-[var(--coz-mg-card)]'],
        grey: ['bg-[var(--coz-mg-primary)]'],
      },
      border: {
        highlight: ['coz-stroke-hglt', 'border-[1px]', 'border-solid'],
        primary: ['coz-stroke-primary', 'border-[1px]', 'border-solid'],
      },
      showBackground: {
        true: [],
      },
      tight: {
        true: ['p-0'],
        false: ['py-12px', 'px-16px'],
      },
    },
    compoundVariants: [
      {
        color: 'primary',
        showBackground: true,
        className: [
          '!coz-bg-image-user',
          '!coz-stroke-image-user',
          '!coz-fg-white',
        ],
      },
      {
        color: 'whiteness',
        showBackground: true,
        className: [
          '!coz-bg-image-bots',
          '!coz-stroke-image-bots',
          'border-[1px]',
          'border-solid',
        ],
      },
      {
        color: 'grey',
        showBackground: true,
        className: [
          '!coz-bg-image-bots',
          '!coz-stroke-image-bots',
          '!coz-fg-white',
        ],
      },
    ],
  },
);
export type MessageBoxInnerVariantProps = Required<
  VariantProps<typeof messageBoxInnerVariants>
>;
export const typeSafeMessageBoxInnerVariants: (
  props: MessageBoxInnerVariantProps,
) => string = messageBoxInnerVariants;
