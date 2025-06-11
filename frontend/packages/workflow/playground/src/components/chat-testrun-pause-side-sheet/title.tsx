import { type FC } from 'react';

import { I18n } from '@coze-arch/i18n';
import { Tag, Typography } from '@coze/coze-design';

export const Title: FC<{
  icon: string;
}> = props => {
  const { icon } = props;
  return (
    <div className="flex items-center gap-2 mb-3">
      <img src={icon} width={16} height={16} />
      <Typography.Title heading={6}>
        {I18n.t('scene_workflow_chat_node_name', {}, 'Role scheduling')}
      </Typography.Title>
      <Tag color="cyan" loading>
        {I18n.t('scene_workflow_chat_node_test_run_running', {}, 'Running')}
      </Tag>
    </div>
  );
};
