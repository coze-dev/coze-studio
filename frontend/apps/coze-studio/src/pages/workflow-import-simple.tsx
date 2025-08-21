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

// 工作流导入组件，遵循coze-studio的标准模式
const WorkflowImportComponent: React.FC<{ spaceId: string }> = ({ spaceId }) => {
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
        
        // 基本验证工作流数据结构
        if (!workflowData.schema || !workflowData.nodes) {
          Toast.error('无效的工作流文件格式');
          return false;
        }
        
        Toast.success('文件验证成功');
      } catch (parseError) {
        Toast.error('JSON格式错误，请检查文件内容');
        return false;
      }
      
      return false; // 阻止自动上传
    } catch (error) {
      console.error('文件处理错误:', error);
      Toast.error('文件处理失败');
      return false;
    }
  };

  // 处理导入
  const handleImport = async () => {
    if (!selectedFile) {
      Toast.error('请先选择文件');
      return;
    }

    const workflowName = form.getFieldValue('workflowName');
    if (!workflowName || !workflowName.trim()) {
      Toast.error('请输入工作流名称');
      return;
    }

    setImporting(true);

    try {
      // 读取文件内容
      const fileContent = await selectedFile.text();
      
      // 准备导入数据
      const importData = {
        workflow_data: fileContent,
        workflow_name: workflowName.trim(),
        space_id: spaceId,
        creator_id: 'current_user', // 这里应该从用户上下文获取
        import_format: 'json'
      };

      // 发送导入请求
      const response = await fetch('/api/workflow_api/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(importData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '导入失败');
      }

      const result = await response.json();
      Toast.success('工作流导入成功！');
      
      // 导入成功后跳转到资源库
      navigate(`/space/${spaceId}/library`);
      
    } catch (error) {
      console.error('导入失败:', error);
      Toast.error(error instanceof Error ? error.message : '导入失败，请重试');
    } finally {
      setImporting(false);
    }
  };

  // 返回资源库
  const handleGoBack = () => {
    navigate(`/space/${spaceId}/library`);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      {/* 头部 */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Button 
          icon={<IconArrowLeft />}
          theme="borderless"
          onClick={handleGoBack}
        />
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 500 }}>
          导入工作流
        </h1>
      </div>

      {/* 导入表单 */}
      <Form 
        form={form}
        layout="vertical"
        style={{ background: '#fff', padding: '24px', borderRadius: '8px', border: '1px solid #e5e5e5' }}
      >
        {/* 文件选择 */}
        <Form.Item label="选择工作流文件" style={{ marginBottom: '24px' }}>
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
                  支持 JSON 格式，文件大小不超过 10MB
                </div>
              </div>
            </Button>
          </Upload>
        </Form.Item>

        {/* 工作流名称 */}
        <Form.Item
          label="工作流名称"
          name="workflowName"
          rules={[
            { required: true, message: '请输入工作流名称' },
            { max: 100, message: '工作流名称不能超过100个字符' }
          ]}
          style={{ marginBottom: '24px' }}
        >
          <Input
            placeholder="请输入工作流名称"
            size="large"
          />
        </Form.Item>

        {/* 操作按钮 */}
        <Form.Item style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <Button onClick={handleGoBack}>
              取消
            </Button>
            <Button
              theme="solid"
              type="primary"
              loading={importing}
              onClick={handleImport}
              disabled={!selectedFile}
            >
              {importing ? '导入中...' : '开始导入'}
            </Button>
          </div>
        </Form.Item>
      </Form>

      {/* 提示信息 */}
      <div style={{ marginTop: '24px', padding: '16px', background: '#f8f9fa', borderRadius: '6px' }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 500 }}>
          导入说明：
        </h4>
        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', color: '#666' }}>
          <li>仅支持本系统导出的 JSON 格式工作流文件</li>
          <li>文件大小限制为 10MB</li>
          <li>导入后将在当前工作空间创建新的工作流</li>
          <li>如果工作流名称已存在，系统会自动添加后缀</li>
        </ul>
      </div>
    </div>
  );
};

// 主页面组件，遵循coze-studio的标准模式
const Page = () => {
  const { space_id } = useParams();
  
  // 如果没有space_id，返回null，让路由系统处理
  if (!space_id) {
    return null;
  }
  
  return <WorkflowImportComponent spaceId={space_id} />;
};

export default Page;