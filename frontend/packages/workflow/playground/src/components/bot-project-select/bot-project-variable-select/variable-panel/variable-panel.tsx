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

import cls from 'classnames';
import { useGlobalVariableServiceState } from '@coze-workflow/variable';
import { VARIABLE_TYPE_ALIAS_MAP } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { IconCozEmpty } from '@coze-arch/coze-design/icons';
import { Select, Tag, Typography } from '@coze-arch/coze-design';

import { type Variable, type VariablesPanelProps } from '../types';
import styles from '../index.module.less';
import useRelatedVariable from './use-related-variable';

interface OptionProps extends Variable {
  checked?: boolean;
  onSelect?: (v?: string) => void;
}

const OptionItem = (option: OptionProps) => (
  <Select.Option
    selected={option.checked}
    key={`${option.value}-${option.disabled}`}
    value={option.value}
    disabled={option.disabled}
    className={styles['variable-panel-option']}
    onSelect={v => option.onSelect?.(v?.value)}
  >
    <div
      style={{
        maxWidth: '100%',
      }}
      className={
        'flex items-center justify-between pl-32px pr-8px pt-2px pb-2px'
      }
    >
      <Typography.Text
        className={cls('flex-1 leading-20px', {
          [styles['variable-option-checked']]: option.checked,
        })}
        disabled={option.disabled}
        ellipsis={{ showTooltip: true }}
        style={{
          fontSize: 12,
          marginRight: 4,
        }}
      >
        {option.name}
      </Typography.Text>

      <Tag disabled={option.disabled} size="mini" color="primary">
        {VARIABLE_TYPE_ALIAS_MAP[option.type]}
      </Tag>
    </div>
  </Select.Option>
);

interface EmptyProps {
  className?: string;
}

export const EmptyVariableContent = ({ className }: EmptyProps) => {
  const { type } = useGlobalVariableServiceState();
  const isSelectedBotOrProject = Boolean(type);

  return useMemo(() => {
    const getEmptyMsg = () => {
      if (isSelectedBotOrProject) {
        return I18n.t(
          'variable_binding_there_are_no_variables_in_this_project',
        );
      }

      return I18n.t('variable_select_empty_library_tips');
    };

    return (
      <div className={cls(className, styles['empty-block'])}>
        <IconCozEmpty
          style={{ fontSize: '32px', color: 'rgba(52, 60, 87, 0.72)' }}
        />
        <span className={styles.text}>{getEmptyMsg()}</span>
      </div>
    );
  }, [isSelectedBotOrProject]);
};

export default function VariablePanel({
  onVariableSelect,
  variableValue,
  variablePanelStyle,
  variablesFormatter,
}: VariablesPanelProps) {
  const { globalVariables } = useRelatedVariable({ variablesFormatter });

  return (
    <>
      {globalVariables.length > 0 && (
        <div
          className={
            'coz-fg-secondary mt-8px mb-4px pl-28px text-[12px] font-medium leading-16px'
          }
        >
          {I18n.t(
            'variable_binding_please_select_a_variable',
            {},
            '请先选择变量',
          )}
        </div>
      )}

      <div className={'h-[292px] overflow-y-auto'} style={variablePanelStyle}>
        {globalVariables.map(e => (
          <OptionItem
            {...e}
            onSelect={onVariableSelect}
            checked={variableValue === e.value}
          />
        ))}

        {globalVariables.length <= 0 && <EmptyVariableContent />}
      </div>
    </>
  );
}
