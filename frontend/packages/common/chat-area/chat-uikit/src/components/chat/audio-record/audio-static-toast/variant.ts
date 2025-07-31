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

const audioStaticToastVariants = cva(['px-24px', 'py-10px', 'rounded-[99px]'], {
  variants: {
    theme: {
      primary: ['bg-[#F2F3F7]'],
      danger: ['bg-[#FFEFF1]'],
      background: ['coz-bg-image-bots'],
    },
    color: {
      primary: ['coz-fg-primary'],
      danger: ['coz-fg-hglt-red'],
    },
  },
});

export type AudioStaticToastVariantsProps = Required<
  VariantProps<typeof audioStaticToastVariants>
>;
export const typeSafeAudioStaticToastVariants: (
  props: AudioStaticToastVariantsProps,
) => string = audioStaticToastVariants;
