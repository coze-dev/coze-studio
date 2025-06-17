import { type FC } from 'react';

import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { Select as CozSelect } from '@coze-arch/coze-design';

import { type LiteralValueInputProps } from './type';

export const InputSelect: FC<LiteralValueInputProps> = ({
  className,
  value,
  defaultValue,
  disabled,
  testId,
  onChange,
  onFocus,
  placeholder,
  validateStatus,
  style,
  config,
}) => {
  const { optionsList } = config || {};

  return (
    <CozSelect
      className={classNames(className)}
      data-testid={testId}
      disabled={disabled}
      defaultValue={defaultValue as string}
      onChange={v => onChange?.(v as string)}
      optionList={optionsList}
      value={value as string}
      onFocus={onFocus}
      placeholder={
        placeholder || I18n.t('workflow_detail_node_input_entervalue')
      }
      validateStatus={validateStatus}
      style={style}
      size="small"
      dropdownClassName="text-[12px]"
    />
  );
};
