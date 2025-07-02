import { type FC } from 'react';

import classNames from 'classnames';
import { Tooltip } from '@coze-arch/coze-design';
import { Checkbox } from '@coze-arch/bot-semi';
import { IconInfo } from '@coze-arch/bot-icons';

import styles from './index.module.less';

export interface CheckboxItemProps {
  checked?: boolean;
  label?: string;
  tooltip?: React.ReactNode;
  tipWrapperClassName?: string;
  description?: string;
  children?: React.ReactNode;
  readonly?: boolean;
  disabled?: boolean;
  needCheckBox?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onChange?: (checked: boolean) => void;
  dataTestId?: string;
}

export const CheckboxWithLabel: FC<CheckboxItemProps> = ({
  checked,
  label,
  description,
  tooltip,
  tipWrapperClassName,
  children,
  needCheckBox = true,
  className,
  style,
  readonly,
  disabled,
  onChange,
  dataTestId,
}) => (
  <div
    className={classNames('flex flex-col gap-[4px] py-[4px]', className)}
    style={style}
  >
    <div className="flex items-center gap-[8px]">
      {needCheckBox ? (
        <div>
          <Checkbox
            className={styles['checkbox-small']}
            checked={checked}
            disabled={readonly || disabled}
            onChange={e => onChange?.(e?.target?.checked as boolean)}
            data-testid={dataTestId}
          />
        </div>
      ) : null}
      <div className="flex items-center gap-[4px] text-[12px] text-[#060709CC]">
        {label}
        {tooltip ? (
          <Tooltip className={tipWrapperClassName} content={tooltip}>
            <IconInfo
              className={styles['lable-wrapper']}
              style={{
                color: 'rgba(167, 169, 176, 1)',
                cursor: 'pointer',
              }}
            />
          </Tooltip>
        ) : null}
      </div>
    </div>
    {description ? (
      <div style={{ paddingLeft: '24px' }}>
        <span className={styles.description}>{description}</span>
      </div>
    ) : null}
    {children}
  </div>
);
