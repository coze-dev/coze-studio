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
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Button, 
  Upload, 
  Input, 
  Form, 
  Typography, 
  Space,
  Toast,
  Divider 
} from '@coze-arch/coze-design';
import { Card } from '@coze-arch/bot-semi';
import { 
  IconCozWorkflow, 
  IconArrowLeft 
} from '@coze-arch/coze-design/icons';
import { IconUpload } from '@coze-arch/bot-icons';
import { I18n } from '@coze-arch/i18n';

const { Title, Paragraph, Text } = Typography;

interface WorkflowPreview {
  name: string;
  description?: string;
  nodes?: any[];
  edges?: any[];
  schema?: any;
}

const WorkflowImportPage: React.FC = () => {
  const { space_id } = useParams<{ space_id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [workflowPreview, setWorkflowPreview] = useState<WorkflowPreview | null>(null);
  const [importing, setImporting] = useState(false);

  // 处理文件选择
  const handleFileSelect = async (file: File) => {
    try {
      // 验证文件类型
      if (!file.name.endsWith('.json')) {
        Toast.error(I18n.t('workflow_import_failed'));
        return false;
      }

      // 验证文件大小（限制为10MB）
      if (file.size > 10 * 1024 * 1024) {
        Toast.error(I18n.t('workflow_import_failed'));
        return false;
      }

      setSelectedFile(file);
      
      // 读取并预览文件内容
      const fileContent = await file.text();
      try {
        const workflowData = JSON.parse(fileContent);
        if (workflowData.name && workflowData.schema) {
          setWorkflowPreview(workflowData);
          form.setFieldsValue({ workflowName: workflowData.name });
        } else {
          Toast.error(I18n.t('workflow_import_failed'));
          return false;
        }
      } catch (error) {
        Toast.error(I18n.t('workflow_import_failed'));
        return false;
      }

      return false; // 阻止自动上传
    } catch (error) {
      Toast.error(I18n.t('workflow_import_failed'));
      return false;
    }
  };

  // 处理导入
  const handleImport = async () => {
    if (!selectedFile || !space_id) {
      Toast.error(I18n.t('workflow_import_failed'));
      return;
    }

    try {
      await form.validateFields();
      setImporting(true);
      
      // 读取文件内容
      const fileContent = await selectedFile.text();
      const values = form.getFieldsValue();
      
      // 调用导入API
      const response = await fetch('/api/workflow_api/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workflow_data: fileContent,
          workflow_name: values.workflowName,
          space_id: space_id,
          creator_id: '1', // 这里应该从用户上下文获取
          import_format: 'json',
        }),
      });

      if (!response.ok) {
        throw new Error(I18n.t('workflow_import_failed'));
      }

      const result = await response.json();
      
      if (result.code === 200 && result.data?.workflow_id) {
        Toast.success(I18n.t('workflow_import_success'));
        
        // 跳转到新创建的工作流或资源库
        setTimeout(() => {
          navigate(`/space/${space_id}/library`);
        }, 1500);
      } else {
        throw new Error(result.msg || I18n.t('workflow_import_failed'));
      }
    } catch (error) {
      console.error('导入工作流失败:', error);
      Toast.error(error instanceof Error ? error.message : I18n.t('workflow_import_failed'));
    } finally {
      setImporting(false);
    }
  };

  // 重置表单
  const handleReset = () => {
    setSelectedFile(null);
    setWorkflowPreview(null);
    form.resetFields();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* 页面头部 */}
        <div className="mb-8">
          <Button
            type="tertiary"
            icon={<IconArrowLeft />}
            onClick={() => navigate(`/space/${space_id}/library`)}
            className="mb-4"
          >
            {I18n.t('workflow_import_back_to_library')}
          </Button>
          
          <div className="flex items-center mb-4">
            <IconCozWorkflow className="text-2xl mr-3 text-blue-600" />
            <Title level={2} className="m-0">
              {I18n.t('workflow_import')}
            </Title>
          </div>
          
          <Paragraph className="text-gray-600">
            {I18n.t('workflow_import_description')}
          </Paragraph>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：文件上传和基本信息 */}
          <Card title={I18n.t('workflow_import_select_file')} className="h-fit">
            <Form form={form} layout="vertical">
              <Form.Item label={I18n.t('workflow_import_select_workflow_file')} required>
                <Upload
                  accept=".json"
                  beforeUpload={handleFileSelect}
                  showUploadList={false}
                  maxCount={1}
                >
                  <Button 
                    icon={<IconUpload />} 
                    size="large"
                    className="w-full h-32 border-2 border-dashed"
                    type="tertiary"
                  >
                    <div className="text-center">
                      <div className="text-lg mb-2">
                        {selectedFile ? selectedFile.name : I18n.t('workflow_import_click_upload')}
                      </div>
                      <div className="text-sm text-gray-500">
                        {I18n.t('workflow_import_support_format')}
                      </div>
                    </div>
                  </Button>
                </Upload>
              </Form.Item>

              <Form.Item
                label={I18n.t('workflow_import_workflow_name')}
                name="workflowName"
                rules={[
                  { required: true, message: I18n.t('workflow_import_workflow_name_required') },
                  { max: 50, message: I18n.t('workflow_import_workflow_name_max_length') }
                ]}
              >
                <Input
                  placeholder={I18n.t('workflow_import_workflow_name_placeholder')}
                  size="large"
                />
              </Form.Item>

              <Divider />

              <div className="flex gap-3">
                <Button
                  type="primary"
                  size="large"
                  loading={importing}
                  disabled={!selectedFile}
                  onClick={handleImport}
                  className="flex-1"
                >
                  {importing ? I18n.t('Loading') : I18n.t('import')}
                </Button>
                
                <Button
                  size="large"
                  onClick={handleReset}
                  disabled={importing}
                >
                  {I18n.t('Reset')}
                </Button>
              </div>
            </Form>
          </Card>

          {/* 右侧：工作流预览 */}
          <Card title={I18n.t('workflow_import_preview')} className="h-fit">
            {workflowPreview ? (
              <Space direction="vertical" className="w-full" size="middle">
                <div>
                  <Text strong>{I18n.t('workflow_import_name')}:</Text>
                  <div className="mt-1 p-2 bg-gray-50 rounded">
                    {workflowPreview.name}
                  </div>
                </div>
                
                {workflowPreview.description && (
                  <div>
                    <Text strong>{I18n.t('workflow_import_description')}:</Text>
                    <div className="mt-1 p-2 bg-gray-50 rounded">
                      {workflowPreview.description}
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded">
                    <div className="text-2xl font-bold text-blue-600">
                      {workflowPreview.nodes?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">{I18n.t('workflow_import_nodes')}</div>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 rounded">
                    <div className="text-2xl font-bold text-green-600">
                      {workflowPreview.edges?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">{I18n.t('workflow_import_edges')}</div>
                  </div>
                </div>
                
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <Text className="text-yellow-800 text-sm">
                    💡 {I18n.t('workflow_import_tip')}
                  </Text>
                </div>
              </Space>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <IconCozWorkflow className="text-4xl mb-4 mx-auto opacity-50" />
                <div>{I18n.t('workflow_import_select_file_tip')}</div>
              </div>
            )}
          </Card>
        </div>

        {/* 使用说明 */}
        <Card title={I18n.t('workflow_import_usage_guide')} className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Title level={4}>{I18n.t('workflow_import_supported_formats')}</Title>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>{I18n.t('workflow_import_format_json')}</li>
                <li>{I18n.t('workflow_import_format_size')}</li>
                <li>{I18n.t('workflow_import_format_complete')}</li>
              </ul>
            </div>
            
            <div>
              <Title level={4}>{I18n.t('workflow_import_process')}</Title>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>{I18n.t('workflow_import_process_step1')}</li>
                <li>{I18n.t('workflow_import_process_step2')}</li>
                <li>{I18n.t('workflow_import_process_step3')}</li>
                <li>{I18n.t('workflow_import_process_step4')}</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default WorkflowImportPage;