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
 
import { useEffect, useRef, useState } from 'react';

import { nanoid } from 'nanoid';
import { isObject, merge, pick } from 'lodash-es';
import { useCreation, useDebounceFn } from 'ahooks';
import {
  type ModelInfo,
  ModelStyle,
  type ModelParameter,
} from '@coze-arch/bot-api/developer_api';
import {
  getModelById,
  type ModelAction,
  type ModelState,
} from '@coze-agent-ide/bot-editor-context-store';

import { useGetSchema } from '../model/use-get-schema';
import { getFixedModelFormValues } from '../../utils/model/get-fixed-model-form-values';
import { getDiversityPresetValueByStyle } from '../../utils/model/get-diversity-preset-value-by-style';
import { convertModelInfoToFlatObject } from '../../utils/model/convert-model-info-to-flat-object';
import { convertFormValueToModelInfo } from '../../utils/model/convert-form-value-to-model-info';
import { fieldInitStrategies } from '../../utils/field-init-strategy';
import { primitiveExhaustiveCheck } from '../../utils/exhaustive-check';
import { useModelForm } from '../../context/model-form-context';
import { type ModelFormProps } from '../../components/model-form';

const specialFieldKeyList = [
  // 这个字段是个嵌套结构 需要专门转换
  'HistoryRound',
  // 这个字段需要带到表单中进行变化 表单中有组件会监听这个数据 但是他不属于 model_parameter
  'model_style',
];

export interface UseHandleModelFormProps {
  currentModelId: string;
  onValuesChange: (props: { values: ModelInfo }) => void;
  getModelRecord: () => ModelInfo;
  editable: boolean;
  /**
   * 原本在 hook 内部调用 useBotEditor 获取 modelStore，这期暂且粗暴地挪出去
   * @todo 理想形态是彻底与 store 解耦，传入 get_type_list 接口返回值即可，或提供一个将接口返回值转换成所需结构的方法
   */
  modelStore: Pick<
    ModelState & ModelAction,
    'onlineModelList' | 'offlineModelMap' | 'getModelPreset'
  >;
}

/**
 * 此处数据的流转没有做成由顶层模型设置数据完全控制表单数据，有以下几个原因:
 * 1. 需求临时变动，需要按照模型唯独记录用户设置
 * 2. 顶层数据源的设计是单例的，只能存最近模型的一份数据
 *
 * 最终设计是，由中间的表单层记录数据，通过表单的 onChange 来更新顶层数据源
 * 所以表单数据和顶层数据源不一定是一致的
 *
 * 每次切换模型，都会初始化表单。我在初始化的过程中抹平顶层数据源和表单数据的不一致
 * 并统一通过表单的 onChange 来更新顶层数据
 */
// eslint-disable-next-line max-lines-per-function, @coze-arch/max-line-per-function -- q
export const useHandleModelForm = ({
  currentModelId,
  onValuesChange,
  getModelRecord,
  editable,
  modelStore,
}: UseHandleModelFormProps) => {
  const effectId = useCreation(() => nanoid(), []);
  const formRef = useRef<Parameters<ModelFormProps['onFormInit']>[0]>();
  const { onlineModelList, offlineModelMap, getModelPreset } = modelStore;

  const [currentModelStyle, setCurrentModelStyle] = useState<ModelStyle>();
  const { customizeValueMap, setCustomizeValues } = useModelForm();

  const getSchema = useGetSchema();

  const handleValuesChange = (inputValues: unknown) => {
    if (!isObject(inputValues)) {
      return;
    }

    const values = inputValues as Record<string, unknown>;
    const formModelInfo = convertFormValueToModelInfo(values);

    if (currentModelStyle === ModelStyle.Custom) {
      setCustomizeValues(currentModelId, values);
    }

    onValuesChange({ values: formModelInfo });
  };
  const handleStyleChange = (values: unknown) => {
    if (
      isObject(values) &&
      'model_style' in values &&
      typeof values.model_style === 'number'
    ) {
      setCurrentModelStyle(values.model_style);
    }
  };
  const { run: debouncedHandleValuesChange } = useDebounceFn(
    handleValuesChange,
    { wait: 200 },
  );

  const convertFormValuesOnInit = (modelParameterList: ModelParameter[]) => {
    const presetValues = getModelPreset(currentModelId);
    if (!presetValues) {
      throw new Error(`failed to get presetValues, modelId: ${currentModelId}`);
    }

    const modelRecord = getModelRecord();
    const { defaultValues } = presetValues;

    // 服务端给新创建 bot 刷数据, 老数据无对应字段 fallback 到 custom
    const configModelStyle: ModelStyle =
      modelRecord.model_style ?? ModelStyle.Custom;
    const flattedModelValues = convertModelInfoToFlatObject(modelRecord);

    const presetDiversityValue = getDiversityPresetValueByStyle(
      configModelStyle,
      presetValues,
    );

    const customizeValue = customizeValueMap[currentModelId];

    /**
     * 前端内存级别按照 Record<ModelId, Values> 保存用户的 custom 设置
     * 如果没有查找到用户的设置, 则沿用当前 bot/agent 的模型设置数据
     */
    const expectValue = merge(
      {},
      flattedModelValues,
      configModelStyle === ModelStyle.Custom
        ? customizeValue
        : presetDiversityValue,
    );

    const mergeValues = merge(
      {
        model_style: configModelStyle,
      },
      defaultValues,
      expectValue,
    );

    const fixedValues = getFixedModelFormValues(
      pick(mergeValues, Object.keys(defaultValues).concat(specialFieldKeyList)),
      modelParameterList,
    );

    return fixedValues;
  };
  const handleModelStyleChange = () => {
    if (typeof currentModelStyle === 'undefined') {
      return;
    }
    const modelPresetValues = getModelPreset(currentModelId);
    if (!modelPresetValues) {
      return;
    }
    if (currentModelStyle === ModelStyle.Custom) {
      const customizeValue = customizeValueMap[currentModelId];
      if (!customizeValue) {
        return;
      }
      formRef.current?.setValues(customizeValue);
      return;
    }
    const { balance, creative, precise } = modelPresetValues;
    if (currentModelStyle === ModelStyle.Balance) {
      balance && formRef.current?.setValues(balance);
      return;
    }
    if (currentModelStyle === ModelStyle.Precise) {
      precise && formRef.current?.setValues(precise);
      return;
    }
    if (currentModelStyle === ModelStyle.Creative) {
      creative && formRef.current?.setValues(creative);
      return;
    }

    primitiveExhaustiveCheck(currentModelStyle);
  };

  useEffect(() => {
    formRef.current?.setFormState({ editable });
  }, [editable]);

  useEffect(() => {
    handleModelStyleChange();
  }, [currentModelStyle]);

  const handleFormInit: ModelFormProps['onFormInit'] = (form, formilyCore) => {
    const localeModel = getModelById({
      onlineModelList,
      offlineModelMap,
      id: currentModelId,
    });
    const parameterList = localeModel?.model_params ?? [];

    form.addEffects(effectId, () => {
      formilyCore.onFormValuesChange(localeForm => {
        handleStyleChange(localeForm.values);
        debouncedHandleValuesChange(localeForm.values);
      });
      parameterList.forEach(param => {
        fieldInitStrategies.forEach(strategy => {
          strategy.execute(param, formilyCore);
        });
      });
    });

    form.setValues(convertFormValuesOnInit(parameterList), 'overwrite');
    form.setFormState({ editable });
    formRef.current = form;
  };
  const handleFormUnmount = () => formRef.current?.removeEffects(effectId);
  return {
    getSchema,
    handleFormInit,
    handleFormUnmount,
  };
};
