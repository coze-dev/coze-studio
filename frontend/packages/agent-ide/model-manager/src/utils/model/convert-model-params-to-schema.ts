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

import { groupBy, merge, uniqBy } from 'lodash-es';
import { type SchemaTypes, type ISchema } from '@formily/react';
import {
  type Model,
  ModelParamType,
  type ModelParameter,
  type ModelParamClass,
} from '@coze-arch/bot-api/developer_api';
import { convertModelValueType } from '@coze-agent-ide/bot-editor-context-store';

import {
  primitiveExhaustiveCheck,
  recordExhaustiveCheck,
} from '../exhaustive-check';
import {
  ModelFormComponent,
  ModelFormVoidFieldComponent,
} from '../../constant/model-form-component';
import { type ModelFormComponentPropsMap } from '../../components/model-form/type';

const precisionToStep = (precision: number | undefined) => {
  if (!precision) {
    return 1;
  }
  return Number(`0.${'0'.repeat(precision - 1)}1`);
};

const getParamType = ({ type }: Pick<ModelParameter, 'type'>): SchemaTypes => {
  switch (type) {
    case ModelParamType.Float:
    case ModelParamType.Int: {
      return 'number';
    }
    case ModelParamType.Boolean: {
      return 'boolean';
    }
    default: {
      return 'string';
    }
  }
};

const getParamComponent = ({
  type,
  options,
}: Pick<ModelParameter, 'type' | 'options'>): ModelFormComponent => {
  if (options?.length) {
    return ModelFormComponent.RadioButton;
  }

  switch (type) {
    case ModelParamType.Float:
    case ModelParamType.Int: {
      return ModelFormComponent.SliderInputNumber;
    }
    case ModelParamType.Boolean: {
      return ModelFormComponent.Switch;
    }
    default: {
      return ModelFormComponent.Input;
    }
  }
};

const getComponentProps = (
  component: ModelFormComponent,
  {
    max,
    min,
    label,
    precision,
    options,
    desc,
    type,
    ...rest
  }: Pick<
    ModelParameter,
    'max' | 'min' | 'label' | 'precision' | 'options' | 'desc' | 'type'
  >,
): ModelFormComponentPropsMap[ModelFormComponent] => {
  recordExhaustiveCheck(rest);
  if (component === ModelFormComponent.RadioButton) {
    return {
      type: 'button',
      options: options?.map(item => {
        const convertedValue = convertModelValueType(item.value ?? '', type);
        if (typeof convertedValue === 'boolean') {
          return {
            label: item.label,
            value: undefined,
          };
        }

        return {
          label: item.label,
          value: convertedValue,
        };
      }),
    };
  }
  if (component === ModelFormComponent.Input) {
    return {};
  }
  if (component === ModelFormComponent.SliderInputNumber) {
    const numberedMax = Number(max);
    const numberedMin = Number(min);
    return {
      max: numberedMax,
      min: numberedMin,
      step: precisionToStep(precision),
      decimalPlaces: precision,
    };
  }
  if (component === ModelFormComponent.Switch) {
    return {};
  }
  if (component === ModelFormComponent.ModelFormItem) {
    return {
      label,
      popoverContent: desc,
    };
  }

  primitiveExhaustiveCheck(component);
  return {};
};

export const convertModelParamsToSchema = ({
  model_params: modelParams,
}: Required<Pick<Model, 'model_params'>>): ISchema => {
  const paramClassList = uniqBy(
    modelParams
      .map(param => param.param_class)
      .filter((paramClass): paramClass is ModelParamClass =>
        Boolean(paramClass),
      ),
    paramClass => paramClass.class_id,
  ).sort((a, b) => (a.class_id ?? 0) - (b.class_id ?? 0));

  const paramDictionary = groupBy(
    modelParams,
    param => param.param_class?.class_id,
  );

  const schema: ISchema = {
    type: 'object',
    properties: {},
  };

  paramClassList.forEach((paramClass, index) => {
    const voidField: ISchema = {
      type: 'void',
      properties: {},
      'x-decorator':
        paramClass.class_id === 1
          ? ModelFormVoidFieldComponent.ModelFormGenerationDiversityGroupItem
          : ModelFormVoidFieldComponent.ModelFormGroupItem,
      'x-decorator-props': {
        title: paramClass.label,
      },
      'x-index': index + 1,
    };
    const parameterList = paramDictionary[paramClass.class_id ?? ''];
    if (!parameterList) {
      return;
    }
    parameterList.forEach((modelParam, paramIndex) => {
      const paramField = modelParam.name;
      const component = getParamComponent(modelParam);
      const componentProps = getComponentProps(component, modelParam);
      const decoratorProps = getComponentProps(
        ModelFormComponent.ModelFormItem,
        modelParam,
      );
      const paramSchema: ISchema = {
        type: getParamType(modelParam),
        'x-component': component,
        'x-component-props': componentProps,
        'x-decorator': ModelFormComponent.ModelFormItem,
        'x-decorator-props': decoratorProps,
        'x-index': paramIndex + 1,
      };

      merge(voidField.properties, { [paramField]: paramSchema });
    });
    merge(schema.properties, { [paramClass.class_id ?? '']: voidField });
  });

  return schema;
};
