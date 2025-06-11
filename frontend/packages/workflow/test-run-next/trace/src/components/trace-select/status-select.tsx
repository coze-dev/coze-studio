import { useCallback } from 'react';

import { I18n } from '@coze-arch/i18n';
import { IconCozFilter } from '@coze/coze-design/icons';
import { Select, IconButton } from '@coze/coze-design';
import { SpanStatus } from '@coze-arch/bot-api/workflow_api';

interface StatusSelectProps {
  value: SpanStatus;
  onChange: (v: SpanStatus) => void;
}

export const StatusSelect: React.FC<StatusSelectProps> = ({
  value,
  onChange,
}) => {
  const triggerRender = useCallback(
    () => (
      <IconButton icon={<IconCozFilter />} color="secondary" size="small" />
    ),
    [],
  );

  return (
    <Select
      value={value}
      triggerRender={triggerRender}
      optionList={[
        {
          value: SpanStatus.Unknown,
          label: I18n.t('query_status_all'),
        },
        {
          value: SpanStatus.Fail,
          label: I18n.t('query_status_failed'),
        },
        {
          value: SpanStatus.Success,
          label: I18n.t('query_status_completed'),
        },
      ]}
      onChange={onChange as any}
    />
  );
};
