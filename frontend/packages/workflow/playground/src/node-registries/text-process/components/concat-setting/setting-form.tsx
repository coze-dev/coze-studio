import React from 'react';

import { debounce } from 'lodash-es';
import { I18n } from '@coze-arch/i18n';
import { Typography } from '@coze/coze-design';

import {
  BaseDelimiterSelector,
  type DelimiterSelectorValue,
} from '@/form-extensions/setters/delimiter-selector';
import { LabelWithTooltip } from '@/form-extensions/components/label-with-tooltip';

import { CONCAT_CHAR_SETTINGS } from '../../constants';
import { type SettingInfo } from './types';

import s from './index.module.less';

const DELAY_TIME = 500;

interface Props {
  readonly?: boolean;
  settingInfo?: SettingInfo;
  value: DelimiterSelectorValue;
  onChange: (value: DelimiterSelectorValue) => void;
}

export const SettingForm = ({
  settingInfo,
  value,
  readonly,
  onChange,
}: Props) => {
  const debouncedChange = debounce(onChange, DELAY_TIME);

  // 防止触发节点选中
  return (
    <div className={s['setting-form']} onClick={e => e.stopPropagation()}>
      {Boolean(settingInfo?.formTitle) && (
        <Typography.Title className={s['setting-form-title']}>
          {settingInfo?.formTitle}
        </Typography.Title>
      )}

      {Boolean(settingInfo?.formDescription) && (
        <Typography.Paragraph className={s['setting-form-desc']}>
          {settingInfo?.formDescription}
        </Typography.Paragraph>
      )}

      <LabelWithTooltip
        label={I18n.t('workflow_stringprocess_concat_array_symbol_title')}
        tooltip={I18n.t('workflow_textprocess_concat_symbol_tips')}
      />

      <BaseDelimiterSelector
        readonly={!!readonly}
        value={value}
        onChange={debouncedChange}
        options={CONCAT_CHAR_SETTINGS}
      />
    </div>
  );
};
