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

import { type FC, useEffect, useState } from 'react';

import cl from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { type CascaderProps } from '@coze-arch/coze-design';
import { Typography, UICascader } from '@coze-arch/bot-semi';
import { IconAlertCircle } from '@douyinfe/semi-icons';

import {
  type APIParameterRecord,
  type CascaderOnChangValueType,
  type CascaderValueType,
  type InputItemProps,
} from '../../types/params';
import s from '../../index.module.less';
import {
  ARRAYTAG,
  assistToExtend,
  extendToAssist,
  getParameterTypeLabel,
  getPluginParameterTypeOptions,
  ParameterTypeExtend,
} from '../../config';

const getCascaderValueTypeFrom = (
  record?: APIParameterRecord,
): CascaderValueType => {
  if (record?.assist_type) {
    return [ParameterTypeExtend.DEFAULT, assistToExtend(record.assist_type)];
  }

  // @ts-expect-error -- linter-disable-autofix
  return [record.type];
};

const { Text } = Typography;

interface CProps extends Omit<InputItemProps, 'selectCallback'> {
  selectCallback: (types: CascaderOnChangValueType) => void;
  enableFileType?: boolean;
}

export const CascaderItem: FC<CProps> = ({
  check = 0,
  useBlockWrap = false,
  record,
  disabled,
  selectCallback,
  enableFileType = false,
}) => {
  const [value, setValue] = useState<CascaderValueType>(
    getCascaderValueTypeFrom(record),
  );
  const [errorStatus, setErrorStatus] = useState<number>(0);
  // @ts-expect-error -- linter-disable-autofix
  const isArrayType = record.name === ARRAYTAG;
  // @ts-expect-error -- linter-disable-autofix
  const isObjectField = (record.deep ?? 0) > 1 && record.name !== ARRAYTAG;

  // Trigger validation via check (when committed)
  useEffect(() => {
    if (check === 0) {
      return;
    }
    handleCheck(value);
  }, [check]);

  // validation
  const handleCheck = (val?: CascaderValueType) => {
    const status = !val?.[0] ? 1 : 0;
    setErrorStatus(status);
  };

  const onChange = (types: CascaderValueType) => {
    if (types[1]) {
      selectCallback([types[0], extendToAssist(types[1])]);
    } else {
      selectCallback([types[0]]);
    }
    setValue(types);
    handleCheck(types);
  };

  const displayRender: CascaderProps['displayRender'] = (items, idx) => {
    // @ts-expect-error -- linter-disable-autofix
    let inputValue: string = items[0];

    if (value[1]) {
      if (value[1] === ParameterTypeExtend.DEFAULT) {
        // @ts-expect-error -- linter-disable-autofix
        inputValue = getParameterTypeLabel(
          ParameterTypeExtend.DEFAULT,
          isArrayType,
        );
      } else {
        // @ts-expect-error -- linter-disable-autofix
        inputValue = items[1];
      }
    }

    return <Text ellipsis={{ showTooltip: true }}>{inputValue}</Text>;
  };

  const parameterTypeOptionsWithCustom = getPluginParameterTypeOptions(
    isArrayType,
    enableFileType && !isObjectField,
  );

  return (
    <span
      style={useBlockWrap ? { display: 'inline-block', width: '100%' } : {}}
    >
      <UICascader
        treeData={parameterTypeOptionsWithCustom}
        validateStatus={errorStatus ? 'error' : 'default'}
        // @ts-expect-error -- linter-disable-autofix
        value={value}
        disabled={disabled}
        onChange={onChange as CascaderProps['onChange']}
        displayRender={displayRender}
        dropdownClassName={s.cascaderDropdown}
        style={{ width: '100%' }}
      />
      <br />
      {errorStatus !== 0 && (
        <div style={{ position: 'relative' }}>
          <span className={cl(s['form-check-tip'], 'errorClassTag', s.w110)}>
            <IconAlertCircle className={s['plugin-icon-error']} />
            <Text
              component="span"
              ellipsis={{
                showTooltip: {
                  type: 'tooltip',
                  opts: { style: { maxWidth: '100%' } },
                },
              }}
              className={s['plugin-tooltip-error']}
            >
              {errorStatus === 1 && (
                <span>{I18n.t('plugin_Parameter_type')}</span>
              )}
            </Text>
          </span>
        </div>
      )}
    </span>
  );
};
