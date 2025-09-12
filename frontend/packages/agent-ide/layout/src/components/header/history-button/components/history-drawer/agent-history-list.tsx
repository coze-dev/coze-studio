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

import { type FC, useEffect, useState } from 'react';

import { useRequest } from 'ahooks';
import classNames from 'classnames';
import { type HistoryInfo, HistoryType } from '@coze-arch/bot-api/developer_api';
import { I18n } from '@coze-arch/i18n';
import { IconCozFocus } from '@coze-arch/coze-design/icons';
import {
  Button,
  Spin,
  Typography,
  Timeline,
  Avatar,
  Space,
  Tag,
  Menu,
  IconButton,
} from '@coze-arch/coze-design';
import { IconCozMore } from '@coze-arch/coze-design/icons';
import dayjs from 'dayjs';

import { useAgentHistoryAction } from './use-agent-history-action';

interface AgentHistoryListProps {
  spaceId: string;
  botId: string;
  activeTab: string;
  /** 当前选中的版本 */
  selectedVersion?: string;
  /** 版本选中回调 */
  onVersionSelect?: (version: string) => void;
}

export const AgentHistoryList: FC<AgentHistoryListProps> = ({
  spaceId,
  botId,
  selectedVersion,
  onVersionSelect,
}) => {
  const [historyList, setHistoryList] = useState<HistoryInfo[]>([]);

  const { resetToHistory, viewHistoryInCurrentPage, viewHistoryInNewPage, showCurrent } = useAgentHistoryAction();

  // 获取智能体发布历史
  const { loading, run: fetchHistory } = useRequest(
    async () => {
      // 调用真实的API接口获取智能体发布历史
      try {
        const response = await fetch('/api/draftbot/list_draft_history', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            space_id: spaceId,
            bot_id: botId,
            page_index: 1,
            page_size: 50,
            history_type: HistoryType.FLAG,
            connector_id: "",
          }),
        });

        const result = await response.json();

        if (result.code === 0 && result.data?.history_infos) {
          // 转换后端数据格式为前端期望的格式
          const convertedHistoryList: HistoryInfo[] = result.data.history_infos.map((item: any) => {

            // 时间戳处理：后端返回的是秒级时间戳，转换为毫秒级
            const timestamp = parseInt(item.create_time);
            const created_time = timestamp * 1000; // 秒级转毫秒级

            return {
              version: item.version,
              created_time: created_time,
              creator_info: {
                name: item.creator?.name || '未知用户',
                avatar_url: item.creator?.avatar_url,
              },
              publish_info: item.info || '', // 后端返回info字段
              connector_infos: item.connector_infos || [],
              history_type: item.history_type,
              publish_id: item.publish_id,
            };
          });

          // 直接在这里设置状态
          setHistoryList(convertedHistoryList);

          return {
            data: {
              history_list: convertedHistoryList,
            }
          };
        } else {
          console.error('API返回错误:', result);
          setHistoryList([]);
          return {
            data: {
              history_list: [],
            }
          };
        }
      } catch (error) {
        console.error('获取智能体历史失败:', error);
        setHistoryList([]);
        return {
          data: {
            history_list: [],
          }
        };
      }
    },
    {
      manual: false,
      refreshDeps: [spaceId, botId],
    }
  );

  const handleViewHistory = async (item: HistoryInfo) => {
    if (item.version && onVersionSelect) {
      onVersionSelect(item.version);
    }
    // 调用查看历史版本，以只读模式显示
    await viewHistoryInCurrentPage(item);
    // 注意：不关闭抽屉，让用户可以继续选择其他版本
  };
  const handleViewHistoryNewPage = async (item: HistoryInfo) => {
    await viewHistoryInNewPage(item);
  };

  const handleResetToHistory = async (item: HistoryInfo) => {
    await resetToHistory(item);
    // 重新获取历史列表
    fetchHistory();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (!historyList.length) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <Typography.Text type="secondary">
          {I18n.t('暂无发布历史')}
        </Typography.Text>
      </div>
    );
  }

  return (
    <div className="p-4">
      <Timeline>
        {/* 当前版本 */}
        <Timeline.Item
          type="warning"
          dot={selectedVersion === 'current' ? <IconCozFocus /> : undefined}
        >
          <div
            className={classNames(
              'relative top-[-8px] p-2 rounded-mini',
              selectedVersion === 'current'
                ? 'coz-mg-hglt'
                : 'hover:coz-mg-secondary',
              'cursor-pointer',
            )}
            onClick={() => {
              if (onVersionSelect) {
                onVersionSelect('current');
              }
              showCurrent();
            }}
          >
            <Typography.Text className="font-bold">
              {I18n.t('devops_publish_multibranch_Current')}
            </Typography.Text>
          </div>
        </Timeline.Item>

        {/* 历史版本 */}
        {historyList.map((item, index) => {
          // 确保item和必要字段存在
          if (!item || !item.version) {
            return null;
          }

          return (
            <Timeline.Item
              key={`history-${item.version || 'unknown'}-${item.created_time || index}-${index}`}
              type={index === 0 ? 'ongoing' : 'default'}
              dot={selectedVersion === item.version ? <IconCozFocus /> : undefined}
            >
            <div
              className={classNames(
                'relative top-[-8px] p-2 rounded-mini',
                selectedVersion === item.version
                  ? 'coz-mg-hglt'
                  : 'hover:coz-mg-secondary',
                'cursor-pointer',
              )}
              onClick={() => handleViewHistory(item)}
            >
              {/* 版本标签 */}
              <div className="mb-2">
                <Tag size="small" color="green">
                  v{item.version || 'unknown'}
                </Tag>
              </div>

              {/* 发布说明 */}
              {item.publish_info && (
                <div className="mb-2">
                  <Typography.Text ellipsis={{ rows: 4, showTooltip: true }}>
                    {item.publish_info}
                  </Typography.Text>
                </div>
              )}

              {/* 连接器信息 */}
              {item.connector_infos && item.connector_infos.length > 0 && (
                <div className="mb-2">
                  <Space wrap>
                    {item.connector_infos.map((connector: any) => (
                      <Tag key={connector.id} size="small" color="blue">
                        {connector.name}
                      </Tag>
                    ))}
                  </Space>
                </div>
              )}

              {/* 底部信息：用户和时间 + 操作菜单 */}
              <div className="flex items-end">
                <div>
                  <div className="min-w-0 flex items-center mb-1">
                    <Avatar
                      className="mr-2 flex-shrink-0"
                      size="extra-extra-small"
                      src={item.creator_info?.avatar_url}
                      alt="avatar"
                    >
                      {item.creator_info?.name?.charAt(0)}
                    </Avatar>
                    <Typography.Text ellipsis fontSize="12px">
                      {item.creator_info?.name || '未知用户'}
                    </Typography.Text>
                  </div>
                  <Typography.Text type="secondary" fontSize="12px">
                    {item.created_time ? dayjs(item.created_time).format('YYYY-MM-DD HH:mm:ss') : '未知时间'}
                  </Typography.Text>
                </div>

                <div className="flex-1" />

                {/* 操作菜单 */}
                <Menu
                  className="min-w-[96px] mb-2px flex-shrink-0"
                  trigger="hover"
                  stopPropagation={true}
                  position="bottomRight"
                  render={
                    <Menu.SubMenu mode="menu">
                      <Menu.Item
                        onClick={(_, e) => {
                          e.stopPropagation();
                          handleViewHistory(item);
                        }}
                      >
                        {I18n.t('查看版本')}
                      </Menu.Item>
                      <Menu.Item
                        onClick={(_, e) => {
                          e.stopPropagation();
                          handleResetToHistory(item);
                        }}
                      >
                        {I18n.t('加载到草稿')}
                      </Menu.Item>
                    </Menu.SubMenu>
                  }
                >
                  <IconButton
                    color="secondary"
                    iconSize="small"
                    icon={<IconCozMore className="rotate-90" />}
                  />
                </Menu>
              </div>
            </div>
          </Timeline.Item>
          );
        }).filter(Boolean)}
      </Timeline>
    </div>
  );
};
