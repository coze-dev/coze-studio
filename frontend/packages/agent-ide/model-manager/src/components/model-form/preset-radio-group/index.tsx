import { type CSSProperties } from 'react';

import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { RadioGroup } from '@coze-arch/bot-semi';
import { ModelStyle } from '@coze-arch/bot-api/developer_api';

import styles from './index.module.less';
export interface PresetRadioOption {
  label: string;
  value: ModelStyle;
}

const getOptions: () => PresetRadioOption[] = () => [
  { label: I18n.t('model_config_generate_precise'), value: ModelStyle.Precise },
  { label: I18n.t('model_config_generate_balance'), value: ModelStyle.Balance },
  {
    label: I18n.t('model_config_generate_creative'),
    value: ModelStyle.Creative,
  },
  {
    label: I18n.t('model_config_generate_customize'),
    value: ModelStyle.Custom,
  },
];

export interface PresetRadioGroupProps {
  onChange: (value: ModelStyle) => void;
  value: ModelStyle;
  className?: string;
  style?: CSSProperties;
  disabled?: boolean;
}

export const PresetRadioGroup: React.FC<PresetRadioGroupProps> = ({
  onChange,
  className,
  style,
  value,
  disabled,
}) => (
  <RadioGroup
    disabled={disabled}
    className={classNames(styles['button-radio'], className)}
    style={style}
    options={getOptions()}
    value={value}
    onChange={e => {
      onChange(e.target.value);
    }}
    type="button"
  />
);
