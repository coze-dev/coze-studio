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
