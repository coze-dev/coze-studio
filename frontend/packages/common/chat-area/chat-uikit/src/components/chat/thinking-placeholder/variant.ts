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

const thinkingPlaceholderVariants = cva(
  [
    'h-[44px]',
    'w-fit',
    'flex',
    'justify-center',
    'items-center',
    'py-12px',
    'px-16px',
    'rounded-normal',
  ],
  {
    variants: {
      backgroundColor: {
        whiteness: ['bg-[var(--coz-mg-card)]'],
        grey: ['bg-[var(--coz-mg-primary)]'],
        primary: ['bg-[var(coz-mg-hglt-plus)]'],
        withBackground: ['coz-bg-image-bots', 'coz-stroke-image-bots'],
        none: ['coz-stroke-primary'],
      },
    },
  },
);

export type ThinkingPlaceholderVariantProps = Required<
  VariantProps<typeof thinkingPlaceholderVariants>
>;
export const typeSafeThinkingPlaceholderVariants: (
  props: ThinkingPlaceholderVariantProps,
) => string = thinkingPlaceholderVariants;
