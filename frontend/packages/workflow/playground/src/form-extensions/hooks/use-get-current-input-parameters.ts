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

/**
 * TODO: This hooks is temporarily used to get the inputsParameters of the current node and the type corresponding to each variable
 */

import { useState, useEffect } from 'react';

import { FlowNodeFormData } from '@flowgram-adapter/free-layout-editor';
import { useService } from '@flowgram-adapter/free-layout-editor';
import { useCurrentEntity } from '@flowgram-adapter/free-layout-editor';
import {
  type ValueExpression,
  ValueExpressionType,
  ViewVariableType,
  WorkflowVariableService,
} from '@coze-workflow/variable';

interface InputParameterWithType {
  name: string;
  input: ValueExpression;
  type: ViewVariableType;
}

export const useGetCurrentInputsParameters = () => {
  const node = useCurrentEntity();
  const formEntity = node.getData(FlowNodeFormData);
  const [formValue, setFormValue] = useState(
    formEntity.formModel.getFormItemValueByPath('/'),
  );
  const [inputsParameters, setInputsParameters] = useState<
    Array<{
      name: string;
      input: ValueExpression;
    }>
  >([]);

  useEffect(() => {
    const disposable = formEntity.onDataChange(params => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newValue = (params as any).formModel.getFormItemValueByPath('/');
      setFormValue({ ...newValue });
    });

    return () => disposable.dispose();
  }, [formEntity]);

  useEffect(() => {
    Object.keys(formValue).forEach(key => {
      if (key.endsWith('inputParameters')) {
        setInputsParameters(formValue[key]);
      }
    });
  }, [formValue]);
  const variableService: WorkflowVariableService = useService(
    WorkflowVariableService,
  );

  return inputsParameters.reduce<InputParameterWithType[]>((buf, item) => {
    if (!item.name || !item.input) {
      return buf;
    }
    let inputViewVariableType;
    if (item.input.type === ValueExpressionType.LITERAL) {
      inputViewVariableType = ViewVariableType.String;
    } else if (item.input.type === ValueExpressionType.OBJECT_REF) {
      inputViewVariableType = ViewVariableType.Object;
    } else {
      inputViewVariableType = variableService.getViewVariableByKeyPath(
        item.input.content?.keyPath,
        { node },
      )?.type;
    }

    buf.push({
      ...item,
      type: inputViewVariableType,
    });

    return buf;
  }, []);
};
