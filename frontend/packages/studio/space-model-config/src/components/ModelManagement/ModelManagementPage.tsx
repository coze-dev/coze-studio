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

import React, { useState } from 'react';
import { Button, Input, Table, Space, message, Modal, Form, Select, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SettingOutlined } from '@ant-design/icons';
import { modelmgr } from '@coze-studio/api-schema';
import { useModelList } from '../../hooks/useSpaceModels';
import {
  createModel,
  updateModel,
  deleteModel,
  addModelToSpace,
  removeModelFromSpace,
  getSpaceModelConfig,
  updateSpaceModelConfig,
} from '@coze-arch/bot-space-api/space-model-api';

const { Search } = Input;
const { Option } = Select;

interface ModelManagementPageProps {
  spaceId?: string;
}

export const ModelManagementPage: React.FC<ModelManagementPageProps> = ({ spaceId }) => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [pageSize, setPageSize] = useState(20);
  const [pageToken, setPageToken] = useState('');
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingModel, setEditingModel] = useState<modelmgr.ModelDetailOutput | null>(null);
  const [form] = Form.useForm();

  // 使用新的 Hook 获取模型列表
  const { models, total, nextPageToken, loading, error, refresh } = useModelList({
    page_size: pageSize,
    page_token: pageToken,
    filter: searchKeyword,
    sort_by: 'created_at',
    space_id: spaceId,
  });

  // 创建模型
  const handleCreateModel = async (values: any) => {
    try {
      const modelData: modelmgr.CreateModelRequest = {
        name: values.name,
        description: { 'zh-CN': values.description },
        icon_uri: values.icon_uri,
        meta: {
          name: values.name,
          protocol: values.protocol,
          capability: {
            function_call: values.function_call,
            input_modal: values.input_modal || ['text'],
            max_tokens: values.max_tokens || 4096,
            json_mode: values.json_mode,
          },
          conn_config: {
            endpoint: values.endpoint,
            auth_type: values.auth_type,
            api_key: values.api_key,
          },
        },
      };

      await createModel(modelData);
      message.success('模型创建成功');
      setIsCreateModalVisible(false);
      form.resetFields();
      refresh();
    } catch (error) {
      message.error('模型创建失败');
      console.error('Create model error:', error);
    }
  };

  // 更新模型
  const handleUpdateModel = async (values: any) => {
    if (!editingModel) return;

    try {
      const updateData: modelmgr.UpdateModelRequest = {
        model_id: editingModel.id,
        name: values.name,
        description: { 'zh-CN': values.description },
        icon_uri: values.icon_uri,
      };

      await updateModel(updateData);
      message.success('模型更新成功');
      setIsEditModalVisible(false);
      setEditingModel(null);
      form.resetFields();
      refresh();
    } catch (error) {
      message.error('模型更新失败');
      console.error('Update model error:', error);
    }
  };

  // 删除模型
  const handleDeleteModel = (model: modelmgr.ModelDetailOutput) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除模型 "${model.name}" 吗？`,
      onOk: async () => {
        try {
          await deleteModel(model.id);
          message.success('模型删除成功');
          refresh();
        } catch (error) {
          message.error('模型删除失败');
          console.error('Delete model error:', error);
        }
      },
    });
  };

  // 添加到空间
  const handleAddToSpace = async (modelId: string) => {
    if (!spaceId) {
      message.warning('请先选择一个空间');
      return;
    }

    try {
      await addModelToSpace(spaceId, modelId);
      message.success('已添加到空间');
    } catch (error) {
      message.error('添加到空间失败');
      console.error('Add to space error:', error);
    }
  };

  // 配置空间模型
  const handleConfigSpaceModel = async (modelId: string) => {
    if (!spaceId) {
      message.warning('请先选择一个空间');
      return;
    }

    try {
      const config = await getSpaceModelConfig(spaceId, modelId);
      Modal.info({
        title: '空间模型配置',
        content: <pre>{JSON.stringify(config, null, 2)}</pre>,
        width: 600,
      });
    } catch (error) {
      message.error('获取配置失败');
      console.error('Get config error:', error);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 200,
      ellipsis: true,
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: '协议',
      dataIndex: ['meta', 'protocol'],
      key: 'protocol',
      render: (protocol: string) => <Tag color="blue">{protocol}</Tag>,
    },
    {
      title: '状态',
      dataIndex: ['meta', 'status'],
      key: 'status',
      render: (status: number) => (
        <Tag color={status === 1 ? 'green' : 'red'}>
          {status === 1 ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '最大Token',
      dataIndex: ['meta', 'capability', 'max_tokens'],
      key: 'max_tokens',
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (timestamp: number) => new Date(timestamp * 1000).toLocaleString(),
    },
    {
      title: '操作',
      key: 'actions',
      width: 300,
      render: (_: any, record: modelmgr.ModelDetailOutput) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => {
              setEditingModel(record);
              form.setFieldsValue({
                name: record.name,
                description: Object.values(record.description || {})[0] || '',
                icon_uri: record.icon_uri,
              });
              setIsEditModalVisible(true);
            }}
          >
            编辑
          </Button>
          <Button
            icon={<DeleteOutlined />}
            size="small"
            danger
            onClick={() => handleDeleteModel(record)}
          >
            删除
          </Button>
          {spaceId && (
            <>
              <Button
                size="small"
                onClick={() => handleAddToSpace(record.id)}
              >
                添加到空间
              </Button>
              <Button
                icon={<SettingOutlined />}
                size="small"
                onClick={() => handleConfigSpaceModel(record.id)}
              >
                配置
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  if (error) {
    return <div>加载模型列表失败: {error.message}</div>;
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
        <Space>
          <Search
            placeholder="搜索模型..."
            allowClear
            onSearch={setSearchKeyword}
            style={{ width: 300 }}
          />
          <span>总计: {total} 个模型</span>
        </Space>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsCreateModalVisible(true)}
        >
          创建模型
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={models}
        loading={loading}
        rowKey="id"
        pagination={{
          total,
          pageSize,
          showSizeChanger: true,
          onShowSizeChange: (_, size) => setPageSize(size),
          onChange: (page) => {
            // 使用 token 分页
            if (page > 1 && nextPageToken) {
              setPageToken(nextPageToken);
            } else {
              setPageToken('');
            }
          },
        }}
      />

      {/* 创建模型 Modal */}
      <Modal
        title="创建模型"
        open={isCreateModalVisible}
        onCancel={() => {
          setIsCreateModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateModel}
        >
          <Form.Item
            name="name"
            label="模型名称"
            rules={[{ required: true, message: '请输入模型名称' }]}
          >
            <Input placeholder="请输入模型名称" />
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea placeholder="请输入模型描述" />
          </Form.Item>
          <Form.Item
            name="protocol"
            label="协议"
            rules={[{ required: true, message: '请选择协议' }]}
          >
            <Select placeholder="请选择协议">
              <Option value="openai">OpenAI</Option>
              <Option value="anthropic">Anthropic</Option>
              <Option value="azure">Azure</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="endpoint"
            label="端点URL"
            rules={[{ required: true, message: '请输入端点URL' }]}
          >
            <Input placeholder="https://api.openai.com/v1" />
          </Form.Item>
          <Form.Item
            name="auth_type"
            label="认证类型"
            rules={[{ required: true, message: '请选择认证类型' }]}
          >
            <Select placeholder="请选择认证类型">
              <Option value="bearer">Bearer Token</Option>
              <Option value="api_key">API Key</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="api_key"
            label="API密钥"
          >
            <Input.Password placeholder="请输入API密钥" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑模型 Modal */}
      <Modal
        title="编辑模型"
        open={isEditModalVisible}
        onCancel={() => {
          setIsEditModalVisible(false);
          setEditingModel(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateModel}
        >
          <Form.Item
            name="name"
            label="模型名称"
            rules={[{ required: true, message: '请输入模型名称' }]}
          >
            <Input placeholder="请输入模型名称" />
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea placeholder="请输入模型描述" />
          </Form.Item>
          <Form.Item
            name="icon_uri"
            label="图标URI"
          >
            <Input placeholder="请输入图标URI" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

