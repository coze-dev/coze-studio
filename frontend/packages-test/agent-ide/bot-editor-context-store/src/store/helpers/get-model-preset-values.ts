import { type Model } from '@coze-arch/bot-api/developer_api';

import { type ModelPresetValues } from '../type';
import { convertModelValueType } from '../../utils/model/convert-model-value-type';

export const getModelPresetValues = ({
  model_params: modelParams,
}: Required<Pick<Model, 'model_params'>>): ModelPresetValues => {
  const presetValues: Required<ModelPresetValues> = {
    defaultValues: {},
    creative: {},
    precise: {},
    balance: {},
  };
  modelParams.forEach(param => {
    const { default_val: paramPresetValues, name, type } = param;

    const defaultValue = paramPresetValues.default_val;
    const creativeValue = paramPresetValues.creative;
    const balanceValue = paramPresetValues.balance;
    const preciseValue = paramPresetValues.precise;

    presetValues.defaultValues[name] = convertModelValueType(
      defaultValue,
      type,
    );
    if (creativeValue) {
      const convertedCreativeValue = convertModelValueType(creativeValue, type);
      presetValues.creative[name] = convertedCreativeValue;
    }
    if (balanceValue) {
      const convertedBalanceValue = convertModelValueType(balanceValue, type);
      presetValues.balance[name] = convertedBalanceValue;
    }
    if (preciseValue) {
      const convertedPreciseValue = convertModelValueType(preciseValue, type);
      presetValues.precise[name] = convertedPreciseValue;
    }
  });
  return presetValues;
};
