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
  // This field is a nested structure and requires special conversion
  'HistoryRound',
  // This field needs to be brought to the form for change. There are components in the form that will listen to this data, but it is not part of the model_parameter
  'model_style',
];

export interface UseHandleModelFormProps {
  currentModelId: string;
  onValuesChange: (props: { values: ModelInfo }) => void;
  getModelRecord: () => ModelInfo;
  editable: boolean;
  /**
   * Originally, useBotEditor was called inside the hook to get the modelStore, but this issue was violently moved out for the time being
   * The ideal form of @todo is to completely decouple from the store, pass in get_type_list interface return value, or provide a way to convert the interface return value into the desired structure
   */
  modelStore: Pick<
    ModelState & ModelAction,
    'onlineModelList' | 'offlineModelMap' | 'getModelPreset'
  >;
}

/**
 * The flow of data here does not allow the top-level model to set the data to fully control the form data for several reasons:
 * 1. Temporary changes in requirements, and user settings need to be recorded only according to the model
 * 2. The design of the top-level data source is singleton, and only one copy of the most recent model can be stored
 *
 * The final design is that the data is recorded by the single layer in the middle, and the top-level data source is updated by the onChange of the form
 * So the form data and the top-level data source are not necessarily the same
 *
 * Every time I switch the model, the form is initialized. During the initialization process, I smooth out the inconsistencies between the top-level data source and the form data
 * And update the top-level data uniformly through the onChange of the form
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

    // The server level flushes the data for the newly created bot, and the old data has no corresponding field fallback to custom.
    const configModelStyle: ModelStyle =
      modelRecord.model_style ?? ModelStyle.Custom;
    const flattedModelValues = convertModelInfoToFlatObject(modelRecord);

    const presetDiversityValue = getDiversityPresetValueByStyle(
      configModelStyle,
      presetValues,
    );

    const customizeValue = customizeValueMap[currentModelId];

    /**
     * Front-end memory level Save user's custom settings according to Record < ModelId, Values >
     * If the user's settings are not found, the model setting data of the current bot/agent is used
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
