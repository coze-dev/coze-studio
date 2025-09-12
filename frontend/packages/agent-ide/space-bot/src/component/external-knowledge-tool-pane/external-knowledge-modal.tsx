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

import React, { useState, useEffect, type FC } from 'react';
import {
  Modal,
  Button,
  Space,
  List,
  Card,
  Tag,
  Typography,
  notification,
  Empty,
  Spin,
} from '@coze-arch/coze-design';
import { IconCozPlus } from '@coze-arch/coze-design/icons';
import { I18n } from '@coze-arch/i18n';
import { external_knowledge } from '@coze-studio/api-schema';

const { Text } = Typography;

export interface ExternalKnowledgeModalProps {
  visible: boolean;
  externalKnowledge?: any;
  onClose: () => void;
  onChange?: (knowledge: any) => void;
}

export const ExternalKnowledgeModal: FC<ExternalKnowledgeModalProps> = ({
  visible,
  externalKnowledge = { datasets: [] },
  onClose,
  onChange,
}) => {
  const [loading, setLoading] = useState(false);
  const [availableDatasets, setAvailableDatasets] = useState<any[]>([]);
  const [selectedDatasets, setSelectedDatasets] = useState<string[]>(
    externalKnowledge?.datasets?.map((d: any) => d.dataset_id) || []
  );

  // 获取可用的外部知识库列表
  const fetchAvailableDatasets = async () => {
    setLoading(true);
    try {
      const response = await external_knowledge.GetRAGFlowDatasets({});
      if (response.code === 0 && response.data) {
        setAvailableDatasets(response.data);
      } else if (response.code === 403) {
        notification.warning({
          message: I18n.t('external_knowledge_no_binding_title', {}, '未配置绑定'),
          description: I18n.t(
            'external_knowledge_no_binding_desc',
            {},
            '请先在设置中配置外部知识库绑定'
          ),
        });
      }
    } catch (error) {
      console.error('Failed to fetch datasets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchAvailableDatasets();
    }
  }, [visible]);

  const handleAddDataset = (dataset: any) => {
    if (!selectedDatasets.includes(dataset.id)) {
      setSelectedDatasets([...selectedDatasets, dataset.id]);
    }
  };

  const handleRemoveDataset = (datasetId: string) => {
    setSelectedDatasets(selectedDatasets.filter(id => id !== datasetId));
  };

  const handleSave = () => {
    const selected = availableDatasets
      .filter(d => selectedDatasets.includes(d.id))
      .map(d => ({
        dataset_id: d.id,
        name: d.name,
        description: d.description || '',
      }));

    const newKnowledge = {
      ...externalKnowledge,
      datasets: selected,
    };

    onChange?.(newKnowledge);
    onClose();
  };

  const renderDatasetCard = (dataset: any, isSelected: boolean) => (
    <Card
      key={dataset.id}
      hoverable
      style={{ marginBottom: 8 }}
      extra={
        isSelected ? (
          <Button
            type="tertiary"
            size="small"
            onClick={() => handleRemoveDataset(dataset.id)}
          >
            {I18n.t('external_knowledge_remove', {}, '移除')}
          </Button>
        ) : (
          <Button
            type="tertiary"
            icon={<IconCozPlus />}
            size="small"
            onClick={() => handleAddDataset(dataset)}
          >
            {I18n.t('external_knowledge_add', {}, '添加')}
          </Button>
        )
      }
    >
      <Card.Meta
        title={dataset.name}
        description={
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text type="secondary">{dataset.description || '暂无描述'}</Text>
            <Space>
              <Tag>{dataset.document_count} 文档</Tag>
              <Tag>{dataset.chunk_count} 片段</Tag>
              {dataset.status === 1 && (
                <Tag color="green">活跃</Tag>
              )}
            </Space>
          </Space>
        }
      />
    </Card>
  );

  return (
    <Modal
      title={I18n.t('external_knowledge_modal_title', {}, '外部知识库')}
      visible={visible}
      onCancel={onClose}
      onOk={handleSave}
      width={800}
      bodyStyle={{ maxHeight: '600px', overflow: 'auto' }}
    >
      <div style={{ display: 'flex', gap: 16 }}>
        {/* 左侧 - 已选择的知识库 */}
        <div style={{ flex: 1 }}>
          <Typography.Title level={5}>
            {I18n.t('external_knowledge_selected', {}, '已选择')}
            {selectedDatasets.length > 0 && (
              <Tag style={{ marginLeft: 8 }}>{selectedDatasets.length}</Tag>
            )}
          </Typography.Title>
          
          {loading ? (
            <Spin />
          ) : selectedDatasets.length === 0 ? (
            <Empty
              description={I18n.t(
                'external_knowledge_no_selected',
                {},
                '未选择任何知识库'
              )}
            />
          ) : (
            <List
              dataSource={availableDatasets.filter(d =>
                selectedDatasets.includes(d.id)
              )}
              renderItem={dataset => renderDatasetCard(dataset, true)}
            />
          )}
        </div>

        {/* 右侧 - 可选择的知识库 */}
        <div style={{ flex: 1 }}>
          <Typography.Title level={5}>
            {I18n.t('external_knowledge_available', {}, '可选择')}
          </Typography.Title>
          
          {loading ? (
            <Spin />
          ) : availableDatasets.length === 0 ? (
            <Empty
              description={I18n.t(
                'external_knowledge_no_available',
                {},
                '暂无可用的外部知识库'
              )}
            />
          ) : (
            <List
              dataSource={availableDatasets.filter(
                d => !selectedDatasets.includes(d.id)
              )}
              renderItem={dataset => renderDatasetCard(dataset, false)}
            />
          )}
        </div>
      </div>
    </Modal>
  );
};