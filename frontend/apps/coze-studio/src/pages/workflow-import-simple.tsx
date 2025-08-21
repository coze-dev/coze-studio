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

import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';

// 测试页面 - 逐步添加功能
const Page = () => {
  const { space_id } = useParams();
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [workflowName, setWorkflowName] = useState('');
  
  if (!space_id) {
    return <div>No space ID found</div>;
  }

  const handleGoBack = () => {
    navigate(`/space/${space_id}/library`);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 验证文件类型
      if (!file.name.endsWith('.json')) {
        alert('请选择JSON格式的文件');
        return;
      }
      
      // 验证文件大小（限制为10MB）
      if (file.size > 10 * 1024 * 1024) {
        alert('文件大小不能超过10MB');
        return;
      }
      
      setSelectedFile(file);
      
      // 尝试读取文件内容并验证
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const workflowData = JSON.parse(content);
          
          // 基本验证工作流数据结构
          if (!workflowData.schema || !workflowData.nodes) {
            alert('无效的工作流文件格式');
            setSelectedFile(null);
            return;
          }
          
          // 如果文件中有名称，自动填充
          if (workflowData.name && !workflowName) {
            setWorkflowName(workflowData.name);
          }
          
          alert('文件验证成功！');
        } catch (error) {
          alert('JSON格式错误，请检查文件内容');
          setSelectedFile(null);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      alert('请先选择文件');
      return;
    }

    if (!workflowName.trim()) {
      alert('请输入工作流名称');
      return;
    }

    try {
      // 读取文件内容
      const fileContent = await selectedFile.text();
      
      // 准备导入数据
      const importData = {
        workflow_data: fileContent,
        workflow_name: workflowName.trim(),
        space_id: space_id,
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
      alert('工作流导入成功！');
      
      // 导入成功后跳转到资源库
      navigate(`/space/${space_id}/library`);
      
    } catch (error) {
      console.error('导入失败:', error);
      alert(error instanceof Error ? error.message : '导入失败，请重试');
    }
  };
  
  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button 
          onClick={handleGoBack}
          style={{ 
            padding: '8px 16px', 
            border: '1px solid #ddd', 
            borderRadius: '4px',
            background: '#fff',
            cursor: 'pointer'
          }}
        >
          ← 返回资源库
        </button>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 500 }}>
          导入工作流
        </h1>
      </div>

      <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', border: '1px solid #e5e5e5' }}>
        <h3>导入工作流</h3>
        
        {/* 文件选择 */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            选择工作流文件 *
          </label>
          <input
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            style={{
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              width: '100%'
            }}
          />
          {selectedFile && (
            <p style={{ marginTop: '8px', color: '#52c41a', fontSize: '14px' }}>
              ✅ 已选择: {selectedFile.name}
            </p>
          )}
        </div>

        {/* 工作流名称 */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            工作流名称 *
          </label>
          <input
            type="text"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            placeholder="请输入工作流名称"
            style={{
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              width: '100%'
            }}
          />
        </div>

        {/* 操作按钮 */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={handleGoBack}
            style={{
              padding: '8px 16px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              background: '#fff',
              cursor: 'pointer'
            }}
          >
            取消
          </button>
          <button
            onClick={handleImport}
            disabled={!selectedFile || !workflowName.trim()}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '4px',
              background: !selectedFile || !workflowName.trim() ? '#ccc' : '#1890ff',
              color: 'white',
              cursor: !selectedFile || !workflowName.trim() ? 'not-allowed' : 'pointer'
            }}
          >
            开始导入
          </button>
        </div>

        {/* 提示信息 */}
        <div style={{ marginTop: '24px', padding: '16px', background: '#f8f9fa', borderRadius: '6px' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '500' }}>
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
    </div>
  );
};

export default Page;