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

import React, { useEffect, type FC } from 'react';

import { isNil, set } from 'lodash-es';
import classNames from 'classnames';
import type {
  FeedbackStatus,
  SetterOrDecoratorContext,
} from '@flowgram-adapter/free-layout-editor';
import { useNodeTestId } from '@coze-workflow/base';
import { SeperatorType } from '@coze-data/knowledge-resource-processor-base/types';
import { getSeperatorOptionList } from '@coze-data/knowledge-resource-processor-base/constants';
import { I18n } from '@coze-arch/i18n';
import type {
  OptionItem,
  RadioChangeEvent,
  RadioType,
} from '@coze-arch/bot-semi/Radio';
import { Select, Input } from '@coze-arch/coze-design';

import { Radio } from '../radio';
import { SliderArea, TitleArea } from '../dataset-setting/components';

import styles from './index.module.less';

type RadioItem = OptionItem & {
  disabled?: boolean | ((context: SetterOrDecoratorContext) => boolean);
};

enum ChunkStratgy {
  Default = 'default',
  Layer = 'layer',
  Custom = 'custom',
}

export interface ChunkValue {
  chunkType: ChunkStratgy;
  maxLevel?: number;
  saveTitle?: boolean;
  overlap?: number;
  maxToken?: number;
  separator?: string;
  separatorType?: SeperatorType;
}

interface RadioProps {
  value: ChunkValue;
  onChange: (v: ChunkValue) => void;
  readonly: boolean;
  feedbackStatus?: FeedbackStatus;
  feedbackText?: string;
  options: {
    mode: RadioType;
    options: RadioItem[];
    direction?: 'vertical' | 'horizontal';
    customClassName?: string;
  };
  customInputComp?: React.ReactNode;
}

const DEFAULT_MAX_LEVEL = 3;
const DEFAULT_MAX_TOKEN = 800;
const DEFAULT_OVERLAP = 0.1;

