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

import React, { useState, useEffect, useRef } from 'react';
import {
  Button,
  Toast,
  Modal,
  Space,
  Tag,
  Input,
} from '@coze-arch/coze-design';
import { UIEmpty } from '@coze-arch/bot-semi';
import { external_knowledge } from '@coze-studio/api-schema';
import { AuthTable, useTableHeight } from '@coze-studio/open-auth';
import { I18n } from '@coze-arch/i18n';

export const ExternalKnowledgeBinding: React.FC = () => {
  const [bindings, setBindings] = useState<
    external_knowledge.ExternalKnowledgeBinding[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBinding, setEditingBinding] =
    useState<external_knowledge.ExternalKnowledgeBinding | null>(null);
  const [bindingKey, setBindingKey] = useState('');
  const [bindingName, setBindingName] = useState('');
  const [status, setStatus] = useState(1);
  const tableRef = useRef<HTMLDivElement>(null);
  const tableHeight = useTableHeight(tableRef);

  // 获取绑定列表
  const fetchBindings = async () => {
    setLoading(true);
    try {
      const response = await external_knowledge.GetBindingList({
        page: 1,
        page_size: 100,
      });

      if (response.code === 0) {
        setBindings(response.data || []);
      }
    } catch (error: any) {
      console.error('Failed to fetch bindings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBindings();
  }, []);

  // 创建或更新绑定
  const handleSubmit = async () => {
    if (!editingBinding && !bindingKey) {
      Toast.error('请输入绑定密钥');
      return;
    }

    try {
      if (editingBinding) {
        // 更新绑定
        const response = await external_knowledge.UpdateBinding({
          id: editingBinding.id,
          binding_name: bindingName,
          status: status,
        });

        if (response.code === 0) {
          Toast.success('更新成功');
          setModalVisible(false);
          fetchBindings();
        } else {
          Toast.error(response.msg || '更新失败');
        }
      } else {
        // 创建新绑定
        const response = await external_knowledge.CreateBinding({
          binding_key: bindingKey,
          binding_name: bindingName,
          binding_type: 'default',
        });

        if (response.code === 0) {
          Toast.success('绑定成功');
          setModalVisible(false);
          fetchBindings();
        } else {
          Toast.error(response.msg || '绑定失败');
        }
      }
    } catch (error: any) {
      Toast.error(editingBinding ? '更新失败' : '绑定失败');
    }
  };

  // 删除绑定
  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个绑定吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          const response = await external_knowledge.DeleteBinding({ id });

          if (response.code === 0) {
            Toast.success('删除成功');
            fetchBindings();
          } else {
            Toast.error(response.msg || '删除失败');
          }
        } catch (error: any) {
          Toast.error('删除失败');
        }
      },
      onCancel: () => {
        // 用户取消，不做任何操作
      },
    });
  };

  // 打开新增/编辑弹窗
  const openModal = (binding?: external_knowledge.ExternalKnowledgeBinding) => {
    if (binding) {
      setEditingBinding(binding);
      setBindingName(binding.binding_name || '');
      setStatus(binding.status);
    } else {
      setEditingBinding(null);
      setBindingKey('');
      setBindingName('');
      setStatus(1);
    }
    setModalVisible(true);
  };

  const columns = [
    {
      title: '绑定名称',
      dataIndex: 'binding_name',
      key: 'binding_name',
      render: (
        text: string,
        record: external_knowledge.ExternalKnowledgeBinding,
      ) => text || `绑定 #${record.id}`,
    },
    {
      title: '绑定密钥',
      dataIndex: 'binding_key',
      key: 'binding_key',
      render: (text: string) => {
        if (text && text.length > 20) {
          return `${text.substring(0, 10)}...${text.substring(text.length - 10)}`;
        }
        return text;
      },
    },
    {
      title: '类型',
      dataIndex: 'binding_type',
      key: 'binding_type',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: number) => (
        <Tag color={status === 1 ? 'green' : 'default'}>
          {status === 1 ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (timestamp: number) => {
        return new Date(timestamp * 1000).toLocaleString();
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: external_knowledge.ExternalKnowledgeBinding) => (
        <Space>
          <Button type="text" size="small" onClick={() => openModal(record)}>
            编辑
          </Button>
          <Button
            type="text"
            size="small"
            danger
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  // TopBody 部分 - 复制PatBody的结构
  const TopBody = () => (
    <Space vertical spacing={20}>
      <Space className="w-full">
        <h3 className="flex-1 m-0"></h3>
        <Button onClick={() => openModal()} theme="solid" type="primary">
          添加绑定
        </Button>
      </Space>
      <div className="w-full">
        <div
          style={{
            padding: '12px 16px',
            background: 'var(--semi-color-fill-0)',
            borderRadius: '8px',
            fontSize: '14px',
            color: 'var(--semi-color-text-2)',
          }}
        >
          管理您的外部知识库连接，支持添加多个绑定但同时只能启用一个
        </div>
      </div>
    </Space>
  );

  return (
    <div className="w-full h-full flex flex-col">
      <TopBody />

      {/* DataTable 部分 - 使用AuthTable组件 */}
      <div className="flex-1" ref={tableRef}>
        <AuthTable
          useHoverStyle={false}
          size="small"
          type="primary"
          tableProps={{
            rowKey: 'id',
            loading,
            dataSource: bindings,
            columns,
            scroll: { y: tableHeight },
          }}
          empty={
            <UIEmpty
              empty={{
                title: '暂无绑定',
                description: '添加外部知识库绑定以开始使用',
                btnText: '添加绑定',
                btnOnClick: () => openModal(),
              }}
            />
          }
        />
      </div>

      {/* 编辑/新增弹窗 - 简化版，只有一个输入框 */}
      <Modal
        title={editingBinding ? '编辑绑定' : '添加外部知识库绑定'}
        visible={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          setBindingKey('');
          setBindingName('');
          setEditingBinding(null);
        }}
        okText="确定"
        cancelText="取消"
        width={500}
      >
        <div className="space-y-4">
          {!editingBinding && (
            <div>
              <label className="block text-sm font-medium mb-2">
                绑定密钥 <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="请输入外部知识库的绑定密钥"
                value={bindingKey}
                onChange={value => setBindingKey(value)}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">绑定名称</label>
            <Input
              placeholder="给这个绑定起个名字（可选）"
              value={bindingName}
              onChange={value => setBindingName(value)}
            />
          </div>

          {editingBinding && (
            <div>
              <label className="block text-sm font-medium mb-2">状态</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={status}
                onChange={e => setStatus(Number(e.target.value))}
              >
                <option value={1}>启用</option>
                <option value={0}>禁用</option>
              </select>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
