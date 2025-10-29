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
import { useParams } from 'react-router-dom';
import {
  Layout,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  Typography,
  Popconfirm,
} from '@coze-arch/coze-design';
import {
  IconCozPlus,
} from '@coze-arch/coze-design/icons';

const { Title } = Typography;

// HiAgent 类型定义 - 对应 external_agent_config 表
interface HiAgent {
  id: number | string;
  space_id: number | string;
  name: string;
  description?: string;
  platform: string;
  agent_url: string;
  agent_key?: string;
  agent_id?: string;
  app_id?: string;
  icon?: string;
  category?: string;
  metadata?: string;
  status: number;
  created_by: number | string;
  updated_by?: number | string;
  created_at?: string;
  updated_at?: string;
}

const Page: React.FC = () => {
  const { space_id } = useParams<{ space_id: string }>();
  const [agents, setAgents] = useState<HiAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState<HiAgent | null>(null);

  // 获取智能体列表
  const fetchAgents = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/space/${space_id}/hi-agents?page=1&page_size=100`,
        {
          headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.code === 0 && data.agents) {
          setAgents(data.agents);
        }
      }
    } catch (error) {
      console.error('Failed to fetch agents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (space_id) {
      fetchAgents();
    }
  }, [space_id]);

  // 删除智能体
  const handleDelete = async (agentId: number | string) => {
    try {
      const response = await fetch(`/api/space/${space_id}/hi-agents/${agentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.code === 0) {
          fetchAgents(); // 刷新列表
        }
      }
    } catch (error) {
      console.error('Failed to delete agent:', error);
    }
  };

  // 切换启用状态
  const handleToggleStatus = async (
    agentId: number | string,
    currentStatus: number,
  ) => {
    const newStatus = currentStatus === 1 ? 0 : 1;

    try {
      const response = await fetch(`/api/space/${space_id}/hi-agents/${agentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.code === 0) {
          fetchAgents(); // 刷新列表
        }
      }
    } catch (error) {
      console.error('Failed to toggle agent status:', error);
    }
  };

  return (
    <Layout>
      <Layout.Header className="pb-0">
        <div className="w-full flex items-center justify-between">
          <Title heading={4}>外部智能体</Title>
          <Button
            type="primary"
            icon={<IconCozPlus />}
            onClick={() => {
              setEditingAgent(null);
              setShowAddModal(true);
            }}
          >
            添加智能体
          </Button>
        </div>
      </Layout.Header>
      <Layout.Content>
        {loading ? (
          <div className="py-16 text-center text-gray-500">加载中...</div>
        ) : agents.length === 0 ? (
          <div className="py-16 text-center text-gray-500">暂无外部智能体</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {agents.map(agent => (
              <div
                key={agent.id}
                className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col gap-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-base font-medium text-gray-900">
                      {agent.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      ID：{agent.id}
                    </div>
                  </div>
                  <Tag color={agent.status === 1 ? 'green' : 'gray'}>
                    {agent.status === 1 ? '已启用' : '已停用'}
                  </Tag>
                </div>

                <div className="text-sm text-gray-600">
                  {agent.description ? agent.description : '暂无描述'}
                </div>

                <div className="text-xs text-gray-500 space-y-1">
                  <div>
                    <span className="font-medium text-gray-600">平台：</span>
                    {agent.platform || '—'}
                  </div>
                  <div className="break-all">
                    <span className="font-medium text-gray-600">API：</span>
                    {agent.agent_url || '—'}
                  </div>
                  {agent.agent_id && (
                    <div>
                      <span className="font-medium text-gray-600">外部ID：</span>
                      {agent.agent_id}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-auto">
                  <div className="text-xs text-gray-400">
                    创建：
                    {agent.created_at
                      ? new Date(agent.created_at).toLocaleString()
                      : '未知'}
                  </div>
                  <Space size="small">
                    <Button
                      size="small"
                      onClick={() => handleToggleStatus(agent.id, agent.status)}
                    >
                      {agent.status === 1 ? '停用' : '启用'}
                    </Button>
                    <Button
                      size="small"
                      onClick={() => {
                        setEditingAgent(agent);
                        setShowAddModal(true);
                      }}
                    >
                      编辑
                    </Button>
                    <Popconfirm
                      title="确认删除该智能体？"
                      content="删除后不可恢复，请谨慎操作"
                      okText="删除"
                      cancelText="取消"
                      onConfirm={() => handleDelete(agent.id)}
                      position="topRight"
                    >
                      <Button size="small" type="danger">
                        删除
                      </Button>
                    </Popconfirm>
                  </Space>
                </div>
              </div>
            ))}
          </div>
        )}
      </Layout.Content>

      <Modal
        title={editingAgent ? '编辑智能体' : '添加智能体'}
        visible={showAddModal}
        onCancel={() => {
          setShowAddModal(false);
          setEditingAgent(null);
        }}
        footer={null}
        style={{ width: 600 }}
      >
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <div className="text-sm font-medium text-blue-900 mb-2">📖 配置说明</div>
          <div className="text-xs text-blue-800 space-y-2">
            <div className="font-medium">⚠️ 重要：不同平台的 API 端点格式不同</div>

            <div className="bg-white p-2 rounded border border-blue-300">
              <div className="font-medium text-green-700 mb-1">✅ Dify 智能体</div>
              <div className="font-mono text-xs">
                API端点: https://ai.finmall.com/v1/chat-messages<br/>
                <span className="text-red-600">（必须包含完整路径 /v1/chat-messages）</span>
              </div>
            </div>

            <div className="bg-white p-2 rounded border border-blue-300">
              <div className="font-medium text-purple-700 mb-1">✅ HiAgent（火山引擎）</div>
              <div className="font-mono text-xs">
                API端点: https://api.volcengine.com/v1<br/>
                <span className="text-gray-600">（仅填写到 /v1，系统会自动拼接路径）</span>
              </div>
            </div>
          </div>
        </div>
        <Form
          onSubmit={async (values) => {
            const url = editingAgent
              ? `/api/space/${space_id}/hi-agents/${editingAgent.id}`
              : `/api/space/${space_id}/hi-agents`;
            const method = editingAgent ? 'PUT' : 'POST';

            // 构建请求数据，匹配 external_agent_config 表结构
            // 注意：space_id从URL路径获取，不需要在请求体中
            const requestData = {
              ...values,
              platform: values.platform || 'hiagent',
              category: values.category || 'external',
              // 将platform信息也保存到metadata中，方便后端使用
              metadata: JSON.stringify({
                platform: values.platform || 'hiagent',
              }),
            };

            try {
              const response = await fetch(url, {
                method,
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
              });

              if (response.ok) {
                const data = await response.json();
                if (data.code === 0) {
                  setShowAddModal(false);
                  setEditingAgent(null);
                  fetchAgents();
                }
              }
            } catch (error) {
              console.error('Failed to save agent:', error);
            }
          }}
        >
          <Form.Input
            field="name"
            label="名称"
            rules={[{ required: true, message: '请输入名称' }]}
            initValue={editingAgent?.name}
          />
          <Form.Input
            field="description"
            label="描述"
            initValue={editingAgent?.description}
          />
          <Form.Select
            field="platform"
            label="平台类型"
            rules={[{ required: true, message: '请选择平台类型' }]}
            initValue={editingAgent?.platform || 'hiagent'}
            onChange={(value) => {
              // 根据平台类型更新 API 端点的提示信息
              const form = document.querySelector('form');
              if (form) {
                const apiEndpointInput = form.querySelector('input[name="agent_url"]') as HTMLInputElement;
                if (apiEndpointInput) {
                  if (value === 'dify') {
                    apiEndpointInput.placeholder = '如: https://api.dify.ai/v1/chat-messages';
                  } else if (value === 'hiagent') {
                    apiEndpointInput.placeholder = '如: https://api.volcengine.com/v1/hiagent/chat';
                  }
                }
              }
            }}
          >
            <Select.Option value="hiagent">火山引擎 HiAgent</Select.Option>
            <Select.Option value="dify">Dify 智能体</Select.Option>
            <Select.Option value="coze" disabled>
              <span className="text-gray-400">Coze（敬请期待）</span>
            </Select.Option>
            <Select.Option value="bailing" disabled>
              <span className="text-gray-400">百灵（敬请期待）</span>
            </Select.Option>
            <Select.Option value="other" disabled>
              <span className="text-gray-400">其它（敬请期待）</span>
            </Select.Option>
          </Form.Select>
          <Form.Input
            field="agent_url"
            label="API端点"
            rules={[{ required: true, message: '请输入API端点' }]}
            initValue={editingAgent?.agent_url}
            placeholder="根据平台类型填写正确格式的 URL"
            extra={
              <div className="text-xs text-gray-500 mt-1">
                <div className="font-medium text-red-600 mb-1">⚠️ 注意：不同平台填写格式不同</div>
                <div>• <strong>Dify</strong>: 必须包含完整路径 <code className="bg-gray-100 px-1 rounded">/v1/chat-messages</code></div>
                <div className="mt-0.5 ml-4">✅ <code className="bg-green-50 px-1 rounded">https://ai.finmall.com/v1/chat-messages</code></div>
                <div className="mt-1">• <strong>HiAgent</strong>: 仅填写到 <code className="bg-gray-100 px-1 rounded">/v1</code>（系统会自动拼接）</div>
                <div className="mt-0.5 ml-4">✅ <code className="bg-green-50 px-1 rounded">https://api.volcengine.com/v1</code></div>
              </div>
            }
          />
          <Form.Input
            field="agent_key"
            label="API密钥"
            type="password"
            rules={[{ required: !editingAgent, message: '请输入API密钥' }]}
            placeholder="输入 API 密钥或 Bearer Token"
            extra={
              <div className="text-xs text-gray-500 mt-1">
                <div>• <strong>Dify</strong>: 以 <code className="bg-gray-100 px-1 rounded">app-</code> 开头的密钥</div>
                <div className="mt-0.5">  例如: <code className="bg-gray-100 px-1 rounded">app-UZHHu47HfF1VL0HgdoJ0bjUT</code></div>
                <div className="mt-1">• <strong>HiAgent</strong>: 火山引擎的 API Key</div>
              </div>
            }
          />
          <Form.Input
            field="external_agent_id"
            label="外部智能体ID（可选）"
            initValue={editingAgent?.agent_id}
            placeholder="外部平台的智能体标识"
            extra={
              <div className="text-xs text-gray-500 mt-1">
                用于标识外部平台的特定智能体，通常在多智能体场景下使用
              </div>
            }
          />
          <Form.Input
            field="app_id"
            label="应用ID（可选）"
            initValue={editingAgent?.app_id}
            placeholder="外部平台的应用标识"
            extra={
              <div className="text-xs text-gray-500 mt-1">
                某些平台需要提供应用 ID 来标识调用方
              </div>
            }
          />
          <Button htmlType="submit" type="primary">
            {editingAgent ? '保存' : '添加'}
          </Button>
        </Form>
      </Modal>
    </Layout>
  );
};

export { Page as Component };
export default Page;
