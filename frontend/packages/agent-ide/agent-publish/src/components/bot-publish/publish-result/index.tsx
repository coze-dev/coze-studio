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

/* eslint-disable @coze-arch/max-line-per-function */
import { NavLink, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { useMemo } from 'react';

import { partition } from 'lodash-es';
import classNames from 'classnames';
import { useIsPublishRecordReady } from '@coze-studio/publish-manage-hooks';
import { IntelligenceType } from '@coze-arch/idl/intelligence_api';
import { I18n } from '@coze-arch/i18n';
import { IconCozInfoCircleFill } from '@coze-arch/coze-design/icons';
import { type DynamicParams } from '@coze-arch/bot-typings/teamspace';
import { type ColumnProps } from '@coze-arch/bot-semi/Table';
import {
  Avatar,
  Banner,
  UITable,
  UITag,
  Typography,
  Tag,
  Space,
} from '@coze-arch/bot-semi';
import { useFlags } from '@coze-arch/bot-flags';
import {
  BindType,
  PublishResultStatus,
} from '@coze-arch/bot-api/developer_api';
import { PublishPlatformDescription } from '@coze-agent-ide/space-bot/component';
import {
  type PublishResultInfo,
  type ConnectResultInfo,
} from '@coze-agent-ide/space-bot';

import { PublishResultArea } from './component/publish-result-area';
import styles from '../index.module.less';

interface PublishResultProps {
  // Hidden Banner
  hiddenBanner?: boolean;
  publishResult?: PublishResultInfo;
}

// eslint-disable-next-line complexity
export const PublishResult = ({
  hiddenBanner,
  publishResult,
}: PublishResultProps) => {
  const { bot_id: botId, space_id: spaceId } = useParams<DynamicParams>();

  const columns = useMemo(() => {
    const columnList: ColumnProps<ConnectResultInfo>[] = [
      {
        title: (
          <div className="pl-4">{I18n.t('bot_publish_columns_platform')}</div>
        ),
        render: record => (
          <Space style={{ width: '100%' }} className="pl-4">
            <Avatar
              size="small"
              shape="square"
              src={record.icon}
              className={styles['platform-avater']}
            ></Avatar>
            <Typography.Text
              className={styles['platform-name']}
              ellipsis={{
                showTooltip: {
                  opts: {
                    content: record?.name,
                    style: { wordWrap: 'break-word' },
                  },
                },
              }}
            >
              {record?.name}
            </Typography.Text>

            {record?.desc ? (
              <PublishPlatformDescription desc={record.desc} />
            ) : null}
          </Space>
        ),
      },
      {
        title: I18n.t('bot_publish_columns_result'),
        dataIndex: 'publish_status',
        width: 400,
        render: (status, record) => {
          const color =
            status === PublishResultStatus.InReview ? 'orange' : 'red';
          const showStatus =
            status === PublishResultStatus.InReview
              ? I18n.t('bot_publish_columns_status_in_review')
              : I18n.t('bot_publish_columns_status_failed');
          switch (status) {
            case PublishResultStatus.Success:
              return record.id !== FLOW_PUBLISH_ID ? (
                <PublishResultArea record={record} />
              ) : (
                <Space className={styles['config-status']}>
                  <UITag color={'green'}>{I18n.t('Success')}</UITag>
                </Space>
              );
            case PublishResultStatus.InReview:
            case PublishResultStatus.Failed:
              return (
                <Space
                  className={classNames(styles['config-status'], 'w-full pr-3')}
                >
                  <Tag color={color} className="min-w-min	">
                    {showStatus}
                  </Tag>
                  {record?.fail_text ? (
                    <Typography.Text
                      ellipsis={{
                        showTooltip: {
                          opts: {
                            content: (
                              <ReactMarkdown
                                skipHtml
                                className={styles.markdown}
                                linkTarget="_blank"
                              >
                                {record.fail_text}
                              </ReactMarkdown>
                            ),
                            style: { wordWrap: 'break-word' },
                          },
                        },
                      }}
                    >
                      {
                        <ReactMarkdown
                          skipHtml
                          className={styles.markdown}
                          linkTarget="_blank"
                        >
                          {record.fail_text}
                        </ReactMarkdown>
                      }
                    </Typography.Text>
                  ) : null}
                </Space>
              );
            default:
              break;
          }
        },
      },
    ];
    return columnList;
  }, [publishResult]);

  const isAllPlatformSuccess = publishResult?.connectorResult?.every(
    r => r.publish_status === PublishResultStatus.Success,
  );
  const isAllFailPublish = isAllPlatformSuccess
    ? false
    : publishResult?.connectorResult?.every(
        item => item.publish_status === PublishResultStatus.Failed,
      );

  const [publishResultForOpen, publishResultForChannel] = useMemo(
    () =>
      partition(publishResult?.connectorResult ?? [], d =>
        [BindType.ApiBind, BindType.WebSDKBind].includes(d?.bind_type),
      ),
    [publishResult],
  );

  const [FLAGS] = useFlags();

  const { ready, inited } = useIsPublishRecordReady({
    type: IntelligenceType.Bot,
    spaceId: String(spaceId),
    intelligenceId: String(botId),
    enable: FLAGS['bot.studio.publish_management'] && !IS_OPEN_SOURCE,
  });

  return (
    <div className={styles['publish-result-container']}>
      {Boolean(publishResult?.connectorResult?.length) && (
        <section>
          {!hiddenBanner && (
            <Banner
              className="mb-[24px] p-[24px] flex flex-col"
              fullMode={false}
              type="info"
              bordered
              icon={null}
              closeIcon={null}
              data-testid="agent-ide.publish-result"
            >
              <div className={styles['publish-result-tip']}>
                {isAllFailPublish
                  ? `⚠️ ${I18n.t('publish_result_all_failed')}`
                  : `🎉  ${I18n.t('publish_success')}`}
              </div>
              {/* The open-source version does not currently support this function */}
              {IS_OVERSEA && !publishResult?.monetizeConfigSuccess ? (
                <div className="mt-[12px] flex items-center gap-[8px] coz-fg-primary">
                  <IconCozInfoCircleFill className="coz-fg-hglt-yellow" />
                  <span className="text-[12px] leading-[16px]">
                    {I18n.t('monetization_publish_fail')}
                  </span>
                </div>
              ) : null}
              {/* The open-source version does not currently support this function */}
              {FLAGS['bot.studio.publish_management'] && !IS_OPEN_SOURCE ? (
                <div className="coz-fg-dim text-[12px]">
                  {I18n.t('release_management_detail1', {
                    button: (
                      <NavLink
                        className={classNames(
                          'no-underline',
                          ready || !inited
                            ? 'coz-fg-hglt'
                            : 'coz-fg-secondary cursor-not-allowed',
                        )}
                        onClick={e => {
                          if (!ready) {
                            e.preventDefault();
                          }
                        }}
                        to={`/space/${spaceId}/publish/agent/${botId}`}
                      >
                        {I18n.t('release_management')}
                        {ready || !inited
                          ? null
                          : `(${I18n.t('release_management_generating')})`}
                      </NavLink>
                    ),
                  })}
                </div>
              ) : null}
            </Banner>
          )}

          {!!publishResultForChannel.length && (
            <UITable
              tableProps={{
                columns,
                dataSource: publishResultForChannel,
                className: classNames(styles['publish-table']),
                rowKey: 'id',
              }}
              wrapperClassName={styles['publish-table-wrapper']}
            />
          )}
          {!!publishResultForOpen.length && (
            <UITable
              tableProps={{
                columns,
                dataSource: publishResultForOpen,
                className: classNames(styles['publish-table']),
                rowKey: 'id',
              }}
              wrapperClassName={styles['publish-table-wrapper']}
            />
          )}
        </section>
      )}
    </div>
  );
};
