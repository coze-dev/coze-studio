import React from 'react';

import { I18n } from '@coze-arch/i18n';
import { Tooltip } from '@coze/coze-design';

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
