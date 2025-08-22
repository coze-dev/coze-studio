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
  const [nameError, setNameError] = useState('');
  const [workflowPreview, setWorkflowPreview] = useState<any>(null);
  const [parseError, setParseError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  
  if (!space_id) {
    return <div>No space ID found</div>;
  }

  const handleGoBack = () => {
    navigate(`/space/${space_id}/library`);
  };

  // 验证工作流名称格式
  const validateWorkflowName = (name: string): string => {
    if (!name.trim()) {
      return '工作流名称不能为空';
    }
    
    // 检查是否以字母开头
    if (!/^[a-zA-Z]/.test(name)) {
      return '工作流名称必须以字母开头';
    }
    
    // 检查是否只包含字母、数字和下划线
    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(name)) {
      return '工作流名称只能包含字母、数字和下划线';
    }
    
    // 检查长度（支持1-50个字符，包括单个字母）
    if (name.length < 1) {
      return '工作流名称不能为空';
    }
    
    if (name.length > 50) {
      return '工作流名称不能超过50个字符';
    }
    
    return '';
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setWorkflowName(newName);
    
    // 实时验证名称
    const error = validateWorkflowName(newName);
    setNameError(error);
  };

  // 处理文件选择和验证
  const processFile = (file: File) => {
    setParseError('');
    setWorkflowPreview(null);
    
    // 验证文件类型
    if (!file.name.endsWith('.json')) {
      setParseError('请选择JSON格式的文件');
      return;
    }
    
    // 验证文件大小（限制为10MB）
    if (file.size > 10 * 1024 * 1024) {
      setParseError('文件大小不能超过10MB');
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
          setParseError('无效的工作流文件格式，缺少必要的schema或nodes字段');
          setSelectedFile(null);
          return;
        }
        
        // 设置预览数据
        setWorkflowPreview({
          name: workflowData.name || '未命名工作流',
          description: workflowData.description || '',
          nodeCount: workflowData.nodes?.length || 0,
          edgeCount: workflowData.edges?.length || 0,
          version: workflowData.version || 'v1.0'
        });
        
        // 如果文件中有名称且当前名称为空，自动填充
        if (workflowData.name && !workflowName.trim()) {
          setWorkflowName(workflowData.name);
        }
        
      } catch (error) {
        setParseError('JSON格式错误，请检查文件内容是否有效');
        setSelectedFile(null);
        setWorkflowPreview(null);
      }
    };
    reader.readAsText(file);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // 拖拽处理
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      processFile(files[0]);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setParseError('请先选择文件');
      return;
    }

    // 验证工作流名称
    const nameValidationError = validateWorkflowName(workflowName);
    if (nameValidationError) {
      setNameError(nameValidationError);
      return;
    }

    setIsImporting(true);
    setParseError('');

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
        throw new Error(errorData.message || '导入失败，请检查网络连接或联系管理员');
      }

      const result = await response.json();
      
      // 成功提示
      const successMessage = `🎉 工作流"${workflowName}"导入成功！正在跳转到资源库...`;
      alert(successMessage);
      
      // 导入成功后跳转到资源库
      setTimeout(() => {
        navigate(`/space/${space_id}/library`);
      }, 1500);
      
    } catch (error) {
      console.error('导入失败:', error);
      const errorMessage = error instanceof Error ? error.message : '导入失败，请重试';
      setParseError(errorMessage);
    } finally {
      setIsImporting(false);
    }
  };

  // 重置所有状态
  const handleReset = () => {
    setSelectedFile(null);
    setWorkflowName('');
    setWorkflowPreview(null);
    setParseError('');
    setNameError('');
    setDragActive(false);
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
              border: `2px dashed ${dragActive ? '#667eea' : (parseError ? '#e74c3c' : '#e1e8ed')}`,
              borderRadius: '12px',
              padding: '40px 20px',
              textAlign: 'center',
              background: dragActive ? '#f0f4ff' : (parseError ? '#fdf2f2' : '#fafbfc'),
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              position: 'relative',
              transform: dragActive ? 'scale(1.02)' : 'scale(1)'
            }}
            onMouseEnter={(e) => {
              if (!dragActive && !parseError) {
                e.currentTarget.style.borderColor = '#667eea';
                e.currentTarget.style.background = '#f8f9ff';
              }
            }}
            onMouseLeave={(e) => {
              if (!dragActive && !parseError) {
                e.currentTarget.style.borderColor = '#e1e8ed';
                e.currentTarget.style.background = '#fafbfc';
              }
            }}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
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
            
            {/* 错误提示 */}
            {parseError && (
              <div style={{
                marginTop: '12px',
                padding: '12px 16px',
                background: '#fdf2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                color: '#e74c3c',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ fontSize: '18px' }}>❌</span>
                {parseError}
              </div>
            )}
            
            {/* 工作流预览 */}
            {workflowPreview && !parseError && (
              <div style={{
                marginTop: '16px',
                padding: '20px',
                background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                border: '1px solid #bae6fd',
                borderRadius: '12px'
              }}>
                <h4 style={{
                  margin: '0 0 16px 0',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#0369a1',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  🔍 工作流预览
                </h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  marginBottom: '12px'
                }}>
                  <div style={{
                    background: 'white',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #e0f2fe'
                  }}>
                    <div style={{ fontSize: '12px', color: '#0369a1', marginBottom: '4px' }}>名称</div>
                    <div style={{ fontWeight: '600', color: '#1e293b' }}>{workflowPreview.name}</div>
                  </div>
                  <div style={{
                    background: 'white',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #e0f2fe'
                  }}>
                    <div style={{ fontSize: '12px', color: '#0369a1', marginBottom: '4px' }}>版本</div>
                    <div style={{ fontWeight: '600', color: '#1e293b' }}>{workflowPreview.version}</div>
                  </div>
                  <div style={{
                    background: 'white',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #e0f2fe'
                  }}>
                    <div style={{ fontSize: '12px', color: '#0369a1', marginBottom: '4px' }}>节点数</div>
                    <div style={{ fontWeight: '600', color: '#1e293b' }}>{workflowPreview.nodeCount} 个</div>
                  </div>
                  <div style={{
                    background: 'white',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #e0f2fe'
                  }}>
                    <div style={{ fontSize: '12px', color: '#0369a1', marginBottom: '4px' }}>连接数</div>
                    <div style={{ fontWeight: '600', color: '#1e293b' }}>{workflowPreview.edgeCount} 个</div>
                  </div>
                </div>
                {workflowPreview.description && (
                  <div style={{
                    background: 'white',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #e0f2fe'
                  }}>
                    <div style={{ fontSize: '12px', color: '#0369a1', marginBottom: '4px' }}>描述</div>
                    <div style={{ color: '#1e293b', lineHeight: '1.5' }}>{workflowPreview.description}</div>
                  </div>
                )}
              </div>
            )}
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
              onChange={handleNameChange}
              placeholder="请输入工作流名称（以字母开头，支持单个字母，只能包含字母、数字、下划线）"
              style={{
                padding: '16px 20px',
                border: `2px solid ${nameError ? '#e74c3c' : '#e1e8ed'}`,
                borderRadius: '12px',
                width: '100%',
                fontSize: '16px',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box',
                background: nameError ? '#fdf2f2' : 'white'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = nameError ? '#e74c3c' : '#667eea';
                e.target.style.boxShadow = nameError 
                  ? '0 0 0 3px rgba(231, 76, 60, 0.1)' 
                  : '0 0 0 3px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = nameError ? '#e74c3c' : '#e1e8ed';
                e.target.style.boxShadow = 'none';
              }}
            />
            {nameError && (
              <div style={{
                marginTop: '8px',
                padding: '8px 12px',
                background: '#fdf2f2',
                border: '1px solid #fecaca',
                borderRadius: '6px',
                color: '#e74c3c',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span style={{ fontSize: '16px' }}>⚠️</span>
                {nameError}
              </div>
            )}
            {!nameError && workflowName.trim() && (
              <div style={{
                marginTop: '8px',
                padding: '8px 12px',
                background: '#f0f9ff',
                border: '1px solid #bae6fd',
                borderRadius: '6px',
                color: '#0369a1',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span style={{ fontSize: '16px' }}>✅</span>
                名称格式正确
              </div>
            )}
          </div>

          {/* 操作按钮 */}
          <div style={{ 
            display: 'flex', 
            gap: '16px', 
            justifyContent: 'flex-end',
            marginBottom: '32px'
          }}>
            <button
              onClick={selectedFile ? handleReset : handleGoBack}
              disabled={isImporting}
              style={{
                padding: '16px 32px',
                border: '2px solid #e1e8ed',
                borderRadius: '12px',
                background: 'white',
                color: '#2c3e50',
                cursor: isImporting ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                opacity: isImporting ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if (!isImporting) {
                  e.currentTarget.style.borderColor = '#bdc3c7';
                  e.currentTarget.style.background = '#f8f9fa';
                }
              }}
              onMouseLeave={(e) => {
                if (!isImporting) {
                  e.currentTarget.style.borderColor = '#e1e8ed';
                  e.currentTarget.style.background = 'white';
                }
              }}
            >
              {selectedFile ? '🔄 重置' : '❌ 取消'}
            </button>
            <button
              onClick={handleImport}
              disabled={!selectedFile || !workflowName.trim() || isImporting || !!nameError}
              style={{
                padding: '16px 32px',
                border: 'none',
                borderRadius: '12px',
                background: !selectedFile || !workflowName.trim() || isImporting || !!nameError
                  ? '#bdc3c7' 
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                cursor: !selectedFile || !workflowName.trim() || isImporting || !!nameError
                  ? 'not-allowed' 
                  : 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                boxShadow: !selectedFile || !workflowName.trim() || isImporting || !!nameError
                  ? 'none' 
                  : '0 8px 25px rgba(102, 126, 234, 0.3)'
              }}
              onMouseEnter={(e) => {
                if (!(!selectedFile || !workflowName.trim() || isImporting || !!nameError)) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 12px 35px rgba(102, 126, 234, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!(!selectedFile || !workflowName.trim() || isImporting || !!nameError)) {
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
                <strong>名称规则：</strong>工作流名称必须以字母开头（支持单个字母），只能包含字母、数字和下划线
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