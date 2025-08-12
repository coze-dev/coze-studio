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

import type {
  SetterComponentProps,
  SetterOrDecoratorContext,
} from '@flowgram-adapter/free-layout-editor';
import type { SeperatorType } from '@coze-data/knowledge-resource-processor-base/types';
import type { OptionItem, RadioType } from '@coze-arch/bot-semi/Radio';

import { DatasetWriteChunk as BaseDatasetWriteChunk } from '@/form-extensions/components/dataset-write-chunk';

type RadioItem = OptionItem & {
  disabled?: boolean | ((context: SetterOrDecoratorContext) => boolean);
};

enum ChunkStratgy {
  Default = 'default',
  Layer = 'layer',
  Custom = 'custom',
}

type RadioProps = SetterComponentProps<
  {
    chunkType: ChunkStratgy;
    maxLevel?: number;
    saveTitle?: boolean;
    overlap?: number;
    maxToken?: number;
    separator?: string;
    separatorType?: SeperatorType;
  },
  {
    mode: RadioType;
    options: RadioItem[];
    direction?: 'vertical' | 'horizontal';
    customClassName?: string;
  }
>;

export const DatasetWriteChunk: FC<RadioProps> = props => (
  <BaseDatasetWriteChunk {...props} />
);

export const DatasetWriteChunkSetter = {
  key: 'DatasetWriteChunk',
  component: DatasetWriteChunk,
};
