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

import { useState } from 'react';
import { useBoolean } from 'ahooks';
import { I18n } from '@coze-arch/i18n';
import { Modal, Upload, Button, Input, Form, message, Space, Typography, Tag, Progress } from '@coze-arch/coze-design';
import { IconUpload, IconFile, IconCheckCircle, IconInfoCircle } from '@coze-arch/coze-design/icons';
import * as yaml from 'js-yaml';

import { useImportAction } from './use-import-action';
import { type WorkflowResourceActionProps } from './type';

const { Text } = Typography;

export const useImportWorkflowModal = (props: WorkflowResourceActionProps) => {
  const [importModalVisible, { setTrue: openImportModal, setFalse: closeImportModal }] = useBoolean(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [workflowName, setWorkflowName] = useState('');
  const [workflowPreview, setWorkflowPreview] = useState<any>(null);
  const [parsing, setParsing] = useState(false);
  const [form] = Form.useForm();

  const { actionHandler: importAction, importing } = useImportAction(props);

  const handleFileSelect = async (file: File) => {
    try {
      // 验证文件类型 - 支持 JSON, YML, YAML
      const fileName = file.name.toLowerCase();
      const isValidFile = fileName.endsWith('.json') || fileName.endsWith('.yml') || fileName.endsWith('.yaml');
      
      if (!isValidFile) {
        message.error(I18n.t('workflow_import_error_invalid_file'));
        return false;
      }

      // 验证文件大小（限制为10MB）
      if (file.size > 10 * 1024 * 1024) {
        message.error(I18n.t('workflow_import_error_invalid_file'));
        return false;
      }

      setSelectedFile(file);
      setParsing(true);
      
      // 读取并预览文件内容
      const fileContent = await file.text();
      try {
        let workflowData;
        
        // 根据文件扩展名选择解析器
        if (fileName.endsWith('.yml') || fileName.endsWith('.yaml')) {
          workflowData = yaml.load(fileContent) as any;
        } else {
          workflowData = JSON.parse(fileContent);
        }
        
        // 验证工作流数据结构
        if (workflowData && typeof workflowData === 'object') {
          // 兼容不同的数据结构
          const workflowName = workflowData.name || workflowData.workflow_id || `Imported_${Date.now()}`;
          
          setWorkflowPreview(workflowData);
          setWorkflowName(workflowName);
          form.setFieldsValue({ workflowName: workflowName });
        } else {
          message.error(I18n.t('workflow_import_error_invalid_structure'));
          return false;
        }
      } catch (error) {
        console.error('File parsing error:', error);
        message.error(I18n.t('workflow_import_error_parse_failed'));
        return false;
      } finally {
        setParsing(false);
      }

      return false; // 阻止自动上传
    } catch (error) {
      console.error('File selection error:', error);
      message.error(I18n.t('workflow_import_error_invalid_file'));
      setParsing(false);
      return false;
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      message.error(I18n.t('workflow_import_failed'));
      return;
    }

    try {
      await form.validateFields();
      await importAction(selectedFile);
      closeImportModal();
      resetForm();
    } catch (error) {
      // 错误已在useImportAction中处理
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setWorkflowName('');
    setWorkflowPreview(null);
    setParsing(false);
    form.resetFields();
  };

  const handleCancel = () => {
    closeImportModal();
    resetForm();
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const importModal = (
    <Modal
      title={
        <div className="flex items-center">
          <IconFile className="mr-2 text-blue-600" />
          {I18n.t('workflow_import')}
        </div>
      }
      visible={importModalVisible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          {I18n.t('Cancel')}
        </Button>,
        <Button
          key="import"
          type="primary"
          loading={importing}
          disabled={!selectedFile || parsing}
          onClick={handleImport}
          icon={importing ? undefined : <IconCheckCircle />}
        >
          {I18n.t('import')}
        </Button>,
      ]}
      width={700}
      className="workflow-import-modal"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label={I18n.t('workflow_import_select_file')}
          required
        >
          <Upload
            accept=".json,.yml,.yaml"
            beforeUpload={handleFileSelect}
            showUploadList={false}
            maxCount={1}
          >
            <div className={`
              w-full h-32 border-2 border-dashed rounded-lg transition-all duration-300 cursor-pointer
              ${selectedFile 
                ? 'border-green-300 bg-green-50 hover:border-green-400' 
                : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
              }
              flex flex-col items-center justify-center
            `}>
              {selectedFile ? (
                <div className="text-center">
                  <IconCheckCircle className="text-3xl text-green-500 mb-2" />
                  <div className="text-base font-medium text-green-700 mb-1">
                    {I18n.t('workflow_import_file_selected')}
                  </div>
                  <div className="text-sm text-green-600 mb-1">
                    {selectedFile.name}
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-xs">
                    <span className="text-green-500">{formatFileSize(selectedFile.size)}</span>
                    <span className="text-gray-300">•</span>
                    <Tag 
                      size="small" 
                      className="text-xs px-2 py-0"
                      color={selectedFile.name.toLowerCase().endsWith('.json') ? 'blue' : 'purple'}
                    >
                      {selectedFile.name.toLowerCase().endsWith('.json') ? 'JSON' : 'YAML'}
                    </Tag>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <IconUpload className="text-3xl text-gray-400 mb-2" />
                  <div className="text-base font-medium text-gray-600 mb-1">
                    {I18n.t('workflow_import_drag_drop')}
                  </div>
                  <div className="text-sm text-gray-500">
                    {I18n.t('workflow_import_support_format')}
                  </div>
                </div>
              )}
            </div>
          </Upload>
        </Form.Item>

        {parsing && (
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <IconInfoCircle className="text-blue-500 mr-2" />
              <Text className="text-blue-600">{I18n.t('workflow_import_preview_loading')}</Text>
            </div>
            <Progress percent={100} status="active" showInfo={false} />
          </div>
        )}

        {workflowPreview && (
          <Form.Item
            label={
              <div className="flex items-center justify-between">
                <span>{I18n.t('workflow_import_preview')}</span>
                {selectedFile && (
                  <Tag 
                    color={selectedFile.name.toLowerCase().endsWith('.json') ? 'blue' : 'purple'}
                    className="ml-2"
                  >
                    {selectedFile.name.toLowerCase().endsWith('.json') ? 'JSON Format' : 'YAML Format'}
                  </Tag>
                )}
              </div>
            }
          >
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="text-center p-3 bg-white rounded border">
                  <div className="text-xl font-bold text-blue-600">
                    {workflowPreview.nodes?.length || 0}
                  </div>
                  <div className="text-xs text-blue-700">{I18n.t('workflow_import_nodes')}</div>
                  <Tag color="blue" size="small" className="mt-1">节点</Tag>
                </div>
                
                <div className="text-center p-3 bg-white rounded border">
                  <div className="text-xl font-bold text-green-600">
                    {workflowPreview.edges?.length || 0}
                  </div>
                  <div className="text-xs text-green-700">{I18n.t('workflow_import_edges')}</div>
                  <Tag color="green" size="small" className="mt-1">连接</Tag>
                </div>
              </div>
              
              <div className="space-y-2">
                <div>
                  <Text strong className="text-blue-700">{I18n.t('workflow_import_name')}:</Text>
                  <div className="mt-1 p-2 bg-white rounded border text-sm">
                    {workflowPreview.name}
                  </div>
                </div>
                
                {workflowPreview.description && (
                  <div>
                    <Text strong className="text-purple-700">{I18n.t('workflow_import_description')}:</Text>
                    <div className="mt-1 p-2 bg-white rounded border text-sm">
                      {workflowPreview.description}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Form.Item>
        )}

        <Form.Item
          label={I18n.t('workflow_import_workflow_name')}
          name="workflowName"
          rules={[
            { required: true, message: I18n.t('workflow_import_workflow_name_required') },
            { min: 1, message: I18n.t('workflow_import_workflow_name_min_length') },
            { max: 50, message: I18n.t('workflow_import_workflow_name_max_length') }
          ]}
        >
          <Input
            placeholder={I18n.t('workflow_import_workflow_name_placeholder')}
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="text-base"
          />
        </Form.Item>
      </Form>
    </Modal>
  );

  return {
    openImportModal,
    closeImportModal,
    importModal,
  };
}; 