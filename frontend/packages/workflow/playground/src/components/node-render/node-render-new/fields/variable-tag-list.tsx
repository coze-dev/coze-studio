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

import React, { type ReactNode, useMemo } from 'react';

import classnames from 'classnames';
import {
  type ViewVariableType,
  VARIABLE_TYPE_ALIAS_MAP,
} from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { IconCozWarningCircle } from '@coze-arch/coze-design/icons';

import { OverflowTagList, type TagProps } from './overflow-tag-list';
import { VARIABLE_TYPE_ICON_MAP } from './constants';

import s from './variable-tag-list.module.less';

// state
export enum VariableTagStatus {
  Success = 'success',
  Warning = 'warning',
  Default = 'default',
}

export interface VariableTagProps {
  key?: string;
  /* Variable type */
  type?: ViewVariableType;
  /* Variable name, when empty, is displayed as Undefined/Undefined */
  label?: ReactNode;
  invalid?: boolean;
  status?: VariableTagStatus;
}

export interface VariableTagListProps {
  /* tag list */
  value?: VariableTagProps[];
  /**
   * The maximum width of each tag, the default is the width of the parent container
   */
  maxTagWidth?: number;
}

interface VariableTagRenderProps extends TagProps {
  invalid?: boolean;
  status?: VariableTagStatus;
}

export const VariableTagList: React.FC<VariableTagListProps> = ({
  value = [],
  maxTagWidth,
}) => {
  const renderTag = ({
    icon,
    label,
    invalid,
    status,
  }: VariableTagRenderProps) => {
    if (!status && invalid) {
      status = VariableTagStatus.Warning;
    }

    return (
      <div
        className={classnames(
          s.variableTag,
          'px-1 py-0.5 gap-0.5',
          s[`variable-tag_${status || 'default'}`],
        )}
      >
        <span
          className={classnames(s.variableTagIcon, 'text-lg', 'coz-fg-dim')}
        >
          {icon}
        </span>
        <span className={s.variableTagLabel} style={{ maxWidth: maxTagWidth }}>
          {label}
        </span>
      </div>
    );
  };

  const formattedValue = useMemo<VariableTagRenderProps[]>(
    () =>
      value.map(v => {
        const label = v.label || I18n.t('workflow_variable_undefined');
        const icon = v.type ? (
          VARIABLE_TYPE_ICON_MAP[v.type] || <IconCozWarningCircle />
        ) : (
          <IconCozWarningCircle />
        );
        const invalid = v.invalid || !v.label || !v.type;

        return {
          key: v.key,
          label,
          icon,
          invalid,
          tooltip: v.type ? VARIABLE_TYPE_ALIAS_MAP[v.type] : undefined,
          status: v.status,
        };
      }),
    [value],
  );
  return (
    <OverflowTagList<VariableTagRenderProps>
      value={formattedValue}
      enableTooltip
      tagItemRenderer={renderTag}
    />
  );
};
