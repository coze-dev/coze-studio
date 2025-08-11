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
import { Button, Input, Table, message } from 'antd';
import { modelmgr } from '@coze-studio/api-schema';
import {
  useListModels,
  useCreateModel,
  useDeleteModel,
  useUpdateModel,
} from '../../hooks/useSpaceModels';

interface ModelListProps {
  spaceId?: string;
}

export const ModelList: React.FC<ModelListProps> = ({ spaceId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(20);

  // 使用生成的类型安全的 Hooks
  const { data: modelsResponse, isLoading, error } = useListModels({
    page_size: pageSize,
    filter: searchTerm,
  });

  const createModelMutation = useCreateModel();
  const deleteModelMutation = useDeleteModel();
  const updateModelMutation = useUpdateModel();

  const models = modelsResponse?.data || [];
  const total = modelsResponse?.total_count || 0;

  const handleCreateModel = async () => {
    try {
      const newModelData: modelmgr.CreateModelRequest = {
        name: '新模型',
        description: { 'zh-CN': '新创建的模型' },
        meta: {
          name: '新模型',
          protocol: 'openai',
          capability: {
            function_call: true,
            input_modal: ['text'],
            max_tokens: 4096,
          },
          conn_config: {
            endpoint: 'https://api.openai.com/v1',
            auth_type: 'bearer',
          },
        },
      };

      await createModelMutation.mutateAsync(newModelData);
      message.success('模型创建成功');
    } catch (error) {
      message.error('模型创建失败');
      console.error('Create model error:', error);
    }
  };

  const handleDeleteModel = async (modelId: string) => {
    try {
      await deleteModelMutation.mutateAsync(modelId);
      message.success('模型删除成功');
    } catch (error) {
      message.error('模型删除失败');
      console.error('Delete model error:', error);
    }
  };

  const handleUpdateModel = async (modelId: string, name: string) => {
    try {
      await updateModelMutation.mutateAsync({
        model_id: modelId,
        name: name + ' (已更新)',
      });
      message.success('模型更新成功');
    } catch (error) {
      message.error('模型更新失败');
      console.error('Update model error:', error);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '协议',
      dataIndex: ['meta', 'protocol'],
      key: 'protocol',
    },
    {
      title: '状态',
      dataIndex: ['meta', 'status'],
      key: 'status',
      render: (status: number) => (status === 1 ? '启用' : '禁用'),
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
      render: (_: any, record: modelmgr.ModelDetailOutput) => (
        <div>
          <Button
            type="link"
            onClick={() => handleUpdateModel(record.id, record.name)}
            loading={updateModelMutation.isPending}
          >
            更新
          </Button>
          <Button
            type="link"
            danger
            onClick={() => handleDeleteModel(record.id)}
            loading={deleteModelMutation.isPending}
          >
            删除
          </Button>
        </div>
      ),
    },
  ];

  if (error) {
    return <div>加载模型列表失败: {error.message}</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <Input
          placeholder="搜索模型..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: 300 }}
        />
        <Button
          type="primary"
          onClick={handleCreateModel}
          loading={createModelMutation.isPending}
        >
          创建模型
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={models}
        loading={isLoading}
        rowKey="id"
        pagination={{
          total,
          pageSize,
          showSizeChanger: true,
          onShowSizeChange: (_, size) => setPageSize(size),
        }}
      />
    </div>
  );
};

