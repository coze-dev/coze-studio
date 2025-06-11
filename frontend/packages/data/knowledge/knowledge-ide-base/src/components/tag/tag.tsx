import { type FC } from 'react';

import { I18n } from '@coze-arch/i18n';
import { Tag, Tooltip } from '@coze/coze-design';

interface FailedTagProps {
  statusDescription: string | undefined;
}
export const FailedTag: FC<FailedTagProps> = ({ statusDescription }) => (
  <Tooltip content={statusDescription}>
    <span>
      <Tag color="red" size="small">
        {I18n.t('bot_publish_columns_status_failed')}
      </Tag>
    </span>
  </Tooltip>
);
