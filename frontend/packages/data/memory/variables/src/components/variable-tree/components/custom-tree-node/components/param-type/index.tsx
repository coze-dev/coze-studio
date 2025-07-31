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

/* eslint-disable @coze-arch/no-deep-relative-import */
import React, { useMemo } from 'react';

import { I18n } from '@coze-arch/i18n';
import { type SelectProps } from '@coze-arch/bot-semi/Select';
import { Cascader } from '@coze-arch/coze-design';

import { VARIABLE_TYPE_ALIAS_MAP } from '@/types/view-variable-tree';

import { ReadonlyText } from '../readonly-text';
import { type TreeNodeCustomData } from '../../../../type';
import {
  getVariableTypeList,
  getCascaderVal,
  allVariableTypeList,
} from './utils';
import { VARIABLE_TYPE_ICONS_MAP } from './constants';

interface ParamTypeProps {
  data: TreeNodeCustomData;
  level: number;
  onSelectChange?: SelectProps['onChange'];
  readonly?: boolean;
}

export default function ParamType({
  data,
  onSelectChange,
  level,
  readonly,
}: ParamTypeProps) {
  const optionList = useMemo(() => getVariableTypeList({ level }), [level]);

  const cascaderVal = useMemo(
    () => getCascaderVal(data.type, allVariableTypeList),
    [data.type],
  );

  return readonly ? (
    <ReadonlyText
      className="w-full"
      value={VARIABLE_TYPE_ALIAS_MAP[data.type]}
    />
  ) : (
    <Cascader
      placeholder={I18n.t('workflow_detail_start_variable_type')}
      disabled={readonly}
      onChange={val => {
        let newVal = val;
        if (Array.isArray(val)) {
          newVal = val[val.length - 1];
        }
        onSelectChange?.(newVal);
      }}
      className="w-full coz-stroke-plus"
      displayProp="value"
      displayRender={selected => {
        if (!Array.isArray(selected)) {
          return null;
        }

        return (
          <div className="flex items-center gap-1 text-xs">
            {VARIABLE_TYPE_ICONS_MAP[selected[selected.length - 1]]}
            <div className="truncate">
              {VARIABLE_TYPE_ALIAS_MAP[selected[selected.length - 1]]}
            </div>
          </div>
        );
      }}
      treeData={optionList}
      value={cascaderVal}
    />
  );
}
