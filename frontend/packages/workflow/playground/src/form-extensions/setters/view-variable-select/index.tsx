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

import { type CSSProperties, useCallback, useState } from 'react';

import { get } from 'lodash-es';
import {
  type SetterComponentProps,
  type ValidatorProps,
} from '@flowgram-adapter/free-layout-editor';
import { useService } from '@flowgram-adapter/free-layout-editor';
import { useCurrentEntity } from '@flowgram-adapter/free-layout-editor';
import {
  useVariableChange,
  type ViewVariableType,
  WorkflowVariableService,
} from '@coze-workflow/variable';
import {
  type RefExpression,
  ValueExpressionType,
  useNodeTestId,
} from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { type CascaderProps } from '@coze-arch/bot-semi/Cascader';

import { valueExpressionValidator } from '../../validators';
import { VariableSelector } from '../../components/tree-variable-selector';

import styles from './index.module.less';

interface ViewVariableSelectSetterOptions {
  disabledTypes?: ViewVariableType[];
  style?: CSSProperties;
  forArrayItem?: boolean;
}

type ViewVariableSelectSetterProps = SetterComponentProps<
  RefExpression,
  ViewVariableSelectSetterOptions
>;

function ViewVariableSelectSetter(
  props: ViewVariableSelectSetterProps,
): JSX.Element {
  const { value, onChange, readonly, options, context } = props;
  const { disabledTypes = [], style = {}, forArrayItem = false } = options;
  const [validation, setValidation] = useState<{
    status: CascaderProps['validateStatus'];
    message?: string;
  }>({
    status: 'default',
  });

  const { getNodeSetterId } = useNodeTestId();

  const variableService: WorkflowVariableService = useService(
    WorkflowVariableService,
  );

  const node = useCurrentEntity();

  const keyPath = get(value, 'content.keyPath') as string[];

  useVariableChange({
    keyPath,
    onChange: ({ variableMeta }) => {
      if (!variableMeta) {
        setValidation({
          status: 'error',
          message: I18n.t('card_builder_userVar_list_search_empty'),
        });
        onChange({ type: ValueExpressionType.REF });
        return;
      }

      // Disable type, clear
      if (disabledTypes.includes(variableMeta.type)) {
        setValidation({ status: 'error' });
        onChange({ type: ValueExpressionType.REF });
        return;
      }

      setValidation({
        status: 'success',
      });
    },
  });

  const handleOnChange = (newValue: string[] | undefined) => {
    if (newValue !== undefined) {
      onChange?.({
        type: ValueExpressionType.REF,
        content: {
          keyPath: newValue,
        },
      });
      setValidation({
        status: 'success',
      });
    }
  };

  const optionFilter = useCallback(
    (v: string[]) => {
      const subVariableMeta = variableService.getViewVariableByKeyPath(v, {
        node,
      });
      if (
        subVariableMeta?.type &&
        !disabledTypes.includes(subVariableMeta.type)
      ) {
        return true;
      }
      return false;
    },
    [variableService],
  );

  return (
    <VariableSelector
      className={styles['view-variable-select-setter']}
      value={keyPath}
      readonly={readonly}
      onChange={handleOnChange}
      disabledTypes={disabledTypes}
      forArrayItem={forArrayItem}
      validateStatus={validation.status}
      invalidContent={validation.message}
      optionFilter={optionFilter}
      style={style}
      testId={getNodeSetterId(context.path)}
    />
  );
}

export const viewVariableSelect = {
  key: 'ViewVariableSelect',
  component: ViewVariableSelectSetter,
  validator: ({ value, context }: ValidatorProps) => {
    const { meta, playgroundContext, node } = context;
    const { required } = meta;
    return valueExpressionValidator({
      value,
      playgroundContext,
      node,
      required,
    });
  },
};
