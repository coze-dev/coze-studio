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

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Typography,
  Empty,
  Spin,
  Space,
  Button,
  notification,
  Tooltip,
  Modal,
  Input,
  Dropdown,
  IconButton,
} from '@coze-arch/coze-design';
import {
  IconCozRefresh,
  IconCozCheckMarkCircleFill,
  IconCozMore,
} from '@coze-arch/coze-design/icons';
import { I18n } from '@coze-arch/i18n';
import { formatDate } from '@coze-arch/bot-utils';
import placeholderImg from '../falcon/assets/placeholder.png';
import './index.scss';

const { Text } = Typography;

type NotificationKind = 'success' | 'error' | 'warning' | 'info';

const emitNotification = (
  type: NotificationKind,
  config: { message?: string; description?: string },
) => {
  const handler = (notification as any)?.[type];
  if (typeof handler === 'function') {
    handler(config);
    return;
  }

  const log =
    type === 'error'
      ? console.error
      : type === 'warning'
      ? console.warn
      : console.log;
  log(
    `[${type.toUpperCase()}] ${config?.message ?? ''}`.trim(),
    config?.description ?? '',
  );
};

// RAGFlow API返回的知识库数据结构
interface RAGFlowKB {
  id: string;
  name: string;
  nickname: string;
  description?: string;
  avatar?: string;
  doc_num: number;
  chunk_num: number;
  token_num: number;
  language: string;
  embd_id: string; // embedding model id
  parser_id: string;
  permission: string;
  tenant_id: string;
  tenant_avatar: string;
  update_time: number;
  similarity_threshold?: number;
  vector_similarity_weight?: number;
  status?: string | number;
  parser_config?: Record<string, unknown> | null;
}

// RAGFlow API响应结构
interface RAGFlowAPIResponse {
  code: number;
  message: string;
  data: {
    kbs: RAGFlowKB[];
    total: number;
  };
}

// 环境配置
const getRAGFlowConfig = () => {
  // 从rsbuild.config.ts中配置的环境变量获取RAGFlow API URL
  const ragflowAPIURL = process.env.RAGFLOW_API_URL || 'http://localhost:9380';
  const ragflowWebURL = process.env.RAGFLOW_WEB_URL || 'http://localhost:9222';
  return {
    apiURL: `${ragflowAPIURL}/v1/kb/list`,
    webURL: ragflowWebURL,
    createURL: `${ragflowAPIURL}/v1/kb/create`,
    updateURL: `${ragflowAPIURL}/v1/kb/update`,
    removeURL: `${ragflowAPIURL}/v1/kb/rm`,
  };
};

