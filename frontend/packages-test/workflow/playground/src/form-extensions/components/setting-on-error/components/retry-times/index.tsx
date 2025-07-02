import { type FC } from 'react';

import { I18n } from '@coze-arch/i18n';
import { Select } from '@coze-arch/coze-design';

import { type SettingOnErrorItemProps } from '../../types';

/**
 * 重试次数
 */
export const RetryTimes: FC<SettingOnErrorItemProps<number>> = ({
  value,
  onChange,
  readonly,
}) => (
  <Select
    size="small"
    data-testid="setting-on-error-retry-times"
    optionList={[
      { label: I18n.t('workflow_250416_06', undefined, '不重试'), value: 0 },
      { label: I18n.t('workflow_250416_07', undefined, '重试1次'), value: 1 },
    ]}
    value={value ?? 0}
    onChange={v => {
      onChange?.(v as number);
    }}
    disabled={readonly}
  />
);
