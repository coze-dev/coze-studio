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
  Divider,
  Progress,
  Tag
} from '@coze-arch/coze-design';
import { Card } from '@coze-arch/bot-semi';
import { 
  IconCozWorkflow, 
  IconArrowLeft,
  IconFile,
  IconCheckCircle,
  IconInfoCircle
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
  const [parsing, setParsing] = useState(false);

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
      setParsing(true);
      
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
      } finally {
        setParsing(false);
      }

      return false; // 阻止自动上传
    } catch (error) {
      Toast.error(I18n.t('workflow_import_failed'));
      setParsing(false);
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
    setParsing(false);
    form.resetFields();
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* 页面头部 */}
        <div className="mb-8">
          <Button
            type="tertiary"
            icon={<IconArrowLeft />}
            onClick={() => navigate(`/space/${space_id}/library`)}
            className="mb-4 hover:bg-white/80 transition-colors"
          >
            {I18n.t('workflow_import_back_to_library')}
          </Button>
          
          <div className="flex items-center mb-6">
            <div className="p-3 bg-blue-100 rounded-full mr-4">
              <IconCozWorkflow className="text-3xl text-blue-600" />
            </div>
            <div>
              <Title level={1} className="m-0 text-gray-800">
                {I18n.t('workflow_import')}
              </Title>
              <Paragraph className="text-gray-600 mt-2 text-lg">
                {I18n.t('workflow_import_description')}
              </Paragraph>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* 左侧：文件上传和基本信息 */}
          <div className="xl:col-span-2">
            <Card 
              title={
                <div className="flex items-center">
                  <IconFile className="mr-2 text-blue-600" />
                  {I18n.t('workflow_import_select_file')}
                </div>
              } 
              className="h-fit shadow-lg border-0 bg-white/90 backdrop-blur-sm"
            >
              <Form form={form} layout="vertical">
                <Form.Item label={I18n.t('workflow_import_select_workflow_file')} required>
                  <Upload
                    accept=".json"
                    beforeUpload={handleFileSelect}
                    showUploadList={false}
                    maxCount={1}
                  >
                    <div className={`
                      w-full h-40 border-2 border-dashed rounded-lg transition-all duration-300
                      ${selectedFile 
                        ? 'border-green-300 bg-green-50 hover:border-green-400' 
                        : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
                      }
                      flex flex-col items-center justify-center cursor-pointer
                    `}>
                      {selectedFile ? (
                        <div className="text-center">
                          <IconCheckCircle className="text-4xl text-green-500 mb-3" />
                          <div className="text-lg font-medium text-green-700 mb-2">
                            {I18n.t('workflow_import_file_selected')}
                          </div>
                          <div className="text-sm text-green-600 mb-1">
                            {selectedFile.name}
                          </div>
                          <div className="text-xs text-green-500">
                            {formatFileSize(selectedFile.size)}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <IconUpload className="text-4xl text-gray-400 mb-3" />
                          <div className="text-lg font-medium text-gray-600 mb-2">
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
                    size="large"
                    className="text-lg"
                  />
                </Form.Item>

                <Divider />

                <div className="flex gap-3">
                  <Button
                    type="primary"
                    size="large"
                    loading={importing}
                    disabled={!selectedFile || parsing}
                    onClick={handleImport}
                    className="flex-1 h-12 text-lg font-medium"
                    icon={importing ? undefined : <IconCheckCircle />}
                  >
                    {importing ? I18n.t('Loading') : I18n.t('import')}
                  </Button>
                  
                  <Button
                    size="large"
                    onClick={handleReset}
                    disabled={importing || parsing}
                    className="h-12 px-6"
                  >
                    {I18n.t('Reset')}
                  </Button>
                </div>
              </Form>
            </Card>
          </div>

          {/* 右侧：工作流预览 */}
          <div className="xl:col-span-1">
            <Card 
              title={
                <div className="flex items-center">
                  <IconCozWorkflow className="mr-2 text-green-600" />
                  {I18n.t('workflow_import_preview')}
                </div>
              } 
              className="h-fit shadow-lg border-0 bg-white/90 backdrop-blur-sm"
            >
              {workflowPreview ? (
                <Space direction="vertical" className="w-full" size="large">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center mb-3">
                      <IconCheckCircle className="text-green-500 mr-2" />
                      <Text strong className="text-green-700">{I18n.t('workflow_import_name')}</Text>
                    </div>
                    <div className="text-lg font-medium text-gray-800 bg-white p-3 rounded border">
                      {workflowPreview.name}
                    </div>
                  </div>
                  
                  {workflowPreview.description && (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                      <div className="flex items-center mb-3">
                        <IconInfoCircle className="text-purple-500 mr-2" />
                        <Text strong className="text-purple-700">{I18n.t('workflow_import_description')}</Text>
                      </div>
                      <div className="text-gray-700 bg-white p-3 rounded border">
                        {workflowPreview.description}
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                      <div className="text-3xl font-bold text-blue-600 mb-1">
                        {workflowPreview.nodes?.length || 0}
                      </div>
                      <div className="text-sm font-medium text-blue-700">{I18n.t('workflow_import_nodes')}</div>
                      <Tag color="blue" className="mt-2">节点</Tag>
                    </div>
                    
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                      <div className="text-3xl font-bold text-green-600 mb-1">
                        {workflowPreview.edges?.length || 0}
                      </div>
                      <div className="text-sm font-medium text-green-700">{I18n.t('workflow_import_edges')}</div>
                      <Tag color="green" className="mt-2">连接</Tag>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start">
                      <IconInfoCircle className="text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                      <Text className="text-yellow-800 text-sm leading-relaxed">
                        💡 {I18n.t('workflow_import_tip')}
                      </Text>
                    </div>
                  </div>
                </Space>
              ) : (
                <div className="text-center py-16 text-gray-500">
                  <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <IconCozWorkflow className="text-3xl opacity-50" />
                  </div>
                  <div className="text-lg font-medium mb-2">{I18n.t('workflow_import_select_file_tip')}</div>
                  <div className="text-sm text-gray-400">选择JSON文件后将显示工作流预览</div>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* 使用说明 */}
        <Card 
          title={
            <div className="flex items-center">
              <IconInfoCircle className="mr-2 text-indigo-600" />
              {I18n.t('workflow_import_usage_guide')}
            </div>
          } 
          className="mt-8 shadow-lg border-0 bg-white/90 backdrop-blur-sm"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
              <Title level={4} className="text-blue-800 mb-4 flex items-center">
                <IconFile className="mr-2" />
                {I18n.t('workflow_import_supported_formats')}
              </Title>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  {I18n.t('workflow_import_format_json')}
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  {I18n.t('workflow_import_format_size')}
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  {I18n.t('workflow_import_format_complete')}
                </li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
              <Title level={4} className="text-green-800 mb-4 flex items-center">
                <IconCozWorkflow className="mr-2" />
                {I18n.t('workflow_import_process')}
              </Title>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center">
                  <div className="w-6 h-6 bg-green-500 text-white rounded-full mr-3 flex items-center justify-center text-sm font-bold">1</div>
                  {I18n.t('workflow_import_process_step1')}
                </li>
                <li className="flex items-center">
                  <div className="w-6 h-6 bg-green-500 text-white rounded-full mr-3 flex items-center justify-center text-sm font-bold">2</div>
                  {I18n.t('workflow_import_process_step2')}
                </li>
                <li className="flex items-center">
                  <div className="w-6 h-6 bg-green-500 text-white rounded-full mr-3 flex items-center justify-center text-sm font-bold">3</div>
                  {I18n.t('workflow_import_process_step3')}
                </li>
                <li className="flex items-center">
                  <div className="w-6 h-6 bg-green-500 text-white rounded-full mr-3 flex items-center justify-center text-sm font-bold">4</div>
                  {I18n.t('workflow_import_process_step4')}
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default WorkflowImportPage;