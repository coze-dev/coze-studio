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

import { useEffect, type FC, useMemo } from 'react';

import { isNil, set } from 'lodash-es';
import { useWorkflowNode, useNodeTestId } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import type {
  OptionItem,
  RadioChangeEvent,
  RadioType,
} from '@coze-arch/bot-semi/Radio';
import type { SetterOrDecoratorContext } from '@flowgram-adapter/free-layout-editor';

import { Radio } from '../radio';
import { CheckboxWithLabel } from '../checkbox-with-label';

import styles from './index.module.less';

type RadioItem = OptionItem & {
  disabled?: boolean | ((context: SetterOrDecoratorContext) => boolean);
};

enum ParseStratgy {
  Fast = 'fast',
  Accurate = 'accurate',
}

interface ParserValue {
  parsingType?: ParseStratgy;
  imageExtraction?: boolean;
  tableExtraction?: boolean;
  imageOcr?: boolean;
}

interface RadioProps {
  value?: ParserValue;
  onChange?: (v: ParserValue) => void;
  readonly?: boolean;
  options: {
    mode: RadioType;
    options: RadioItem[];
    direction?: 'vertical' | 'horizontal';
    customClassName?: string;
  };
}

export const DatasetWriteParser: FC<RadioProps> = props => {
  const { value, onChange, readonly } = props;

  const { data } = useWorkflowNode();
  const { getNodeSetterId } = useNodeTestId();

  // Set default value
  useEffect(() => {
    if (
      isNil(value?.parsingType) &&
      isNil(value?.imageExtraction) &&
      isNil(value?.tableExtraction) &&
      isNil(value?.imageOcr)
    ) {
      // The search policy for new nodes defaults to Hybird
      onChange?.({
        parsingType: ParseStratgy.Fast,
      });
    }
  }, [value, onChange]);

  const isPresice = value?.parsingType === ParseStratgy.Accurate;
  const isCustomChunk =
    data.inputs?.datasetWriteParameters?.chunkStrategy?.chunkType === 'custom';

  // The first phase does not support "accurate analysis" + "custom segmentation" + "picture Chinese text"
  const isImageOcrDisable = useMemo(
    () => isPresice && isCustomChunk,
    [isPresice, isCustomChunk],
  );

  useEffect(() => {
    if (isImageOcrDisable) {
      onChange?.({
        ...value,
        imageOcr: false,
      });
    }
  }, [isImageOcrDisable]);

  return (
    <div className="mb-[12px] mt-[4px]">
      <Radio
        {...props}
        options={{
          ...props?.options,
          direction: 'vertical',
          customClassName: styles['parser-radio-group'],
        }}
        value={value?.parsingType}
        onChange={v => {
          const nextParsingType = (v as unknown as RadioChangeEvent)?.target
            ?.value as ParseStratgy;
          const nextValue = {
            parsingType: nextParsingType,
          };

          // Switch to "Precision Resolution" setting default
          if (nextParsingType === ParseStratgy.Accurate) {
            set(nextValue, 'imageExtraction', true);
            set(nextValue, 'tableExtraction', true);
            set(nextValue, 'imageOcr', true);
          }

          onChange?.(nextValue);
        }}
        readonly={readonly}
      />
      {value?.parsingType === ParseStratgy.Accurate ? (
        <div className="mt-[8px]">
          <CheckboxWithLabel
            label={I18n.t('kl_write_008')}
            checked={value?.imageExtraction}
            onChange={v =>
              onChange?.({
                ...value,
                imageExtraction: v as boolean,
              })
            }
            readonly={readonly}
            dataTestId={getNodeSetterId('dataset-write-imageExtraction')}
          />
          <CheckboxWithLabel
            label={I18n.t('kl_write_009')}
            checked={value?.imageOcr}
            onChange={v =>
              onChange?.({
                ...value,
                imageOcr: v as boolean,
              })
            }
            disabled={isImageOcrDisable}
            readonly={readonly}
            dataTestId={getNodeSetterId('dataset-write-imageOcr')}
          />
          <CheckboxWithLabel
            label={I18n.t('kl_write_010')}
            checked={value?.tableExtraction}
            onChange={v =>
              onChange?.({
                ...value,
                tableExtraction: v as boolean,
              })
            }
            readonly={readonly}
            dataTestId={getNodeSetterId('dataset-write-tableExtraction')}
          />
        </div>
      ) : null}
    </div>
  );
};
