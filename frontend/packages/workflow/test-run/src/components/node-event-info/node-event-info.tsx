/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
