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

import ReactMarkdown from 'react-markdown';

import { Space, Typography } from '@coze-arch/bot-semi';
import { type CopyLinkAreaInfo } from '@coze-arch/bot-api/developer_api';

import { type TFormData } from '../types';

import styles from './index.module.less';

export const ConnectorLink = ({
  copyLinkAreaInfo = {},
  agentType = 'bot',
  botId = '',
  initValue = {},
}: {
  copyLinkAreaInfo?: CopyLinkAreaInfo;
  agentType?: 'bot' | 'project';
  botId: string;
  initValue?: TFormData;
}) => {
  //Support for wildcard URLs
  const formatUrl = (url?: string) => {
    let newUrl = url ?? '';
    if (newUrl) {
      if (agentType === 'project') {
        newUrl = newUrl.replace(/{project_id}/g, botId);
      } else {
        newUrl = newUrl.replace(/{bot_id}/g, botId);
      }
      newUrl = newUrl
        .replace(/{hostname}/g, window.location.hostname)
        .replace(/{corp_id}/g, initValue.corp_id);
    }

    return newUrl;
  };

  return (
    <div className={styles['link-area']}>
      {copyLinkAreaInfo?.title_text ? (
        <Space spacing={12} align="start">
          <span className={styles['step-order']}>
            {copyLinkAreaInfo.step_order || 1}
          </span>

          <div className={styles['step-content']}>
            <div className={styles['step-title']}>
              {copyLinkAreaInfo.title_text}
            </div>
          </div>
        </Space>
      ) : null}
      {copyLinkAreaInfo?.description ? (
        <ReactMarkdown skipHtml={true} className={styles.markdown}>
          {copyLinkAreaInfo.description}
        </ReactMarkdown>
      ) : null}

      {copyLinkAreaInfo?.link_list?.length ? (
        <div className={styles['link-list']}>
          {copyLinkAreaInfo?.link_list.map(item => (
            <div key={item.link} style={{ marginBottom: 32 }}>
              <Typography.Title className={styles.title}>
                {item.title}
              </Typography.Title>
              <Typography.Text className={styles.link} copyable>
                {formatUrl(item.link)}
              </Typography.Text>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};
