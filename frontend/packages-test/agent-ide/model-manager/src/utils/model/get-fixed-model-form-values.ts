import { cloneDeep } from 'lodash-es';
import {
  ModelParamType,
  type ModelParameter,
} from '@coze-arch/bot-api/developer_api';
import { convertModelValueType } from '@coze-agent-ide/bot-editor-context-store';

export const getFixedModelFormValues = (
  values: Record<string, unknown>,
  modelParameterList: ModelParameter[],
) => {
  const draft = cloneDeep(values);

  Object.keys(draft).forEach(key => {
    const targetParameter = modelParameterList.find(
      parameter => parameter.name === key,
    );
    if (!targetParameter) {
      return;
    }
    const value = draft[key];
    const parameterType = targetParameter.type;
    const { options } = targetParameter;

    // 修正 枚举 类型的参数不在枚举范围内
    // IDL 无法写范型 转换成 string 比较
    if (options?.length) {
      if (options.findIndex(option => option.value === String(value)) >= 0) {
        return;
      }
      draft[key] = convertModelValueType(
        options.at(0)?.value ?? '',
        parameterType,
      );
    }

    // 修正 number 类型的参数超过最大、最小值
    if (
      parameterType === ModelParamType.Float ||
      parameterType === ModelParamType.Int
    ) {
      if (typeof value !== 'number') {
        return;
      }

      const { max, min } = targetParameter;

      const numberedMax = Number(max);
      const numberedMin = Number(min);
      if (max && value > numberedMax) {
        draft[key] = numberedMax;
      }
      if (min && value < numberedMin) {
        draft[key] = numberedMin;
      }
    }
  });
  return draft;
};
