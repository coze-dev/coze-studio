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

import {
  VARIABLE_TYPE_ALIAS_MAP,
  type ViewVariableType,
  useNodeTestId,
} from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { Cascader, Tooltip } from '@coze-arch/coze-design';

import { useReadonly } from '@/nodes-v2/hooks/use-readonly';
import {
  getCascaderVal,
  getVariableTypeList,
  allVariableTypeList,
} from '@/form-extensions/components/output-tree/components/custom-tree-node/components/param-type/utils';
import { VARIABLE_TYPE_ICONS_MAP } from '@/form-extensions/components/output-tree/components/custom-tree-node/components/param-type/constants';
import { useField, withField } from '@/form';

import styles from './index.module.less';

interface ParamTypeProps {
  level: number;
  disabled?: boolean;
  /** Types not supported */
  disabledTypes?: ViewVariableType[];
  /** hidden type */
  hiddenTypes?: ViewVariableType[];
}

const defaultDisabledTypes = [];

const ParamType = ({
  level,
  disabledTypes = defaultDisabledTypes,
  hiddenTypes,
}: ParamTypeProps) => {
  const { value, onChange, errors, onBlur } = useField<ViewVariableType>();
  const readonly = useReadonly();

  const { concatTestId } = useNodeTestId();

  const optionList = useMemo(
    () => getVariableTypeList({ disabledTypes, hiddenTypes, level }),
    [disabledTypes, hiddenTypes, level],
  );

  const cascaderVal = useMemo(
    () => getCascaderVal(value as ViewVariableType, allVariableTypeList),
    [value],
  );
  return (
    <Cascader
      data-testid={concatTestId('param-type-select')}
      placeholder={I18n.t('workflow_detail_start_variable_type')}
      disabled={readonly}
      size="small"
      onChange={val => {
        let newVal = val;
        if (Array.isArray(val)) {
          newVal = val[val.length - 1];
        }
        onChange?.(newVal as ViewVariableType);
      }}
      onBlur={() => onBlur?.()}
      className={styles['type-cascader']}
      displayProp="value"
      displayRender={selected => {
        if (!Array.isArray(selected)) {
          return null;
        }

        return (
          <Tooltip
            content={VARIABLE_TYPE_ALIAS_MAP[selected[selected.length - 1]]}
          >
            <div className="flex items-center gap-1 text-xs">
              {VARIABLE_TYPE_ICONS_MAP[selected[selected.length - 1]]}
              <div className="truncate">
                {VARIABLE_TYPE_ALIAS_MAP[selected[selected.length - 1]]}
              </div>
            </div>
          </Tooltip>
        );
      }}
      treeData={optionList}
      value={cascaderVal}
      validateStatus={errors?.length ? 'error' : 'default'}
    />
  );
};

export const ParamTypeField = withField(ParamType);
