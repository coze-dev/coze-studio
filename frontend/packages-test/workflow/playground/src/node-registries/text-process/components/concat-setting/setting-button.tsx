import React from 'react';

import { I18n } from '@coze-arch/i18n';
import { IconCozSetting } from '@coze-arch/coze-design/icons';
import { Popover, IconButton } from '@coze-arch/coze-design';

import { type DelimiterSelectorValue } from '@/form-extensions/setters/delimiter-selector';
import { useField, withField } from '@/form';

import { SettingForm } from './setting-form';

import styles from './index.module.less';

export const SettingButtonField = withField(() => {
  const { value, onChange, readonly } = useField<DelimiterSelectorValue>();

  const formSetting = {
    formTitle: I18n.t('workflow_stringprocess_concat_array_title'),
    formDescription: I18n.t('workflow_stringprocess_concat_array_desc'),
  };

  return (
    <Popover
      keepDOM
      stopPropagation
      trigger="click"
      position="bottomRight"
      className={styles['setting-popover']}
      content={
        readonly ? null : (
          <SettingForm
            settingInfo={formSetting}
            value={value as DelimiterSelectorValue}
            onChange={v => {
              onChange?.(v);
            }}
          />
        )
      }
    >
      <IconButton
        size="small"
        disabled={readonly}
        icon={<IconCozSetting className="text-sm" />}
        color="highlight"
      />
    </Popover>
  );
});