export const DatasetWriteChunk: FC<RadioProps> = props => {
  const {
    value,
    onChange,
    options,
    readonly,
    feedbackStatus,
    feedbackText,
    customInputComp,
  } = props;

  const { getNodeSetterId } = useNodeTestId();

  // Set default value
  useEffect(() => {
    if (
      isNil(value?.chunkType) &&
      isNil(value?.maxLevel) &&
      isNil(value?.saveTitle) &&
      isNil(value?.overlap) &&
      isNil(value?.maxToken) &&
      isNil(value?.separator)
    ) {
      onChange?.({
        chunkType: ChunkStratgy.Default,
      });
    }
  }, [value, onChange]);

  const seperatorOptionList = getSeperatorOptionList() ?? [];

  const isCustomChunk = value?.chunkType === ChunkStratgy.Custom;
  const isCustomSeparator = value?.separatorType === SeperatorType.CUSTOM;

  return (
    <div
      className={classNames('w-full mt-[4px]', {
        [options?.customClassName as string]: options?.customClassName,
      })}
    >
      <Radio
        {...props}
        options={{
          ...props?.options,
          direction: 'vertical',
          customClassName: classNames(
            styles['parser-radio-group'],
            isCustomChunk ? 'mb-[4px]' : 'mb-[24px]',
          ),
        }}
        value={value?.chunkType}
        onChange={v => {
          const nextChunkType = (v as unknown as RadioChangeEvent)?.target
            ?.value as ChunkStratgy;
          const nextValue = {
            chunkType: nextChunkType,
          };
          if (nextChunkType === ChunkStratgy.Layer) {
            set(nextValue, 'maxLevel', DEFAULT_MAX_LEVEL);
          } else if (nextChunkType === ChunkStratgy.Custom) {
            set(nextValue, 'separatorType', SeperatorType.LINE_BREAK);
            set(nextValue, 'separator', SeperatorType.LINE_BREAK);
            set(nextValue, 'maxToken', DEFAULT_MAX_TOKEN);
            set(nextValue, 'overlap', DEFAULT_OVERLAP);
          }
          onChange(nextValue);
        }}
      />
      {/* Issue 1 does not show */}
      {/* {value?.chunkType === ChunkStratgy.Layer && (
        <div>
          <div className={styles['setting-item']}>
            <TitleArea
              Title = {'Segment Hierarchy'}
              tip={
                'The maximum hierarchical range of the segmented tree structure, e.g. 3 layers will identify the document title, primary title, and secondary title structure information'
              }
              titleClassName="text-[#060709CC] text-[12px]"
            />
            <InputNumber
              className="w-[360px]"
              size="small"
              value={value?.maxLevel}
              onChange={v =>
                onChange({
                  ...value,
                  maxLevel: v as number,
                })
              }
            />
          </div>
          <CheckboxWithLabel
            Label = "Retrieve slice retention level information"
            Tooltip = "Whether to keep the level header information in the slice, it is easier to return all the slice content under that level when retrieving the title after retention"
            checked={value?.saveTitle}
            onChange={v =>
              onChange({
                ...value,
                saveTitle: v as boolean,
              })
            }
            className="text-[#060709CC]"
          />
        </div>
      )} */}
      {isCustomChunk ? (
        <div>
          <div
            className={styles['setting-item']}
            style={{
              marginBottom: isCustomSeparator ? '8px' : '16px',
            }}
          >
            <div
              style={{
                flex: 2,
              }}
            >
              <TitleArea
                title={I18n.t('datasets_Custom_segmentID')}
                tip={I18n.t('kl_write_030')}
                titleClassName="text-[#060709CC] text-[12px]"
              />
            </div>

            <div
              style={{
                flex: 3,
              }}
            >
              <Select
                size="small"
                placeholder={I18n.t('datasets_custom_segmentID_placeholder')}
                className={styles['separator-select']}
                style={{
                  width: '100%',
                  height: '24px',
                  borderColor: '#06070926',
                  borderRadius: '6px',
                }}
                value={value?.separatorType}
                onChange={v =>
                  onChange({
                    ...value,
                    separator:
                      v === SeperatorType.CUSTOM ? '###' : (v as SeperatorType),
                    separatorType: v as SeperatorType,
                  })
                }
                data-testid={getNodeSetterId('dataset-write-separator-select')}
              >
                {seperatorOptionList?.map(item => (
                  <Select.Option
                    key={item.value}
                    value={item.value}
                    data-testid={getNodeSetterId(
                      'dataset-write-separator-option',
                    )}
                  >
                    {item.label}
                  </Select.Option>
                ))}
              </Select>
            </div>
          </div>
          {isCustomSeparator ? (
            <div
              className={classNames(
                `w-full flex items-end 'flex-row' ${styles['custom-input']}`,
              )}
            >
              <div
                style={{
                  flex: 2,
                }}
              >
                <div className="w-[20px] h-[28px]" />
              </div>
              <div
                style={{
                  flex: 3,
                }}
              >
                {customInputComp ? (
                  customInputComp
                ) : (
                  <>
                    <Input
                      style={{
                        fontSize: '12px',
                        width: '100%',
                      }}
                      value={value?.separator}
                      onChange={v =>
                        onChange({
                          ...value,
                          separator: v as string,
                        })
                      }
                      placeholder={I18n.t(
                        'datasets_custom_segmentID_placeholder',
                      )}
                      data-testid={getNodeSetterId(
                        'dataset-write-separator-input',
                      )}
                    />
                    {feedbackStatus === 'error' && (
                      <div className="text-[12px] leading-[16px] text-[#ff441e]">
                        {feedbackText}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ) : null}

          <div className={styles['setting-item']}>
            <div
              style={{
                flex: 2,
              }}
            >
              <TitleArea
                title={I18n.t('datasets_Custom_maxLength')}
                tip={I18n.t('kl_write_031')}
                titleClassName="text-[#060709CC] text-[12px]"
              />
            </div>
            <div
              className="relative pt-[14px]"
              style={{
                flex: 3,
              }}
            >
              <SliderArea
                min={100}
                max={5000}
                step={1}
                customStyles={{
                  sliderAreaStyle: {
                    width: '100%',
                  },
                  boundaryStyle: {
                    width: '100%',
                    margin: 0,
                  },
                }}
                isDataSet
                value={value?.maxToken as number}
                marks={{
                  markKey: DEFAULT_MAX_TOKEN,
                  // Set margin-left to avoid overlap with number 1
                  markText: <span className="ml-9">Default</span>,
                }}
                disabled={readonly}
                onChange={v => {
                  onChange({
                    ...value,
                    maxToken: v as number,
                  });
                }}
                onClickDefault={() => {
                  onChange({
                    ...value,
                    maxToken: DEFAULT_MAX_TOKEN,
                  });
                }}
              />
            </div>
          </div>
          <div className={styles['setting-item']}>
            <div
              style={{
                flex: 2,
              }}
            >
              <TitleArea
                title={I18n.t('kl_write_014')}
                tip={I18n.t('kl_write_015')}
                titleClassName="text-[#060709CC] text-[12px]"
              />
            </div>
            <div
              className="relative pt-[14px]"
              style={{
                flex: 3,
              }}
            >
              <SliderArea
                min={0}
                max={0.9}
                step={0.01}
                customStyles={{
                  sliderAreaStyle: {
                    width: '100%',
                  },
                  boundaryStyle: {
                    width: '100%',
                    margin: 0,
                  },
                }}
                isDataSet
                value={value?.overlap as number}
                marks={{
                  markKey: DEFAULT_OVERLAP,
                  // Set margin-left to avoid overlap with number 1
                  markText: <span className="ml-8">Default</span>,
                }}
                disabled={readonly}
                onChange={v => {
                  onChange({
                    ...value,
                    overlap: v as number,
                  });
                }}
                onClickDefault={() => {
                  onChange({
                    ...value,
                    overlap: DEFAULT_OVERLAP,
                  });
                }}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export const DatasetWriteChunkSetter = {
  key: 'DatasetWriteChunk',
  component: DatasetWriteChunk,
};
