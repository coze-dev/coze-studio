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
        Toast.error('请选择JSON格式的文件');
        return false;
      }

      // 验证文件大小（限制为10MB）
      if (file.size > 10 * 1024 * 1024) {
        Toast.error('文件大小不能超过10MB');
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
          Toast.error('文件内容不是有效的工作流导出数据');
          return false;
        }
      } catch (error) {
        Toast.error('文件格式错误，请选择有效的JSON文件');
        return false;
      }

      return false; // 阻止自动上传
    } catch (error) {
      Toast.error('读取文件失败');
      return false;
    }
  };

  // 处理导入
  const handleImport = async () => {
    if (!selectedFile || !space_id) {
      Toast.error('请先选择要导入的文件');
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
        throw new Error('导入失败');
      }

      const result = await response.json();
      
      if (result.code === 200 && result.data?.workflow_id) {
        Toast.success('工作流导入成功！');
        
        // 跳转到新创建的工作流或资源库
        setTimeout(() => {
          navigate(`/space/${space_id}/library`);
        }, 1500);
      } else {
        throw new Error(result.msg || '工作流导入失败');
      }
    } catch (error) {
      console.error('导入工作流失败:', error);
      Toast.error(error instanceof Error ? error.message : '工作流导入失败');
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
            返回资源库
          </Button>
          
          <div className="flex items-center mb-4">
            <IconCozWorkflow className="text-2xl mr-3 text-blue-600" />
            <Title level={2} className="m-0">
              导入工作流
            </Title>
          </div>
          
          <Paragraph className="text-gray-600">
            选择之前导出的工作流JSON文件，将其导入到当前工作空间中。
          </Paragraph>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：文件上传和基本信息 */}
          <Card title="选择文件" className="h-fit">
            <Form form={form} layout="vertical">
              <Form.Item label="选择工作流文件" required>
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
                        {selectedFile ? selectedFile.name : '点击选择文件'}
                      </div>
                      <div className="text-sm text-gray-500">
                        支持JSON格式，最大10MB
                      </div>
                    </div>
                  </Button>
                </Upload>
              </Form.Item>

              <Form.Item
                label="工作流名称"
                name="workflowName"
                rules={[
                  { required: true, message: '请输入工作流名称' },
                  { max: 50, message: '工作流名称最多50个字符' }
                ]}
              >
                <Input
                  placeholder="请输入工作流名称"
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
                  {importing ? '导入中...' : '开始导入'}
                </Button>
                
                <Button
                  size="large"
                  onClick={handleReset}
                  disabled={importing}
                >
                  重置
                </Button>
              </div>
            </Form>
          </Card>

          {/* 右侧：工作流预览 */}
          <Card title="工作流预览" className="h-fit">
            {workflowPreview ? (
              <Space direction="vertical" className="w-full" size="middle">
                <div>
                  <Text strong>名称:</Text>
                  <div className="mt-1 p-2 bg-gray-50 rounded">
                    {workflowPreview.name}
                  </div>
                </div>
                
                {workflowPreview.description && (
                  <div>
                    <Text strong>描述:</Text>
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
                    <div className="text-sm text-gray-600">节点数量</div>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 rounded">
                    <div className="text-2xl font-bold text-green-600">
                      {workflowPreview.edges?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">连接数量</div>
                  </div>
                </div>
                
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <Text className="text-yellow-800 text-sm">
                    💡 导入后将创建一个新的工作流，原有工作流不会被影响
                  </Text>
                </div>
              </Space>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <IconCozWorkflow className="text-4xl mb-4 mx-auto opacity-50" />
                <div>选择文件后将显示工作流预览信息</div>
              </div>
            )}
          </Card>
        </div>

        {/* 使用说明 */}
        <Card title="使用说明" className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Title level={4}>支持的文件格式</Title>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>JSON格式的工作流导出文件</li>
                <li>文件大小不超过10MB</li>
                <li>必须包含完整的工作流架构信息</li>
              </ul>
            </div>
            
            <div>
              <Title level={4}>导入流程</Title>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>选择要导入的JSON文件</li>
                <li>系统自动解析并预览工作流信息</li>
                <li>确认或修改工作流名称</li>
                <li>点击"开始导入"完成导入</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default WorkflowImportPage;