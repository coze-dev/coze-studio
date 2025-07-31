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

import React, { type FC } from 'react';

import type { OptionItem, RadioType } from '@coze-arch/bot-semi/Radio';
import type {
  SetterComponentProps,
  SetterOrDecoratorContext,
} from '@flowgram-adapter/free-layout-editor';

import { DatasetWriteParser as BaseDatasetWriteParser } from '@/form-extensions/components/dataset-write-parser';

type RadioItem = OptionItem & {
  disabled?: boolean | ((context: SetterOrDecoratorContext) => boolean);
};

enum ParseStratgy {
  Fast = 'fast',
  Accurate = 'accurate',
}
type RadioProps = SetterComponentProps<
  {
    parsingType?: ParseStratgy;
    imageExtraction?: boolean;
    tableExtraction?: boolean;
    imageOcr?: boolean;
  },
  {
    mode: RadioType;
    options: RadioItem[];
    direction?: 'vertical' | 'horizontal';
    customClassName?: string;
  }
>;

export const DatasetWriteParser: FC<RadioProps> = props => (
  <BaseDatasetWriteParser {...props} />
);

export const DatasetWriteParseSetter = {
  key: 'DatasetWriteParser',
  component: DatasetWriteParser,
};
