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

export const messageBoxContainerVariants = cva(['flex', 'flex-row', 'my-0'], {
  variants: {
    isMobileLayout: {
      true: ['mx-[12px]'],
      false: ['mx-[24px]'],
    },
  },
});

export const botNicknameVariants = cva(
  [
    'text-base',
    'font-normal',
    'leading-[16px]',
    'break-words',
    'flex-shrink-0',
    '!max-w-[400px]',
  ],
  {
    variants: {
      showBackground: {
        true: ['coz-fg-images-user-name'],
        false: ['coz-fg-secondary'],
      },
    },
  },
);
export type BotNicknameVariantsProps = Required<
  VariantProps<typeof botNicknameVariants>
>;
export const typeSafeBotNicknameVariants: (
  props: BotNicknameVariantsProps,
) => string = botNicknameVariants;
