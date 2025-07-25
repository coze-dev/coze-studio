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
 
import React from 'react';

import { I18n } from '@coze-arch/i18n';
import { Tooltip } from '@coze-arch/coze-design';

import { AddButton } from '@/form';

export interface AddOptionButtonProps {
  /** 是否展示标题行 */
  showTitleRow?: boolean;

  /** 是否展示选项标签 */
  showOptionName?: boolean;

  /** 选项 placeholder */
  optionPlaceholder?: string;

  /** 默认分支名称 */
  defaultOptionText?: string;

  /** 选项最大数量限制，默认值为整数最大值 */
  maxItems?: number;

  /** 展示禁止添加 Tooltip */
  showDisableAddTooltip?: boolean;
  customDisabledAddTooltip?: string;
  className?: string;
  dataTestId?: string;
  value;
  onClick;
  readonly;
  children;
}

export const AddOptionButton = ({
  className,
  showDisableAddTooltip = true,
  maxItems = Number.MAX_SAFE_INTEGER,
  customDisabledAddTooltip,
  value,
  onClick,
  readonly,
  children,
  dataTestId,
}: AddOptionButtonProps) =>
  showDisableAddTooltip && (value?.length as number) >= maxItems ? (
    <Tooltip
      content={
        customDisabledAddTooltip ||
        I18n.t('workflow_250117_05', { maxCount: maxItems })
      }
    >
      <AddButton
        className={className}
        children={children}
        dataTestId={dataTestId}
      />
    </Tooltip>
  ) : (
    <AddButton
      className={className}
      disabled={readonly}
      children={children}
      onClick={onClick}
      dataTestId={dataTestId}
    />
  );
