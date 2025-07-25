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
 
// TODO 为了联调先封装一个业务组件，后面再抽象成通用的request select
import React, { type FC, useEffect, useMemo, useState } from 'react';

import { GenerationDiversity, RESPONSE_FORMAT_NAME } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { type OptionProps } from '@coze-arch/bot-semi/Select';
import { Radio, RadioGroup, Select } from '@coze-arch/bot-semi';
import { IconDownArrow } from '@coze-arch/bot-icons';
import {
  type Model,
  type ModelParamClass,
} from '@coze-arch/bot-api/developer_api';

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

  // Customize 要记住用户最后的操作，模式切换回来时用作默认值
  const _defaultValue = {
    ...defaultValue,
    [GenerationDiversity.Customize]:
      cacheData[id] ?? defaultValue?.[GenerationDiversity.Customize],
  };

  // 要记住展开状态，workflow 级共享
  useEffect(() => {
    cacheData.expand = settingExpand;
  }, [settingExpand]);

  const { doms, generationDiversityGroupTitle } = useMemo(() => {
    // 特化一：把 response format 过滤掉，在 output 节点中展示
    const modelParams =
      model?.model_params?.filter(m => m.name !== RESPONSE_FORMAT_NAME) ?? [];

    // 先拿到分组
    let groups: ModelParamClass[] = [];
    modelParams.forEach(m => {
      if (
        m.param_class?.class_id &&
        !groups.map(d => d.class_id).includes(m.param_class.class_id)
      ) {
        groups.push(m.param_class);
      }
    });

    // 特化二：Generation Diversity title 样式是写死的 。跟后端的约定：Generation Diversity 的 class_id === 1
    const generationDiversityGroup = groups.find(d => d.class_id === 1);
    const _generationDiversityGroupTitle =
      generationDiversityGroup?.label || '';
    if (generationDiversityGroup) {
      // 如果有 Generation Diversity ，必须在最上面
      groups = [
        generationDiversityGroup,
        ...groups.filter(d => d.class_id !== generationDiversityGroup.class_id),
      ];
    }

    // 按分组顺序，逐个渲染 setter
    const _doms: React.ReactNode[] = [];
    const _setCacheData = (v: { [k: string]: unknown }) => {
      if (v.generationDiversity === GenerationDiversity.Customize) {
        cacheData[id] = v;
      }
    };
    groups.forEach((g, i) => {
      // 组与组直接插入分割线，第一组不需要
      if (i !== 0) {
        _doms.push(<Divider />);
      }
      // 如果收起 && 属于生成多样性这组，就不渲染
      if (!settingExpand && generationDiversityGroup?.class_id === g.class_id) {
        return;
      }

      // 生成多样性 title 内置了，不需要额外添加
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

        // api/bot/get_type_list 接口给的是 test_key，save 接口需要的是 testKey。前端不感知（response_format 除外）
        const key = getCamelNameName(name ?? '');
        const _value = getValueByType<string | number | undefined>(
          value?.[key],
          type,
        );

        // 如果有 options 属性，则用 Select
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
          // 否则，就当数字处理，用 Slider + NumberInput
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
      // 阻止画布框选
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

      {/* 根据后端返回数据动态渲染的 setter */}
      {doms}
    </div>
  );
};
