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
import { Button, Upload, Input, Form, Toast } from '@coze-arch/coze-design';
import { IconCozPlus, IconArrowLeft } from '@coze-arch/coze-design/icons';

const WorkflowImportSimplePage: React.FC = () => {
  const { space_id } = useParams<{ space_id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      {/* 页面头部 */}
      <div style={{ marginBottom: '24px' }}>
        <Button
          type="tertiary"
          icon={<IconArrowLeft />}
          onClick={() => navigate(`/space/${space_id}/library`)}
          style={{ marginBottom: '16px' }}
        >
          返回资源库
        </Button>
        
        <h2>导入工作流</h2>
        <p style={{ color: '#666' }}>
          选择之前导出的工作流JSON文件，将其导入到当前工作空间中。
        </p>
      </div>

      {/* 表单 */}
      <Form form={form} layout="vertical">
        <Form.Item label="选择工作流文件" required>
          <Upload
            accept=".json"
            beforeUpload={handleFileSelect}
            showUploadList={false}
            maxCount={1}
          >
            <Button 
              icon={<IconCozPlus />} 
              size="large"
              style={{ width: '100%', height: '120px' }}
              type="tertiary"
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '16px', marginBottom: '8px' }}>
                  {selectedFile ? selectedFile.name : '点击选择文件'}
                </div>
                <div style={{ fontSize: '12px', color: '#999' }}>
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

        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <Button
            type="primary"
            size="large"
            loading={importing}
            disabled={!selectedFile}
            onClick={handleImport}
            style={{ flex: 1 }}
          >
            {importing ? '导入中...' : '开始导入'}
          </Button>
          
          <Button
            size="large"
            onClick={() => {
              setSelectedFile(null);
              form.resetFields();
            }}
            disabled={importing}
          >
            重置
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default WorkflowImportSimplePage;