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

import { Typography } from '@coze-arch/bot-semi';
import { type QuerySchemaConfig } from '@coze-arch/bot-api/developer_api';

import styles from './index.module.less';

export const ConnectorGuide = ({
  connectorConfigInfo = {},
}: {
  connectorConfigInfo?: QuerySchemaConfig;
}) => (
  <div className={styles.guide}>
    {connectorConfigInfo?.start_text ? (
      <ReactMarkdown
        skipHtml={true}
        linkTarget="_blank"
        className={styles.markdown}
      >
        {connectorConfigInfo?.start_text}
      </ReactMarkdown>
    ) : null}
    {connectorConfigInfo?.guide_link_url &&
    connectorConfigInfo?.guide_link_text ? (
      <div>
        <Typography.Text
          link={{
            href: connectorConfigInfo?.guide_link_url,
          }}
          className={styles['config-link']}
        >
          {connectorConfigInfo?.guide_link_text}
        </Typography.Text>
      </div>
    ) : null}
  </div>
);
