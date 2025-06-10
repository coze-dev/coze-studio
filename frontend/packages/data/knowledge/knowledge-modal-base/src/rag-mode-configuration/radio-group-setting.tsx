import React, { type CSSProperties, type ReactNode } from 'react';

import classNames from 'classnames';
import { Radio, RadioGroup, Popover } from '@coze-arch/bot-semi';
import { IconInfo } from '@coze-arch/bot-icons';

import styles from './index.module.less';

export interface RadioItem {
  label: string;
  value: number;
  e2e?: string;
  tip?: ReactNode;
  tipStyle?: CSSProperties;
  desc?: string | ReactNode;
}

export interface RadioGroupSettingProps {
  options: RadioItem[];
  value: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}
export function RadioGroupSetting({
  options,
  value,
  disabled,
  onChange,
}: RadioGroupSettingProps) {
  const desc = options.find(v => v.value === value)?.desc;
  return (
    <div className={styles['radio-area']}>
      <RadioGroup
        onChange={e => onChange(e.target.value as number)}
        value={value}
        disabled={disabled}
      >
        {options.map(item => (
          <div
            data-testid={item.e2e}
            key={item.value}
            className={classNames(
              styles['radio-item'],
              value === item.value ? styles.active : styles.normal,
            )}
          >
            <Radio value={item.value}>{item.label}</Radio>
            {!!item.tip && (
              <Popover
                showArrow
                position="top"
                zIndex={1031}
                style={{
                  backgroundColor: '#41464c',
                  color: '#fff',
                  maxWidth: '276px',
                  ...(item.tipStyle || {}),
                }}
                content={item.tip}
              >
                <IconInfo className={styles['radio-item-icon']} />
              </Popover>
            )}
          </div>
        ))}
      </RadioGroup>
      {desc ? <div className={styles['radio-desc']}>{desc}</div> : null}
    </div>
  );
}
