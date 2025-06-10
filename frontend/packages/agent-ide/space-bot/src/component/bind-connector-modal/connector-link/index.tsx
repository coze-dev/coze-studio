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
  //支持通配URL
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
