import React from 'react';

import { Avatar, Typography } from '@coze-arch/coze-design';
import { type NodeEvent } from '@coze-arch/bot-api/workflow_api';

import styles from './node-event-info.module.less';

interface NodeEventInfoProps {
  event: NodeEvent | undefined;
}

export const NodeEventInfo: React.FC<NodeEventInfoProps> = ({ event }) => {
  if (!event) {
    return null;
  }
  return (
    <div className={styles['node-event-info']}>
      <Avatar src={event.node_icon} shape="square" size="extra-extra-small" />
      <Typography.Text>{event.node_title}</Typography.Text>
    </div>
  );
};
