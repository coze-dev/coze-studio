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

// TODO first encapsulates a business component for joint debugging, and then abstracts it into a general request select.
import React, { useEffect, useMemo, useState, type FC } from 'react';

import { GenerationDiversity, RESPONSE_FORMAT_NAME } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { type OptionProps } from '@coze-arch/bot-semi/Select';
import { IconDownArrow } from '@coze-arch/bot-icons';
import {
  type ModelParamClass,
  type Model,
} from '@coze-arch/bot-api/developer_api';
import { Select, Radio, RadioGroup } from '@coze-arch/coze-design';

import { cacheData, getCamelNameName, getValueByType } from '../utils';
import styles from '../index.module.less';
import { Divider, SettingLayout, SettingSlider } from './settings';

interface ModelSettingProps {
  id: string;
  value?: { [k: string]: unknown };
  defaultValue?: Record<GenerationDiversity, object>;
  model?: Model;
  onChange: (v: ModelSettingProps['value']) => void;
  readonly: boolean;
}

export const ModelSetting: FC<ModelSettingProps> = ({
  value,
  onChange,
  model,
  defaultValue,
  readonly,
  id,
}) => {
  const [settingExpand, setSettingExpand] = useState(
    cacheData.expand === undefined &&
      value?.generationDiversity === GenerationDiversity.Customize &&
      !readonly
      ? true
      : cacheData.expand,
  );
  // Customize to remember the last action of the user, and use as the default when the mode switches back
  const _defaultValue = {
    ...defaultValue,
    [GenerationDiversity.Customize]:
      cacheData[id] ?? defaultValue?.[GenerationDiversity.Customize],
  };

  // To remember the expanded state, workflow level sharing
  useEffect(() => {
    cacheData.expand = settingExpand;
  }, [settingExpand]);

  const { doms, generationDiversityGroupTitle } = useMemo(() => {
    // Specialization 1: Filter out the response format and display it in the output node
    const modelParams =
      model?.model_params?.filter(m => m.name !== RESPONSE_FORMAT_NAME) ?? [];

    // Get the group first
    let groups: ModelParamClass[] = [];
    modelParams.forEach(m => {
      if (
        m.param_class?.class_id &&
        !groups.map(d => d.class_id).includes(m.param_class.class_id)
      ) {
        groups.push(m.param_class);
      }
    });

    // Specialization 2: Generation Diversity title The style is written dead. Convention with the backend: Generation Diversity class_id === 1
    const generationDiversityGroup = groups.find(d => d.class_id === 1);
    const _generationDiversityGroupTitle =
      generationDiversityGroup?.label || '';
    if (generationDiversityGroup) {
      // If there is Generation Diversity, it must be at the top
      groups = [
        generationDiversityGroup,
        ...groups.filter(d => d.class_id !== generationDiversityGroup.class_id),
      ];
    }

    // Render setters one by one in grouping order
    const _doms: React.ReactNode[] = [];
    const _setCacheData = (v: { [k: string]: unknown }) => {
      if (v.generationDiversity === GenerationDiversity.Customize) {
        cacheData[id] = v;
      }
    };
    groups.forEach((g, i) => {
      // Groups are inserted directly into the dividing line, the first group is not required
      if (i !== 0) {
        _doms.push(<Divider />);
      }
      // If the hide & & belongs to the group Generative Diversity, it will not be rendered
      if (!settingExpand && generationDiversityGroup?.class_id === g.class_id) {
        return;
      }

      // Generate diversity title built-in, no need to add additional
      if (generationDiversityGroup?.class_id !== g.class_id) {
        _doms.push(<SettingLayout title={g.label ?? ''} bolder />);
      }
      const items = modelParams?.filter(
        m => m.param_class?.class_id === g.class_id,
      );
      items?.forEach(item => {
        const {
          label = '',
          name,
          desc,
          min,
          max,
          options,
          precision,
          type,
        } = item;

        // The API/bot/get_type_list interface gives test_key, and the save interface requires testKey. The front end is not aware (except response_format)
        const key = getCamelNameName(name ?? '');
        const _value = getValueByType<string | number | undefined>(
          value?.[key],
          type,
        );

        // If there is an options attribute, use Select
        if (options?.length) {
          const _optionsList = options.map(option => ({
            ...option,
            label: option.label || option.value,
            value: getValueByType(option.value, type),
          }));

          _doms.push(
            <SettingLayout
              title={label}
              description={desc}
              center={
                <Select
                  disabled={readonly}
                  className="w-full"
                  value={_value}
                  onChange={v => {
                    const _v = {
                      ...value,
                      [key]: v,
                    };
                    onChange(_v);
                    _setCacheData(_v);
                  }}
                  optionList={_optionsList as OptionProps[]}
                />
              }
            />,
          );
          // Otherwise, treat it as number processing, using Slider + NumberInput
        } else {
          _doms.push(
            <SettingSlider
              readonly={readonly}
              title={label}
              description={desc}
              // defaultValue={getValueByType<number | undefined>(
              //   _defaultValue?.[value?.generationDiversity as string]?.[key],
              //   type,
              // )}
              value={_value as number | undefined}
              min={getValueByType<number | undefined>(min, type)}
              max={getValueByType<number | undefined>(max, type)}
              precision={getValueByType<number | undefined>(precision, type)}
              onChange={v => {
                const _v = {
                  ...value,
                  [key]: v,
                  generationDiversity: GenerationDiversity.Customize,
                };

                onChange(_v);
                _setCacheData(_v);
              }}
            />,
          );
        }
      });
    });

    return {
      doms: _doms,
      generationDiversityGroupTitle: _generationDiversityGroupTitle,
    };
  }, [settingExpand, value, model, readonly]);

  return (
    <div
      className={'p-[24px] flex flex-col gap-[16px]'}
      // onDragStart={e => {
      //   e.stopPropagation();
      //   e.preventDefault();
      // }}
      // Block canvas framing
      onMouseDown={e => {
        e.stopPropagation();
      }}
    >
      <div className="flex items-center">
        <div className="flex-1 text-[18px] font-semibold">
          {I18n.t('workflow_detail_llm_model')}
        </div>
      </div>

      <Divider />

      <SettingLayout
        title={generationDiversityGroupTitle}
        description={I18n.t('model_config_generate_explain')}
        bolder
        leftClassName="!w-[165px]"
        center={
          <div className="w-full pr-[8px]">
            <RadioGroup
              type="button"
              disabled={readonly}
              value={value?.generationDiversity as GenerationDiversity}
              className={`${styles.radioGroup} w-full !flex`}
              onChange={e => {
                onChange({
                  ...value,
                  ..._defaultValue?.[e.target?.value],
                  generationDiversity: e.target?.value,
                });

                if (e.target?.value === GenerationDiversity.Customize) {
                  setSettingExpand(true);
                }
              }}
            >
              {[
                {
                  value: GenerationDiversity.Precise,
                  label: I18n.t('model_config_generate_precise'),
                },
                {
                  value: GenerationDiversity.Balance,
                  label: I18n.t('model_config_generate_balance'),
                },
                {
                  value: GenerationDiversity.Creative,
                  label: I18n.t('model_config_generate_creative'),
                },
                {
                  value: GenerationDiversity.Customize,
                  label: I18n.t('model_config_generate_customize'),
                },
              ].map(d => (
                <Radio key={d.value} value={d.value}>
                  {d.label}
                </Radio>
              ))}
            </RadioGroup>
          </div>
        }
        right={
          <div
            className="cursor-pointe h-full flex items-center gap-[4px]"
            onClick={e => {
              e.stopPropagation();
              setSettingExpand(!settingExpand);
            }}
          >
            <span>{I18n.t('model_config_generate_advance')}</span>
            {settingExpand ? (
              <IconDownArrow />
            ) : (
              <IconDownArrow className="rotate-180" />
            )}
          </div>
        }
      />

      {/* A setter dynamically rendered according to the backend */}
      {doms}
    </div>
  );
};
