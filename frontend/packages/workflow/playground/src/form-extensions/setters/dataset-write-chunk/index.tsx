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
