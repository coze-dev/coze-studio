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

import React, { useEffect, useState } from 'react';
import {
  Typography,
  Empty,
  Spin,
  Space,
  Button,
  notification,
  Tooltip,
} from '@coze-arch/coze-design';
import {
  IconCozRefresh,
  IconCozCheckMarkCircleFill,
} from '@coze-arch/coze-design/icons';
import { I18n } from '@coze-arch/i18n';
import { external_knowledge } from '@coze-studio/api-schema';
import { formatDate } from '@coze-arch/bot-utils';
import placeholderImg from '../falcon/assets/placeholder.png';
import './index.scss';

const { Text } = Typography;

interface RAGFlowDataset {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  document_count: number;
  chunk_count: number;
  token_num: number;
  language: string;
  embedding_model: string;
  create_date: string;
  create_time: number;
  update_date: string;
  update_time: number;
  status: number;
}

const ExternalKnowledgePage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [datasets, setDatasets] = useState<RAGFlowDataset[]>([]);
  const [hasBinding, setHasBinding] = useState(true);

  const fetchDatasets = async () => {
    setLoading(true);
    try {
      const response = await external_knowledge.GetRAGFlowDatasets({});

      if (response.code === 0) {
        setDatasets(response.data || []);
        setHasBinding(true);
      } else if (response.code === 403) {
        // No enabled binding found
        setHasBinding(false);
        notification.warning({
          message: I18n.t(
            'external_knowledge_no_binding_title',
            {},
            '未配置绑定',
          ),
          description: I18n.t(
            'external_knowledge_no_binding_desc',
            {},
            '请先在设置中配置外部知识库绑定',
          ),
        });
      } else {
        notification.error({
          message: I18n.t('external_knowledge_fetch_error', {}, '获取失败'),
          description:
            response.msg ||
            I18n.t(
              'external_knowledge_fetch_error_desc',
              {},
              '无法获取知识库列表',
            ),
        });
      }
    } catch (error: any) {
      console.error('Failed to fetch datasets:', error);
      notification.error({
        message: I18n.t('external_knowledge_fetch_error', {}, '获取失败'),
        description: I18n.t(
          'external_knowledge_network_error',
          {},
          '网络请求失败，请稍后重试',
        ),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const renderEmptyState = () => {
    if (!hasBinding) {
      return (
        <div
          className="flex flex-col items-center justify-center"
          style={{ minHeight: 400 }}
        >
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div className="text-center">
                <Text className="coz-fg-tertiary">
                  {I18n.t(
                    'external_knowledge_no_binding_hint',
                    {},
                    '您还未配置外部知识库绑定',
                  )}
                </Text>
                <div className="mt-4">
                  <Button
                    type="primary"
                    onClick={() => {
                      // Navigate to settings
                      const accountBtn = document.querySelector(
                        '[data-testid="account-dropdown-trigger"]',
                      );
                      if (accountBtn instanceof HTMLElement) {
                        accountBtn.click();
                      }
                    }}
                  >
                    {I18n.t('external_knowledge_go_settings', {}, '前往设置')}
                  </Button>
                </div>
              </div>
            }
          />
        </div>
      );
    }

    return (
      <div
        className="flex flex-col items-center justify-center"
        style={{ minHeight: 400 }}
      >
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <Text className="coz-fg-tertiary">
              {I18n.t('external_knowledge_no_datasets', {}, '暂无知识库')}
            </Text>
          }
        />
      </div>
    );
  };

  const renderDatasetCard = (dataset: RAGFlowDataset) => {
    return (
      <div
        key={dataset.id}
        className="knowledge-library-item bg-white rounded-lg border border-gray-300 shadow-sm p-4 hover:shadow-lg transition-all duration-200 cursor-pointer"
      >
        <div className="flex-col">
          {/* 图标区域 - 与系统风格一致 */}
          <div
            className="w-full h-[122px] px-[25px] py-[25px] bg-[#F9FAFD] rounded-[6px] relative"
            style={{
              background: `#F9FAFD url("${placeholderImg}") no-repeat center center / 72px auto`,
            }}
          >
            {/* 状态标记 */}
            {dataset.status === 1 && (
              <div className="absolute top-2 right-2">
                <div className="px-2 py-1 bg-green-50 rounded text-xs text-green-600">
                  {I18n.t('external_knowledge_status_active', {}, '活跃')}
                </div>
              </div>
            )}

            <div
              className="w-full h-full flex items-center justify-center"
              style={{
                background: dataset.avatar
                  ? `url("${dataset.avatar}") no-repeat center center / contain`
                  : undefined,
              }}
            >
              {!dataset.avatar && (
                <div className="text-4xl font-bold text-gray-400">
                  {dataset.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          {/* 信息区域 */}
          <div className="flex flex-col gap-[2px] mt-[10px]">
            <div className="h-[20px] flex-shrink-0">
              <Space spacing={4} className="w-full">
                <Typography.Text
                  data-testid="workspace.library.item.name"
                  className="h-[20px] text-[16px] coz-fg-primary leading-[20px]"
                  style={{ maxWidth: '200px' }}
                  ellipsis={{ showTooltip: true }}
                >
                  <span className="font-[600]">{dataset.name}</span>
                </Typography.Text>

                {dataset.status === 1 && (
                  <IconCozCheckMarkCircleFill
                    data-testid="workspace.library.item.publish.status"
                    className="flex-shrink-0 w-[16px] h-[16px] coz-fg-hglt-green"
                  />
                )}
              </Space>
            </div>

            {/* 描述 */}
            <div className="flex-shrink leading-[0] mt-[12px] flex-1">
              <Typography.Text
                className="text-[14px] leading-[20px] coz-fg-tertiary"
                style={{ maxWidth: '240px' }}
                ellipsis={{ rows: 2, showTooltip: true }}
              >
                {dataset.description ||
                  I18n.t('external_knowledge_no_description', {}, '暂无描述')}
              </Typography.Text>
            </div>

            {/* 统计信息 */}
            <div className="mt-[12px] flex items-center gap-3">
              <Space spacing={8} className="text-[12px] coz-fg-quaternary">
                <Tooltip
                  title={I18n.t('external_knowledge_documents', {}, '文档数量')}
                >
                  <span>
                    {formatNumber(dataset.document_count)}{' '}
                    {I18n.t('external_knowledge_docs_short', {}, '文档')}
                  </span>
                </Tooltip>
                <span className="text-gray-300">·</span>
                <Tooltip
                  title={I18n.t('external_knowledge_chunks', {}, '片段数量')}
                >
                  <span>
                    {formatNumber(dataset.chunk_count)}{' '}
                    {I18n.t('external_knowledge_chunks_short', {}, '片段')}
                  </span>
                </Tooltip>
                <span className="text-gray-300">·</span>
                <Tooltip
                  title={I18n.t('external_knowledge_tokens', {}, 'Token 数量')}
                >
                  <span>{formatNumber(dataset.token_num)} Tokens</span>
                </Tooltip>
              </Space>
            </div>

            {/* 更新时间 */}
            <div className="mt-[8px] flex items-center gap-2">
              <Text className="text-[12px] coz-fg-quaternary">
                {I18n.t('external_knowledge_updated', {}, '更新于')}{' '}
                {formatDate(Math.floor(dataset.update_time / 1000))}
              </Text>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="external-knowledge-page w-full h-full bg-gray-50">
      {/* 页面头部 */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Typography.Title level={4} className="mb-0">
              {I18n.t('external_knowledge_title', {}, '外部知识库')}
            </Typography.Title>
            <Text className="coz-fg-tertiary text-[14px]">
              {I18n.t('external_knowledge_subtitle', {}, '')}
            </Text>
          </div>
          <Button
            type="tertiary"
            icon={<IconCozRefresh />}
            onClick={fetchDatasets}
            loading={loading}
          >
            {I18n.t('external_knowledge_refresh', {}, '刷新')}
          </Button>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="p-6">
        {loading ? (
          <div
            className="flex justify-center items-center"
            style={{ minHeight: 400 }}
          >
            <Spin size="large" />
          </div>
        ) : datasets.length === 0 ? (
          renderEmptyState()
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {datasets.map(dataset => renderDatasetCard(dataset))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExternalKnowledgePage;
