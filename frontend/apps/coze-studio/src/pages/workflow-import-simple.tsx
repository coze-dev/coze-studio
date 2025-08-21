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

// 工作流导入页面 - 优化版界面
const Page = () => {
  const { space_id } = useParams();
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [workflowName, setWorkflowName] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  
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

    setIsImporting(true);

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
    } finally {
      setIsImporting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: '32px 24px'
    }}>
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto',
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        {/* 页面头部 */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '32px',
          textAlign: 'center',
          position: 'relative'
        }}>
          <button 
            onClick={handleGoBack}
            style={{ 
              position: 'absolute',
              left: '24px',
              top: '50%',
              transform: 'translateY(-50%)',
              padding: '12px 20px',
              border: '2px solid rgba(255,255,255,0.3)',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
            }}
          >
            ← 返回资源库
          </button>
          
          <h1 style={{ 
            margin: 0, 
            fontSize: '32px', 
            fontWeight: '700',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            导入工作流
          </h1>
          <p style={{ 
            margin: '12px 0 0 0', 
            fontSize: '16px', 
            opacity: 0.9,
            fontWeight: '300'
          }}>
            将您的工作流文件导入到当前工作空间
          </p>
        </div>

        {/* 主要内容区域 */}
        <div style={{ padding: '40px' }}>
          {/* 文件选择区域 */}
          <div style={{ marginBottom: '32px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '12px', 
              fontWeight: '600',
              fontSize: '16px',
              color: '#2c3e50'
            }}>
              选择工作流文件 *
            </label>
            
            <div style={{
              border: '2px dashed #e1e8ed',
              borderRadius: '12px',
              padding: '40px 20px',
              textAlign: 'center',
              background: '#fafbfc',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#667eea';
              e.currentTarget.style.background = '#f8f9ff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e1e8ed';
              e.currentTarget.style.background = '#fafbfc';
            }}
            >
              <input
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  cursor: 'pointer'
                }}
              />
              
              {!selectedFile ? (
                <div>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    margin: '0 auto 16px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '24px',
                    fontWeight: 'bold'
                  }}>
                    📁
                  </div>
                  <p style={{ 
                    margin: '0 0 8px 0', 
                    fontSize: '18px', 
                    fontWeight: '600',
                    color: '#2c3e50'
                  }}>
                    点击选择文件或拖拽到此处
                  </p>
                  <p style={{ 
                    margin: 0, 
                    fontSize: '14px', 
                    color: '#7f8c8d',
                    lineHeight: '1.5'
                  }}>
                    支持 JSON 格式，文件大小不超过 10MB
                  </p>
                </div>
              ) : (
                <div>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    margin: '0 auto 16px',
                    background: 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '24px',
                    fontWeight: 'bold'
                  }}>
                    ✅
                  </div>
                  <p style={{ 
                    margin: '0 0 8px 0', 
                    fontSize: '18px', 
                    fontWeight: '600',
                    color: '#27ae60'
                  }}>
                    文件已选择
                  </p>
                  <div style={{
                    background: 'white',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #e1e8ed',
                    textAlign: 'left',
                    maxWidth: '400px',
                    margin: '0 auto'
                  }}>
                    <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>
                      📄 {selectedFile.name}
                    </p>
                    <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#7f8c8d' }}>
                      大小: {formatFileSize(selectedFile.size)}
                    </p>
                    <p style={{ margin: 0, fontSize: '14px', color: '#7f8c8d' }}>
                      类型: {selectedFile.type || 'application/json'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 工作流名称输入 */}
          <div style={{ marginBottom: '32px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '12px', 
              fontWeight: '600',
              fontSize: '16px',
              color: '#2c3e50'
            }}>
              工作流名称 *
            </label>
            <input
              type="text"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              placeholder="请输入工作流名称"
              style={{
                padding: '16px 20px',
                border: '2px solid #e1e8ed',
                borderRadius: '12px',
                width: '100%',
                fontSize: '16px',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e1e8ed';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* 操作按钮 */}
          <div style={{ 
            display: 'flex', 
            gap: '16px', 
            justifyContent: 'flex-end',
            marginBottom: '32px'
          }}>
            <button
              onClick={handleGoBack}
              style={{
                padding: '16px 32px',
                border: '2px solid #e1e8ed',
                borderRadius: '12px',
                background: 'white',
                color: '#2c3e50',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#bdc3c7';
                e.currentTarget.style.background = '#f8f9fa';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e1e8ed';
                e.currentTarget.style.background = 'white';
              }}
            >
              取消
            </button>
            <button
              onClick={handleImport}
              disabled={!selectedFile || !workflowName.trim() || isImporting}
              style={{
                padding: '16px 32px',
                border: 'none',
                borderRadius: '12px',
                background: !selectedFile || !workflowName.trim() || isImporting 
                  ? '#bdc3c7' 
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                cursor: !selectedFile || !workflowName.trim() || isImporting 
                  ? 'not-allowed' 
                  : 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                boxShadow: !selectedFile || !workflowName.trim() || isImporting 
                  ? 'none' 
                  : '0 8px 25px rgba(102, 126, 234, 0.3)'
              }}
              onMouseEnter={(e) => {
                if (!(!selectedFile || !workflowName.trim() || isImporting)) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 12px 35px rgba(102, 126, 234, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!(!selectedFile || !workflowName.trim() || isImporting)) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.3)';
                }
              }}
            >
              {isImporting ? '🔄 导入中...' : '🚀 开始导入'}
            </button>
          </div>

          {/* 提示信息 */}
          <div style={{ 
            padding: '24px', 
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', 
            borderRadius: '12px',
            border: '1px solid #e1e8ed'
          }}>
            <h4 style={{ 
              margin: '0 0 16px 0', 
              fontSize: '18px', 
              fontWeight: '600',
              color: '#2c3e50',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              💡 导入说明
            </h4>
            <ul style={{ 
              margin: 0, 
              paddingLeft: '24px', 
              fontSize: '14px', 
              color: '#34495e',
              lineHeight: '1.6'
            }}>
              <li style={{ marginBottom: '8px' }}>
                <strong>文件格式：</strong>仅支持本系统导出的 JSON 格式工作流文件
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong>文件大小：</strong>限制为 10MB，确保上传速度
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong>导入位置：</strong>导入后将在当前工作空间创建新的工作流
              </li>
              <li style={{ marginBottom: '0' }}>
                <strong>名称处理：</strong>如果工作流名称已存在，系统会自动添加后缀
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;