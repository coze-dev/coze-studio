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
