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

import { type FC, createContext, useContext, useEffect } from 'react';

import { I18n } from '@coze-arch/i18n';
import { Input, Select } from '@coze-arch/coze-design';
import { type OutputTypeInfo } from '@coze-arch/bot-api/connector_api';

import { getIsNumberOutput, getIsTextOutput } from '../../validate/utils';
import { type BaseOutputStructLineType } from '../../types';
import type { ConfigStoreState } from '../../store';
import { useConfigStoreGuarded } from '../../context/store-context';
import { BigCheckbox } from '../../big-checkbox';
import { useRequireVerify } from './use-require-verify';
import { RequiredWarn } from './required-warn';

export const OutputLineCommonContext = createContext<{
  onChange?: (val: BaseOutputStructLineType) => void;
  list?: OutputTypeInfo[];
  getShowRequireWarn?: (val: BaseOutputStructLineType) => OutputStructVerifyRes;
  onToggleError?: (id: string, error: boolean) => void;
}>({});

export interface OutputStructVerifyRes {
  groupByKey: {
    warn: boolean;
    tip?: string;
  };
  primary: {
    warn: boolean;
    tip?: string;
  };
}
const getOutputFieldConfig = (storeState: ConfigStoreState, id: string) => {
  const data = storeState.config?.output_sub_component.item_list?.find(
    item => item._id === id,
  );
  if (!data) {
    throw new Error(`cannot find data of ${id}`);
  }
  return data;
};

export const BaseOutputStructLine: FC<{
  data: BaseOutputStructLineType;
  // eslint-disable-next-line @coze-arch/max-line-per-function -- /
}> = ({ data: { _id: id } }) => {
  const { list, onChange, getShowRequireWarn, onToggleError } = useContext(
    OutputLineCommonContext,
  );
  const store = useConfigStoreGuarded();
  const data = useConfigStoreGuarded()(state =>
    getOutputFieldConfig(state, id),
  );
  if (!data) {
    throw new Error(`cannot find data of ${id}`);
  }
  if (!list || !onChange || !getShowRequireWarn || !onToggleError) {
    throw new Error('impossible context member miss');
  }

  const { groupByKey: groupByKeyRequire, primary: primaryRequire } =
    getShowRequireWarn(data);

  const getVal = () => getOutputFieldConfig(store.getState(), id);
  const keyRequire = useRequireVerify({
    getVal,
    verify: config => !!config?.key,
    onChange: isError => onToggleError(`${id}#key`, isError),
  });
  const typeRequire = useRequireVerify({
    getVal,
    verify: config => Number.isInteger(config.output_type),
    onChange: isError => onToggleError(`${id}$type`, isError),
  });

  useEffect(() => {
    const hasError = groupByKeyRequire.warn || primaryRequire.warn;
    onToggleError(data._id, hasError);
  }, [groupByKeyRequire.warn, primaryRequire.warn]);

  return (
    <>
      <div
        style={{
          width: outputStructColumnWidth.key,
          margin: '6px 0',
          position: 'relative',
        }}
      >
        <Input
          error={keyRequire.showWarn}
          value={data.key}
          onBlur={keyRequire.onTrigger}
          placeholder={I18n.t('publish_base_configFields_key_placeholder')}
          onChange={val => {
            onChange({
              ...data,
              key: val,
            });
          }}
        />
        {keyRequire.showWarn ? <RequiredWarn /> : null}
      </div>
      <div
        style={{
          width: outputStructColumnWidth.outputType,
          position: 'relative',
        }}
      >
        <Select
          defaultValue={data.output_type}
          optionList={list.map(info => ({
            value: info.id,
            label: info.name,
          }))}
          placeholder={I18n.t('publish_base_configFields_dataType_placeholder')}
          onBlur={typeRequire.onTrigger}
          onChange={val => {
            onChange({
              ...data,
              output_type: Number(val),
            });
            typeRequire.onTrigger();
          }}
          hasError={typeRequire.showWarn}
          style={{
            width: '100%',
          }}
        />
        {typeRequire.showWarn ? <RequiredWarn /> : null}
      </div>
      <div
        style={{
          width: outputStructColumnWidth.groupByKey,
          position: 'relative',
        }}
      >
        <BigCheckbox
          checked={data.is_group_by_key}
          /**
           * is_group_by_key: Only text types are allowed
           * Scenes can be switched:
           * 1. Checked: Any Type
           * 2. Unchecked: text type only
           */
          disabled={
            !(data.is_group_by_key || getIsTextOutput(data.output_type))
          }
          isError={groupByKeyRequire.warn}
          onChange={e => {
            const val = Boolean(e.target.checked);
            onChange({
              ...data,
              is_group_by_key: val,
            });
          }}
        />
        {groupByKeyRequire.warn ? (
          <RequiredWarn
            text={groupByKeyRequire.tip}
            style={{
              marginLeft: 0,
            }}
          />
        ) : null}
      </div>
      <div
        style={{
          width: outputStructColumnWidth.primary,
          position: 'relative',
        }}
      >
        <BigCheckbox
          checked={data.is_primary}
          isError={primaryRequire.warn}
          /**
           * is_primary: Only text or number types are allowed
           * Scenes can be switched:
           * 1. Checked: Any Type
           * 2. Unchecked: only text and number types
           */
          disabled={
            !(
              data.is_primary ||
              getIsNumberOutput(data.output_type) ||
              getIsTextOutput(data.output_type)
            )
          }
          onChange={e => {
            const val = Boolean(e.target.checked);
            onChange({
              ...data,
              is_primary: val,
            });
          }}
        />
        {primaryRequire.warn ? (
          <RequiredWarn
            text={primaryRequire.tip}
            style={{
              marginLeft: 0,
            }}
          />
        ) : null}
      </div>
    </>
  );
};

const FIRST_TWO_COLUMN_TRANSFER_SPACE = 30;
// The sum is 566, the scroll bar leaves 8, the left drag button 16, the gap 8 * 4, the delete button 24.
// (566 - 8 - 16 - 4 * 8 - 24 - (44 + 96)) / 2 = 173
export const outputStructColumnWidth = {
  key: 173 + FIRST_TWO_COLUMN_TRANSFER_SPACE,
  outputType: 173 - FIRST_TWO_COLUMN_TRANSFER_SPACE,
  groupByKey: 44,
  // Allow some width for internationalization
  primary: 96,
};