const ExternalKnowledgePage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [datasets, setDatasets] = useState<RAGFlowKB[]>([]);
  const [hasBinding, setHasBinding] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDatasetName, setNewDatasetName] = useState('');
  const [creating, setCreating] = useState(false);
  const isFetchingRef = useRef(false);
  const refreshAfterCreateRef = useRef(false);
  const refreshAfterEditRef = useRef(false);
  const [hoveredDatasetId, setHoveredDatasetId] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDataset, setEditingDataset] = useState<RAGFlowKB | null>(null);
  const [editDatasetName, setEditDatasetName] = useState('');
  const [updatingDataset, setUpdatingDataset] = useState(false);

  // 跳转到RAGFlow知识库详情页面
  const navigateToDataset = (datasetId: string) => {
    const { webURL } = getRAGFlowConfig();
    const targetUrl = `${webURL}/dataset/dataset/${datasetId}`;

    try {
      // 方法1: 直接在新标签页中打开
      // 由于两个系统用户已经打通，且都在localhost域下，cookie会被自动传递
      const newWindow = window.open(targetUrl, '_blank', 'noopener,noreferrer');

      if (!newWindow) {
        // 如果弹窗被阻止，提示用户
        emitNotification('warning', {
          message: I18n.t('external_knowledge_popup_blocked', {}, '弹窗被阻止'),
          description: I18n.t(
            'external_knowledge_popup_blocked_desc',
            {},
            '请允许弹窗或手动访问知识库详情页',
          ),
        });

        // 备用方案：复制链接到剪贴板
        if (navigator.clipboard) {
          navigator.clipboard.writeText(targetUrl).then(() => {
            emitNotification('info', {
              message: I18n.t(
                'external_knowledge_link_copied',
                {},
                '链接已复制',
              ),
              description: I18n.t(
                'external_knowledge_link_copied_desc',
                {},
                '链接已复制到剪贴板，请手动打开',
              ),
            });
          });
        }
      }
    } catch (error) {
      console.error('Failed to navigate to dataset:', error);
      emitNotification('error', {
        message: I18n.t('external_knowledge_nav_error', {}, '跳转失败'),
        description: I18n.t(
          'external_knowledge_nav_error_desc',
          {},
          '无法跳转到知识库详情页面',
        ),
      });
    }
  };

  // 跳转到RAGFlow知识库管理页面（添加知识库）
  const openCreateModal = () => {
    setNewDatasetName('');
    setShowCreateModal(true);
  };

  const handleCreateDataset = async () => {
    const name = newDatasetName.trim();
    if (!name) {
      return;
    }

    setCreating(true);
    try {
      const { createURL } = getRAGFlowConfig();
      const response = await fetch(createURL, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json;charset=UTF-8',
        },
        body: JSON.stringify({ name }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();

      if (data.code === 0) {
        const datasetId = data.data?.kb_id || data.data?.id;
        if (!datasetId) {
          throw new Error('invalid dataset id');
        }
        refreshAfterCreateRef.current = true;
        setShowCreateModal(false);
        setNewDatasetName('');
        emitNotification('success', {
          message: I18n.t('external_knowledge_create_success', {}, '创建成功'),
        });
        navigateToDataset(datasetId);
      } else {
        throw new Error(data.message || 'create failed');
      }
    } catch (error: any) {
      console.error('Failed to create dataset:', error);
      emitNotification('error', {
        message: I18n.t('external_knowledge_create_failed', {}, '创建失败'),
        description: error?.message || 'unknown error',
      });
    } finally {
      setCreating(false);
    }
  };

  const openEditDatasetModal = (dataset: RAGFlowKB) => {
    setEditingDataset(dataset);
    setEditDatasetName(dataset.name);
    setShowEditModal(true);
  };

  const closeEditDatasetModal = () => {
    if (updatingDataset) {
      return;
    }
    setShowEditModal(false);
    setEditingDataset(null);
    setEditDatasetName('');
  };

  const handleUpdateDataset = async () => {
    if (!editingDataset) {
      return;
    }

    const name = editDatasetName.trim();
    if (!name) {
      return;
    }

    setUpdatingDataset(true);
    try {
      const { updateURL } = getRAGFlowConfig();
      const payload = {
        kb_id: editingDataset.id,
        name,
        description: editingDataset.description ?? '',
        avatar: editingDataset.avatar ?? null,
        doc_num: editingDataset.doc_num,
        chunk_num: editingDataset.chunk_num,
        token_num: editingDataset.token_num,
        embd_id: editingDataset.embd_id,
        language: editingDataset.language,
        parser_id: editingDataset.parser_id,
        permission: editingDataset.permission,
        similarity_threshold: editingDataset.similarity_threshold ?? 0.2,
        vector_similarity_weight:
          editingDataset.vector_similarity_weight ?? 0.3,
      };

      const response = await fetch(updateURL, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json;charset=UTF-8',
        },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();
      if (data.code === 0) {
        emitNotification('success', {
          message: I18n.t('external_knowledge_update_success', {}, '修改成功'),
        });
        refreshAfterEditRef.current = true;
        setShowEditModal(false);
        setEditingDataset(null);
        setEditDatasetName('');
      } else {
        throw new Error(data.message || 'update failed');
      }
    } catch (error: any) {
      console.error('Failed to update dataset:', error);
      emitNotification('error', {
        message: I18n.t('external_knowledge_update_failed', {}, '修改失败'),
        description: error?.message || 'unknown error',
      });
    } finally {
      setUpdatingDataset(false);
    }
  };

  const handleDeleteDataset = (dataset: RAGFlowKB) => {
    Modal.confirm({
      title: I18n.t(
        'external_knowledge_delete_title',
        {},
        '确认删除该知识库？',
      ),
      content: I18n.t(
        'external_knowledge_delete_desc',
        {},
        '删除后不可恢复，请谨慎操作',
      ),
      okText: I18n.t('external_knowledge_delete_confirm', {}, '删除'),
      cancelText: I18n.t('external_knowledge_cancel', {}, '取消'),
      okButtonProps: { type: 'danger' },
      onOk: async () => {
        try {
          const { removeURL } = getRAGFlowConfig();
          const response = await fetch(removeURL, {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json;charset=UTF-8',
            },
            body: JSON.stringify({ kb_id: dataset.id }),
            credentials: 'include',
          });

          if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
          }

          const data = await response.json();
          if (data.code === 0) {
            emitNotification('success', {
              message: I18n.t(
                'external_knowledge_delete_success',
                {},
                '删除成功',
              ),
            });
            setTimeout(() => {
              fetchDatasets();
            }, 0);
          } else {
            throw new Error(data.message || 'delete failed');
          }
        } catch (error: any) {
          console.error('Failed to delete dataset:', error);
          emitNotification('error', {
            message: I18n.t('external_knowledge_delete_failed', {}, '删除失败'),
            description: error?.message || 'unknown error',
          });
          throw error;
        }
      },
    });
  };

  const fetchDatasets = useCallback(async () => {
    if (isFetchingRef.current) {
      return;
    }

    isFetchingRef.current = true;
    setLoading(true);
    try {
      const { apiURL } = getRAGFlowConfig();

      // 直接调用RAGFlow API
      const response = await fetch(apiURL, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json;charset=UTF-8',
        },
        body: JSON.stringify({}),
        credentials: 'include', // 包含cookie
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: RAGFlowAPIResponse = await response.json();

      if (data.code === 0) {
        setDatasets(data.data.kbs || []);
        setHasBinding(true);
      } else {
        emitNotification('error', {
          message: I18n.t('external_knowledge_fetch_error', {}, '获取失败'),
          description:
            data.message ||
            I18n.t(
              'external_knowledge_fetch_error_desc',
              {},
              '无法获取知识库列表',
            ),
        });
      }
    } catch (error: any) {
      console.error('Failed to fetch datasets:', error);

      // 检查是否是网络连接问题
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setHasBinding(false);
        emitNotification('warning', {
          message: I18n.t(
            'external_knowledge_no_binding_title',
            {},
            '连接失败',
          ),
          description: I18n.t(
            'external_knowledge_connection_error',
            {},
            '无法连接到外部知识库服务，请检查配置和网络连接',
          ),
        });
      } else {
        emitNotification('error', {
          message: I18n.t('external_knowledge_fetch_error', {}, '获取失败'),
          description: I18n.t(
            'external_knowledge_network_error',
            {},
            '网络请求失败，请稍后重试',
          ),
        });
      }
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDatasets();
  }, [fetchDatasets]);

  useEffect(() => {
    if (!showCreateModal && refreshAfterCreateRef.current) {
      refreshAfterCreateRef.current = false;
      fetchDatasets();
    }
  }, [showCreateModal, fetchDatasets]);

  useEffect(() => {
    if (!showEditModal && refreshAfterEditRef.current) {
      refreshAfterEditRef.current = false;
      fetchDatasets();
    }
  }, [showEditModal, fetchDatasets]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchDatasets();
      }
    };

    const handleWindowFocus = () => {
      fetchDatasets();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [fetchDatasets]);

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

  const renderDatasetCard = (dataset: RAGFlowKB) => {
    const isHovered = hoveredDatasetId === dataset.id;

    return (
      <div
        key={dataset.id}
        className="knowledge-library-item bg-white rounded-lg border border-gray-300 shadow-sm p-4 hover:shadow-lg hover:border-blue-300 transition-all duration-200 cursor-pointer"
        onClick={event => {
          if (
            (event.target as HTMLElement).closest(
              '[data-external-knowledge-action="true"]',
            )
          ) {
            event.stopPropagation();
            event.preventDefault();
            return;
          }
          navigateToDataset(dataset.id);
        }}
        onMouseEnter={() => setHoveredDatasetId(dataset.id)}
        onMouseLeave={() => {
          setHoveredDatasetId(prev => (prev === dataset.id ? null : prev));
        }}
        title={I18n.t(
          'external_knowledge_click_to_view',
          {},
          '点击查看知识库详情',
        )}
      >
        <div className="flex-col">
          {/* 图标区域 - 与系统风格一致 */}
          <div
            className="w-full h-[122px] px-[25px] py-[25px] bg-[#F9FAFD] rounded-[6px] relative"
            style={{
              background: `#F9FAFD url("${placeholderImg}") no-repeat center center / 72px auto`,
            }}
          >
            {/* 状态标记和外链提示 */}
            <div className="absolute top-2 right-2 flex items-center gap-2">
              <div className="px-2 py-1 bg-green-50 rounded text-xs text-green-600">
                {I18n.t('external_knowledge_status_active', {}, '活跃')}
              </div>
              <div className="w-4 h-4 flex items-center justify-center text-gray-400 hover:text-blue-500 transition-colors text-xs">
                ↗
              </div>
              {isHovered ? (
                <Dropdown
                  trigger="click"
                  position="bottomRight"
                  render={
                    <Dropdown.Menu data-external-knowledge-action="true">
                      <Dropdown.Item
                        onClick={event => {
                          event?.preventDefault?.();
                          event?.stopPropagation?.();
                          openEditDatasetModal(dataset);
                        }}
                      >
                        {I18n.t('external_knowledge_edit', {}, '编辑')}
                      </Dropdown.Item>
                      <Dropdown.Item
                        type="danger"
                        onClick={event => {
                          event?.preventDefault?.();
                          event?.stopPropagation?.();
                          handleDeleteDataset(dataset);
                        }}
                      >
                        {I18n.t('external_knowledge_delete', {}, '删除')}
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  }
                >
                  <IconButton
                    icon={<IconCozMore />}
                    size="small"
                    color="secondary"
                    data-external-knowledge-action="true"
                    onClick={event => {
                      event.stopPropagation();
                      event.preventDefault();
                    }}
                  />
                </Dropdown>
              ) : null}
            </div>

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

                <IconCozCheckMarkCircleFill
                  data-testid="workspace.library.item.publish.status"
                  className="flex-shrink-0 w-[16px] h-[16px] coz-fg-hglt-green"
                />
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
                    {formatNumber(dataset.doc_num)}{' '}
                    {I18n.t('external_knowledge_docs_short', {}, '文档')}
                  </span>
                </Tooltip>
                <span className="text-gray-300">·</span>
                <Tooltip
                  title={I18n.t('external_knowledge_chunks', {}, '片段数量')}
                >
                  <span>
                    {formatNumber(dataset.chunk_num)}{' '}
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
    <>
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
            <Space spacing={8}>
              <Button type="primary" onClick={openCreateModal}>
                {I18n.t('external_knowledge_add_dataset', {}, '添加知识库')}
              </Button>
              <Button
                type="tertiary"
                icon={<IconCozRefresh />}
                onClick={fetchDatasets}
                loading={loading}
              >
                {I18n.t('external_knowledge_refresh', {}, '刷新')}
              </Button>
            </Space>
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

      <Modal
        visible={showCreateModal}
        title={I18n.t('external_knowledge_create_title', {}, '新建知识库')}
        onOk={handleCreateDataset}
        onCancel={() => {
          if (!creating) {
            setShowCreateModal(false);
            setNewDatasetName('');
          }
        }}
        okButtonProps={{ disabled: !newDatasetName.trim() }}
        okText={I18n.t('external_knowledge_modal_confirm', {}, '确定')}
        cancelText={I18n.t('external_knowledge_modal_cancel', {}, '取消')}
        confirmLoading={creating}
        maskClosable={!creating}
        destroyOnClose
      >
        <Input
          autoFocus
          placeholder={I18n.t(
            'external_knowledge_create_placeholder',
            {},
            '请输入知识库名称',
          )}
          value={newDatasetName}
          onChange={value => setNewDatasetName(value)}
          onEnterPress={() => {
            if (!creating && newDatasetName.trim()) {
              handleCreateDataset();
            }
          }}
          disabled={creating}
        />
      </Modal>

      <Modal
        visible={showEditModal}
        title={I18n.t('external_knowledge_edit_title', {}, '重命名知识库')}
        onOk={handleUpdateDataset}
        onCancel={closeEditDatasetModal}
        okButtonProps={{ disabled: !editDatasetName.trim() }}
        okText={I18n.t('external_knowledge_modal_confirm', {}, '确定')}
        cancelText={I18n.t('external_knowledge_modal_cancel', {}, '取消')}
        confirmLoading={updatingDataset}
        maskClosable={!updatingDataset}
        destroyOnClose
      >
        <Input
          autoFocus
          placeholder={I18n.t(
            'external_knowledge_edit_placeholder',
            {},
            '请输入新的知识库名称',
          )}
          value={editDatasetName}
          onChange={value => setEditDatasetName(value)}
          onEnterPress={() => {
            if (!updatingDataset && editDatasetName.trim()) {
              handleUpdateDataset();
            }
          }}
          disabled={updatingDataset}
        />
      </Modal>
    </>
  );
};

export default ExternalKnowledgePage;
