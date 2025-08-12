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
const suggestionItemVariants = cva(
  [
    'w-fit',
    'border-[1px]',
    'border-solid',
    'rounded-normal',
    'coz-fg-primary',
    'py-6px',
    'px-16px',
    'flex',
    'items-center',
    'justify-center',
    'mb-8px',
    'max-w-full',
    'text-[14px]',
    'font-normal',
    'leading-[20px]',
    'break-words',
  ],
  {
    variants: {
      showBackground: {
        true: ['coz-bg-image-question', 'coz-stroke-image-bots'],
        false: ['coz-stroke-plus'],
      },
      color: {
        white: [],
        grey: [],
      },
      readonly: {
        true: ['cursor-default'],
        false: ['cursor-pointer'],
      },
    },
    compoundVariants: [
      {
        showBackground: false,
        color: 'white',
        className: [],
      },
      {
        showBackground: false,
        color: 'grey',
        className: ['bg-[var(--coz-mg-secondary)]'],
      },
      {
        readonly: false,
        showBackground: false,
        className: [
          'hover:bg-[var(--coz-mg-secondary-hovered)]',
          'active:bg-[var(--coz-mg-secondary-pressed)]',
        ],
      },
      {
        readonly: false,
        showBackground: true,
        className: ['chat-uikit-suggestion-item-background-mg'],
      },
    ],
  },
);

type SuggestionItemVariantsProps = VariantProps<typeof suggestionItemVariants>;

export const typeSafeSuggestionItemVariants: (
  props: Required<SuggestionItemVariantsProps>,
) => string = suggestionItemVariants;
