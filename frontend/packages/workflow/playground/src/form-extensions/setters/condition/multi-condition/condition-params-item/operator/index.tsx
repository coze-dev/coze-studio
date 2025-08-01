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

import React, { useMemo } from 'react';

import { ViewVariableType } from '@coze-workflow/base/types';
import { type ConditionType } from '@coze-workflow/base/api';
import { useNodeTestId } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { Tooltip, Select } from '@coze-arch/coze-design';
import { type SelectProps } from '@coze-arch/bot-semi/Select';

import {
  arrayConditionValueMap,
  booleanConditionValueMap,
  numberConditionValueMap,
  intConditionValueMap,
  objectConditionValueMap,
  stringConditionValueMap,
  fileConditionValueMap,
  timeConditionValueMap,
} from '../constants';
import { operatorMap } from '../../constants';
import convertMap2options from './convert-map2options';

import styles from './index.module.less';

interface OperatorProps {
  value?: ConditionType;
  onChange: (v: ConditionType) => void;
  sourceType?: ViewVariableType;
  onBlur?: () => void;
  validateStatus?: SelectProps['validateStatus'];
  testId: string;
}

export default function Operator(props: OperatorProps) {
  const { value, onChange, sourceType, onBlur, validateStatus, testId } = props;
  const { concatTestId } = useNodeTestId();

  // Change the corresponding options according to the reference variable
  const options = useMemo(() => {
    if (sourceType && ViewVariableType.isFileType(sourceType)) {
      return convertMap2options(fileConditionValueMap, {
        computedValue: val => Number(val),
        i18n: true,
      });
    }

    switch (sourceType) {
      case ViewVariableType.ArrayBoolean:
      case ViewVariableType.ArrayInteger:
      case ViewVariableType.ArrayNumber:
      case ViewVariableType.ArrayObject:
      case ViewVariableType.ArrayString:
      case ViewVariableType.ArrayTime: {
        return convertMap2options(arrayConditionValueMap, {
          computedValue: val => Number(val),
          i18n: true,
        });
      }
      case ViewVariableType.Object: {
        return convertMap2options(objectConditionValueMap, {
          computedValue: val => Number(val),
          i18n: true,
        });
      }
      case ViewVariableType.Boolean: {
        return convertMap2options(booleanConditionValueMap, {
          computedValue: val => Number(val),
          i18n: true,
        });
      }
      case ViewVariableType.Integer: {
        return convertMap2options(intConditionValueMap, {
          computedValue: val => Number(val),
          i18n: true,
        });
      }
      case ViewVariableType.String: {
        return convertMap2options(stringConditionValueMap, {
          computedValue: val => Number(val),
          i18n: true,
        });
      }
      case ViewVariableType.Number: {
        return convertMap2options(numberConditionValueMap, {
          computedValue: val => Number(val),
          i18n: true,
        });
      }
      case ViewVariableType.Time: {
        return convertMap2options(timeConditionValueMap, {
          computedValue: val => Number(val),
          i18n: true,
        });
      }
      default:
        return [];
    }
  }, [sourceType]);

  const renderSelectedItem = option => (
    <Tooltip content={option.label}>{operatorMap[option.value]}</Tooltip>
  );

  return (
    <Select
      data-testid={testId}
      size="small"
      value={value}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onChange={onChange as any}
      onBlur={onBlur}
      validateStatus={validateStatus}
      // optionList={options}
      // showClear
      placeholder={I18n.t('workflow_detail_condition_pleaseselect')}
      emptyContent={I18n.t('workflow_detail_node_nodata')}
      className={styles.container}
      renderSelectedItem={renderSelectedItem}
    >
      {options.map(option => (
        <Select.Option
          {...option}
          data-testid={concatTestId(testId, `${option.value}`)}
        />
      ))}
    </Select>
  );
}
