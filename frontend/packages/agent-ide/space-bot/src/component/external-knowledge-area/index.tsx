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

import React, { useState, useEffect, useMemo, type FC } from 'react';
import {
  Modal,
  Toast,
  Spin,
  Empty,
  Tag,
  Typography,
  Button,
  InputNumber,
  Switch,
  Row,
  Col,
  TextArea,
  Input,
} from '@coze-arch/coze-design';
import { I18n } from '@coze-arch/i18n';
import { IconCozDocument } from '@coze-arch/coze-design/icons';
import {
  ToolContentBlock,
  AddButton,
  ToolItem,
  ToolItemActionDelete,
  useToolValidData,
  type ToolEntryCommonProps,
} from '@coze-agent-ide/tool';
import { ToolKey } from '@coze-agent-ide/tool-config';
import { external_knowledge } from '@coze-studio/api-schema';
import { useBotInfoStore } from '@coze-studio/bot-detail-store/bot-info';
import { useBotDetailIsReadonly } from '@coze-studio/bot-detail-store';
import { PlaygroundApi } from '@coze-arch/bot-api';

const { Text } = Typography;

type ExternalKnowledgeAreaProps = ToolEntryCommonProps;

export const ExternalKnowledgeArea: FC<ExternalKnowledgeAreaProps> = ({
  title,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [availableDatasets, setAvailableDatasets] = useState<any[]>([]);
  const [selectedDatasets, setSelectedDatasets] = useState<string[]>([]);
  const [knowledgeName, setKnowledgeName] = useState<string>('');
  const [knowledgeDescription, setKnowledgeDescription] = useState<string>('');

  // 参数设置状态
  const [settings, setSettings] = useState({
    top_k: 10,
    page_size: 30,
    similarity_threshold: 0.2,
    vector_similarity_weight: 0.3,
    keyword: false,
    highlight: false,
  });

  const setToolValidData = useToolValidData();
  const isReadonly = useBotDetailIsReadonly();
  const externalKnowledge = useBotInfoStore(
    state => state.raw?.external_knowledge,
  );

  useEffect(() => {
    if (externalKnowledge?.dataset_ids) {
      setSelectedDatasets(externalKnowledge.dataset_ids);
      setKnowledgeName(externalKnowledge.name || '');
      setKnowledgeDescription(externalKnowledge.description || '');

      // 加载现有设置
      setSettings({
        top_k: externalKnowledge.top_k || 10,
        page_size: externalKnowledge.page_size || 30,
        similarity_threshold: externalKnowledge.similarity_threshold || 0.2,
        vector_similarity_weight:
          externalKnowledge.vector_similarity_weight || 0.3,
        keyword: externalKnowledge.keyword || false,
        highlight: externalKnowledge.highlight || false,
      });
    }
  }, [externalKnowledge]);

  const fetchAvailableDatasets = async () => {
    setLoading(true);
    try {
      const response = await external_knowledge.GetRAGFlowDatasets({});
      if (response.code === 0 && response.data) {
        setAvailableDatasets(response.data);
      } else if (response.code === 403) {
        Toast.warning(
          I18n.t(
            'external_knowledge_no_binding_desc',
            {},
            '请先在设置中配置外部知识库绑定',
          ),
        );
      }
    } catch (error) {
      console.error('Failed to fetch datasets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setModalVisible(true);
    fetchAvailableDatasets();
  };

  const handleSelectDataset = (datasetId: string, selected: boolean) => {
    let newSelected;
    if (selected) {
      newSelected = [...selectedDatasets, datasetId];
    } else {
      newSelected = selectedDatasets.filter(id => id !== datasetId);
    }
    setSelectedDatasets(newSelected);
    // 不立即保存，等用户点击确定按钮
  };

  const updateBotExternalKnowledge = async (selectedIds: string[]) => {
    // 如果是删除操作（空数组），只发送 dataset_ids
    const newKnowledge = selectedIds.length === 0 
      ? { dataset_ids: [] }  // 删除时只发送空的 dataset_ids
      : {
          dataset_ids: selectedIds,
          name: knowledgeName, // 用户自定义的名称
          description: knowledgeDescription, // 用户自定义的描述
          ...settings, // 保留其他设置
        };

    const { setBotInfoByImmer, botId } = useBotInfoStore.getState();

    // 更新本地状态
    setBotInfoByImmer(state => {
      if (state.raw) {
        // 如果是删除操作，清空 external_knowledge
        if (selectedIds.length === 0) {
          state.raw.external_knowledge = { dataset_ids: [] };
        } else {
          state.raw.external_knowledge = newKnowledge;
        }
      }
    });

    // 调用API保存到后端
    try {
      await PlaygroundApi.UpdateDraftBotInfoAgw({
        bot_info: {
          bot_id: botId,
          external_knowledge: newKnowledge,
        },
      });

      Toast.success(
        I18n.t('external_knowledge_save_success', {}, '外部知识库配置已保存'),
      );
    } catch (error) {
      console.error('Failed to save external knowledge:', error);
      Toast.error(
        I18n.t('external_knowledge_save_failed', {}, '保存外部知识库配置失败'),
      );
    }
  };

  const handleRemoveDataset = async (datasetId: string) => {
    // 删除外部知识库时，清空所有配置
    setSelectedDatasets([]);
    setKnowledgeName('');
    setKnowledgeDescription('');
    
    // 重置设置为默认值
    setSettings({
      top_k: 10,
      page_size: 30,
      similarity_threshold: 0.2,
      vector_similarity_weight: 0.3,
      keyword: false,
      highlight: false,
    });

    // 使用 updateBotExternalKnowledge 发送空数组
    await updateBotExternalKnowledge([]);
  };

  const selectedDatasetsInfo = useMemo(() => {
    // 只有当有 dataset_ids 且不为空时才显示外部知识库
    // 即使有 name 和 description，如果没有选择数据集，也应该显示为未添加状态
    if (
      !externalKnowledge?.dataset_ids ||
      externalKnowledge.dataset_ids.length === 0
    ) {
      return [];
    }
    // 如果有外部知识库配置且有数据集，返回一个对象来显示
    return [
      {
        id: 'external-knowledge',
        name: externalKnowledge.name || '外部知识库',
        description: externalKnowledge.description,
      },
    ];
  }, [externalKnowledge]);

  useEffect(() => {
    setToolValidData(Boolean(selectedDatasetsInfo?.length));
  }, [selectedDatasetsInfo?.length, setToolValidData]);

  return (
    <>
      <ToolContentBlock
        header={title}
        showBottomBorder
        defaultExpand={true}
        actionButton={
          !isReadonly && (
            <AddButton onClick={handleOpenModal} enableAutoHidden={true} />
          )
        }
      >
        {selectedDatasetsInfo.length === 0 ? (
          <div className="flex flex-col items-center py-8">
            <IconCozDocument className="text-[48px] text-gray-300 mb-3" />
            <Text type="secondary">
              {I18n.t('external_knowledge_empty', {}, '暂未添加外部知识库')}
            </Text>
            {!isReadonly && (
              <Button
                type="text"
                onClick={handleOpenModal}
                className="mt-2 text-primary"
              >
                添加知识库
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {selectedDatasetsInfo.map((dataset: any) => (
              <div
                key={dataset.id}
                className="p-3 border rounded-lg hover:bg-gray-50 transition-colors group relative bg-white"
              >
                <div className="flex items-start">
                  <div className="w-8 h-8 flex items-center justify-center bg-blue-500 rounded mr-3 flex-shrink-0">
                    <IconCozDocument className="text-[16px] text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {dataset.name}
                      </span>
                    </div>
                    {dataset.description && (
                      <div className="text-sm text-gray-500 mt-1">
                        {dataset.description}
                      </div>
                    )}
                  </div>
                  {!isReadonly && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ToolItemActionDelete
                        onClick={() => handleRemoveDataset(dataset.id)}
                        tooltips="删除知识库"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </ToolContentBlock>

      <Modal
        title={I18n.t('external_knowledge_select_title', {}, '选择外部知识库')}
        visible={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          // 恢复原有状态
          if (externalKnowledge?.dataset_ids) {
            setSelectedDatasets(externalKnowledge.dataset_ids);
            setKnowledgeName(externalKnowledge.name || '');
            setKnowledgeDescription(externalKnowledge.description || '');
          }
        }}
        onOk={async () => {
          await updateBotExternalKnowledge(selectedDatasets);
          setModalVisible(false);
        }}
        width={1000}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setModalVisible(false);
              // 恢复原有状态
              if (externalKnowledge?.dataset_ids) {
                setSelectedDatasets(externalKnowledge.dataset_ids);
                setKnowledgeName(externalKnowledge.name || '');
                setKnowledgeDescription(externalKnowledge.description || '');
              }
            }}
          >
            取消
          </Button>,
          <Button
            key="ok"
            type="primary"
            onClick={async () => {
              await updateBotExternalKnowledge(selectedDatasets);
              setModalVisible(false);
            }}
          >
            确定
          </Button>,
        ]}
      >
        <Row gutter={24}>
          {/* 左侧：数据集选择 */}
          <Col span={12}>
            <div className="border-r pr-6">
              <h4 className="text-base font-medium mb-4">选择数据集</h4>
              {loading ? (
                <div className="flex justify-center py-10">
                  <Spin />
                </div>
              ) : availableDatasets.length === 0 ? (
                <Empty
                  description={I18n.t(
                    'external_knowledge_no_available',
                    {},
                    '暂无可用的外部知识库',
                  )}
                />
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {availableDatasets.map(dataset => {
                    const isSelected = selectedDatasets.includes(dataset.id);
                    return (
                      <div
                        key={dataset.id}
                        className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                        onClick={() =>
                          handleSelectDataset(dataset.id, !isSelected)
                        }
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={e =>
                                  handleSelectDataset(
                                    dataset.id,
                                    e.target.checked,
                                  )
                                }
                                onClick={e => e.stopPropagation()}
                              />
                              {dataset.name}
                            </div>
                            {dataset.description && (
                              <Text type="secondary" className="text-sm mt-1">
                                {dataset.description}
                              </Text>
                            )}
                            <div className="flex gap-2 mt-2">
                              <Tag>{dataset.document_count} 文档</Tag>
                              <Tag>{dataset.chunk_count} 片段</Tag>
                              {dataset.status === 1 && (
                                <Tag color="green">活跃</Tag>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Col>

          {/* 右侧：参数设置 */}
          <Col span={12}>
            <div className="pl-6">
              <h4 className="text-base font-medium mb-4">参数设置</h4>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    知识库名称 <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={knowledgeName}
                    onChange={value => setKnowledgeName(value)}
                    placeholder="请输入知识库配置的名称，例如：产品FAQ知识库"
                    className="w-full"
                    maxLength={100}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    知识库描述
                    <span className="text-gray-500 text-xs ml-2">
                      （帮助大模型理解知识库的用途）
                    </span>
                  </label>
                  <TextArea
                    value={knowledgeDescription}
                    onChange={value => setKnowledgeDescription(value)}
                    placeholder="请输入知识库的描述，例如：包含公司产品文档和FAQ的知识库，用于回答客户问题"
                    rows={3}
                    className="w-full"
                    maxLength={500}
                    showCount
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Top K
                  </label>
                  <InputNumber
                    value={settings.top_k}
                    onChange={value =>
                      setSettings(prev => ({ ...prev, top_k: value || 10 }))
                    }
                    min={1}
                    max={1024}
                    className="w-full"
                    placeholder="参与向量余弦计算的块数，默认1024"
                  />
                  <Text type="secondary" className="text-xs">
                    参与向量余弦计算的块数，默认1024
                  </Text>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    页面大小
                  </label>
                  <InputNumber
                    value={settings.page_size}
                    onChange={value =>
                      setSettings(prev => ({ ...prev, page_size: value || 30 }))
                    }
                    min={1}
                    max={100}
                    className="w-full"
                    placeholder="每页最大块数，默认30"
                  />
                  <Text type="secondary" className="text-xs">
                    每页最大块数，默认30
                  </Text>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    相似度阈值
                  </label>
                  <InputNumber
                    value={settings.similarity_threshold}
                    onChange={value =>
                      setSettings(prev => ({
                        ...prev,
                        similarity_threshold: value || 0.2,
                      }))
                    }
                    min={0}
                    max={1}
                    step={0.1}
                    className="w-full"
                    placeholder="最小相似度分数，默认0.2"
                  />
                  <Text type="secondary" className="text-xs">
                    最小相似度分数，默认0.2
                  </Text>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    向量相似度权重
                  </label>
                  <InputNumber
                    value={settings.vector_similarity_weight}
                    onChange={value =>
                      setSettings(prev => ({
                        ...prev,
                        vector_similarity_weight: value || 0.3,
                      }))
                    }
                    min={0}
                    max={1}
                    step={0.1}
                    className="w-full"
                    placeholder="向量余弦相似度权重，默认0.3"
                  />
                  <Text type="secondary" className="text-xs">
                    向量余弦相似度权重，默认0.3
                  </Text>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    关键词匹配
                  </label>
                  <Switch
                    checked={settings.keyword}
                    onChange={checked =>
                      setSettings(prev => ({ ...prev, keyword: checked }))
                    }
                  />
                  <Text type="secondary" className="text-xs ml-2">
                    启用基于关键词的匹配
                  </Text>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    结果高亮
                  </label>
                  <Switch
                    checked={settings.highlight}
                    onChange={checked =>
                      setSettings(prev => ({ ...prev, highlight: checked }))
                    }
                  />
                  <Text type="secondary" className="text-xs ml-2">
                    在结果中高亮匹配的术语
                  </Text>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Modal>
    </>
  );
};
