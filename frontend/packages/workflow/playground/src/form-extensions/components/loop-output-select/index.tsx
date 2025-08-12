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

import { useState, type FC } from 'react';

import { get } from 'lodash-es';
import classNames from 'classnames';
import { useService } from '@flowgram-adapter/free-layout-editor';
import { useCurrentEntity } from '@flowgram-adapter/free-layout-editor';
import {
  WorkflowVariableService,
  useVariableTypeChange,
  variableUtils,
} from '@coze-workflow/variable';
import {
  VARIABLE_TYPE_ALIAS_MAP,
  ValueExpressionType,
  ViewVariableType,
  useNodeTestId,
  type RefExpression,
  type ValueExpression,
} from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { type CascaderProps } from '@coze-arch/bot-semi/Cascader';

import { ValueExpressionInput } from '../../components/value-expression-input';

import styles from './index.module.less';

interface LoopOutputSelectProps {
  value: RefExpression;
  onChange: (value: RefExpression) => void;
  readonly?: boolean;
  testId?: string;
}

export const LoopOutputSelect: FC<LoopOutputSelectProps> = ({
  value,
  onChange,
  readonly,
  testId,
}) => {
  const [validation, setValidation] = useState<{
    status: CascaderProps['validateStatus'];
    message?: string;
  }>({
    status: 'default',
  });

  const node = useCurrentEntity();
  const { getNodeSetterId, concatTestId } = useNodeTestId();
  const computedTestId = getNodeSetterId('loopOutputSelect');
  const variableService: WorkflowVariableService = useService(
    WorkflowVariableService,
  );

  const keyPath = get(value, 'content.keyPath') as string[];

  const isLoopSelfVariable = keyPath?.[0] === node.id;
  const originType = variableUtils.getValueExpressionViewType(
    value,
    variableService,
    { node },
  );

  let variableType = originType;
  if (!isLoopSelfVariable && originType) {
    // Two-dimensional arrays are temporarily not supported
    if (ViewVariableType.isArrayType(originType)) {
      variableType = undefined;
    } else {
      variableType = ViewVariableType.wrapToArrayType(originType);
    }
  }
  const typeLabel = variableType
    ? VARIABLE_TYPE_ALIAS_MAP[variableType]
    : undefined;

  useVariableTypeChange({
    keyPath,
    onTypeChange: ({ variableMeta }) => {
      if (
        !variableMeta ||
        // Variables in LoopFunction temporarily do not support 2D arrays
        (!isLoopSelfVariable &&
          ViewVariableType.isArrayType(variableMeta?.type))
      ) {
        setValidation({
          status: 'error',
          message: I18n.t('card_builder_userVar_list_search_empty'),
        });
        onChange({ type: ValueExpressionType.REF });
        return;
      }
      setValidation({
        status: 'success',
      });
    },
  });

  const handleOnChange = (newValue: ValueExpression | undefined) => {
    if (newValue === undefined || newValue.type !== ValueExpressionType.REF) {
      return;
    }
    const path = newValue?.content?.keyPath ?? [];
    if (path.length === 1 && path[0] === node.id) {
      return;
    }
    onChange?.(newValue);
    setValidation({
      status: 'success',
    });
  };

  return (
    <div className={styles['loop-output-select']}>
      <ValueExpressionInput
        className={styles['variable-select']}
        value={value}
        hideSettingIcon={true}
        hideDeleteIcon={true}
        literalDisabled={true}
        enableSelectNode={true}
        renderDisplayVarName={({ meta: _meta, path }) => {
          if (path?.[0] === node.id) {
            return _meta?.name || ''; // loop intermediate variable
          }
          return `[${_meta?.name}] * n`; // loop body node output variable
        }}
        customFilterVar={({ meta: _meta, path }) => {
          if (path?.[0] === node.id) {
            if (path.length === 2) {
              return !!_meta?.mutable;
            }
            // Variables under Current Node Variable Reserved
            return true;
          }
          // For the time being, it is not supported to assemble two-dimensional arrays in the loop body.
          return !!_meta?.type && !ViewVariableType.isArrayType(_meta?.type);
        }}
        handleDataSource={datasource =>
          datasource.filter(
            data => data.nodeId !== node.id || Boolean(data.children?.length),
          )
        }
        readonly={readonly}
        onChange={handleOnChange}
        validateStatus={validation.status}
        invalidContent={validation.message}
        testId={testId}
        forbidTypeCast
      />
      <div
        className={classNames(styles['variable-type'], {
          [styles['variable-type-bg']]: Boolean(typeLabel),
        })}
        data-testid={concatTestId(testId ?? computedTestId, 'variable-type')}
      >
        {typeLabel ? (
          <p className={styles['variable-type-content']}>{typeLabel}</p>
        ) : (
          <p className={styles['variable-type-placeholder']}>
            {I18n.t('workflow_detail_node_nodata')}
          </p>
        )}
      </div>
    </div>
  );
};
