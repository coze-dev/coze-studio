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
 
import { type FC, useCallback, useEffect, useMemo } from 'react';

import { useService } from '@flowgram-adapter/free-layout-editor';
import { type WorkflowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import { WorkflowVariableService } from '@coze-workflow/variable';
import {
  ValueExpressionType,
  type RefExpression,
  type ValueExpression,
} from '@coze-workflow/base';

import { ValueExpressionInput } from '../../components/value-expression-input';

import styles from './index.module.less';

export interface MutableVariableAssignSetterProps {
  value: RefExpression;
  onChange: (value: RefExpression) => void;
  right: RefExpression;
  inputParameters: {
    left: RefExpression;
    right: RefExpression;
  }[];
  index: number;
  node: WorkflowNodeEntity;
  readonly?: boolean;
  testId?: string;
}

export const MutableVariableAssign: FC<MutableVariableAssignSetterProps> = ({
  value,
  onChange,
  readonly,
  right,
  inputParameters,
  index,
  node,
  testId,
}) => {
  const variableService: WorkflowVariableService = useService(
    WorkflowVariableService,
  );

  const leftKeyPath: string[] = value?.content?.keyPath ?? [];
  const leftVariable = variableService.getViewVariableByKeyPath(leftKeyPath, {
    node,
  });

  const rightKeyPath: string[] = right?.content?.keyPath ?? [];
  const rightVariable = variableService.getViewVariableByKeyPath(rightKeyPath, {
    node,
  });

  const rightStringPaths: string[] = useMemo(() => {
    if (!Array.isArray(inputParameters) || !inputParameters?.length) {
      return [];
    }
    return (
      inputParameters
        .filter((_, i) => i !== index) // 过滤自身
        .map(input => input?.left?.content?.keyPath)
        .filter(Boolean)
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        .map(path => path!.join('.'))
    );
  }, [inputParameters]);

  useEffect(() => {
    if (!leftVariable && !rightVariable) {
      // 初始化不触发表单校验
      return;
    }
    // 右值变更触发表单校验
    onChange?.(value);
  }, [right]);

  const handleOnChange = (newValue: ValueExpression | undefined) => {
    if (newValue === undefined || newValue.type !== ValueExpressionType.REF) {
      return;
    }
    const newLeftVar = variableService.getViewVariableByKeyPath(
      newValue.content?.keyPath,
      {
        node,
      },
    );
    if (!newLeftVar) {
      return;
    }
    onChange?.(newValue);
  };

  const optionFilter = useCallback(
    (v: string[]) => {
      const subVariableMeta = variableService.getViewVariableByKeyPath(v, {
        node,
      });
      if (!rightVariable?.type) {
        return true;
      } else if (
        subVariableMeta?.type &&
        subVariableMeta.type === rightVariable.type
      ) {
        return true;
      }
      return false;
    },
    [variableService],
  );

  return (
    <div className={styles['mutable-variable-assign']}>
      <ValueExpressionInput
        className={styles['variable-select']}
        literalDisabled={true}
        value={value}
        readonly={readonly}
        onChange={handleOnChange}
        optionFilter={optionFilter}
        testId={testId}
        forbidTypeCast
        hideDeleteIcon={true}
        customFilterVar={({ meta: _meta, path }) => {
          if (path?.length !== 2) {
            // 异常处理
            return false;
          }
          if (
            _meta?.type &&
            rightVariable &&
            _meta.type !== rightVariable.type
          ) {
            // 左右值类型不匹配
            return false;
          }
          if (!_meta?.mutable) {
            // 不是可变类型变量
            return false;
          }
          const stringPath = path.join('.');
          if (rightStringPaths.includes(stringPath)) {
            // 变量重复赋值
            return false;
          }
          const rightStringPath = rightKeyPath.join('.');
          if (rightStringPath === stringPath) {
            // 左右值相等
            return false;
          }
          return true;
        }}
      />
    </div>
  );
};
