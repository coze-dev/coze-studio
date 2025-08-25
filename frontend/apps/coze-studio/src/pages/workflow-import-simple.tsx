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
import { useState, useCallback, useRef, useEffect } from 'react';
import * as yaml from 'js-yaml';

interface WorkflowPreview {
  name: string;
  description: string;
  nodeCount: number;
  edgeCount: number;
  version: string;
}

interface WorkflowFile {
  id: string;
  file: File;
  fileName: string;
  workflowName: string;
  workflowData: string;
  status: 'pending' | 'validating' | 'valid' | 'invalid' | 'importing' | 'success' | 'failed';
  error?: string;
  preview?: WorkflowPreview;
}

interface ImportProgress {
  totalCount: number;
  successCount: number;
  failedCount: number;
  currentProcessing: string;
}

interface ImportResult {
  total_count: number;
  success_count: number;
  failed_count: number;
  success_list?: Array<{ file_name: string }>;
  failed_list?: Array<{ file_name: string; error_message: string }>;
}

interface ApiResponse {
  data: ImportResult;
  message?: string;
}

// 工作流导入页面 - 支持单个和批量导入
const Page = () => {
  const { space_id } = useParams<{ space_id: string }>();
  const navigate = useNavigate();
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // 导入模式：single 或 batch
  const [importMode, setImportMode] = useState<'single' | 'batch'>('single');
  
  // 单个导入状态
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [workflowName, setWorkflowName] = useState('');
  const [workflowPreview, setWorkflowPreview] = useState<WorkflowPreview | null>(null);
  
  // 批量导入状态
  const [selectedFiles, setSelectedFiles] = useState<WorkflowFile[]>([]);
  const [batchImportMode, setBatchImportMode] = useState<'batch' | 'transaction'>('batch');
  
  // 通用状态
  const [isImporting, setIsImporting] = useState(false);
  const [nameError, setNameError] = useState('');
  const [parseError, setParseError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null);
  const [importResults, setImportResults] = useState<ImportResult | null>(null);

  // 清理函数
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  if (!space_id) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#e53e3e'
      }}>
        未找到工作空间ID
      </div>
    );
  }

  const handleGoBack = useCallback(() => {
    try {
      navigate(`/space/${space_id}/library`);
    } catch (error) {
      console.error('导航失败:', error);
    }
  }, [navigate, space_id]);

  // 验证工作流名称格式
  const validateWorkflowName = useCallback((name: string): string => {
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
  }, []);

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setWorkflowName(newName);
    
    // 实时验证名称
    const error = validateWorkflowName(newName);
    setNameError(error);
  }, [validateWorkflowName]);

  // 处理单个文件选择和验证
  const processSingleFile = useCallback((file: File) => {
    setParseError('');
    setWorkflowPreview(null);
    
    // 验证文件类型 - 支持 JSON, YML, YAML
    const fileName = file.name.toLowerCase();
    const isValidFile = fileName.endsWith('.json') || fileName.endsWith('.yml') || fileName.endsWith('.yaml');
    
    if (!isValidFile) {
      setParseError('请选择JSON或YAML格式的文件');
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
        if (!content) {
          setParseError('文件内容为空');
          setSelectedFile(null);
          return;
        }
        
        let workflowData;
        
        // 根据文件扩展名选择解析器
        if (fileName.endsWith('.yml') || fileName.endsWith('.yaml')) {
          workflowData = yaml.load(content) as any;
        } else {
          workflowData = JSON.parse(content);
        }
        
        // 基本验证工作流数据结构
        if (!workflowData || typeof workflowData !== 'object') {
          setParseError('无效的工作流文件格式');
          setSelectedFile(null);
          return;
        }
        
        if (!workflowData.schema || !workflowData.nodes || !Array.isArray(workflowData.nodes)) {
          setParseError('无效的工作流文件格式，缺少必要的schema或nodes字段');
          setSelectedFile(null);
          return;
        }
        
        // 设置预览数据
        setWorkflowPreview({
          name: workflowData.name || '未命名工作流',
          description: workflowData.description || '',
          nodeCount: Array.isArray(workflowData.nodes) ? workflowData.nodes.length : 0,
          edgeCount: Array.isArray(workflowData.edges) ? workflowData.edges.length : 0,
          version: workflowData.version || 'v1.0'
        });
        
        // 如果文件中有名称且当前名称为空，自动填充
        if (workflowData.name && !workflowName.trim()) {
          setWorkflowName(workflowData.name);
        }
        
      } catch (error) {
        console.error('文件解析错误:', error);
        const formatName = fileName.endsWith('.yml') || fileName.endsWith('.yaml') ? 'YAML' : 'JSON';
        setParseError(`${formatName}格式错误，请检查文件内容是否有效`);
        setSelectedFile(null);
        setWorkflowPreview(null);
      }
    };
    
    reader.onerror = () => {
      setParseError('文件读取失败');
      setSelectedFile(null);
    };
    
    reader.readAsText(file);
  }, [workflowName]);

  // 处理批量文件选择和验证
  const processBatchFiles = useCallback((files: File[]) => {
    if (files.length > 50) {
      setParseError('最多支持同时上传50个文件');
      return;
    }
    
    const newWorkflowFiles: WorkflowFile[] = files
      .filter(file => {
        const fileName = file.name.toLowerCase();
        return fileName.endsWith('.json') || fileName.endsWith('.yml') || fileName.endsWith('.yaml');
      })
      .map(file => {
        const fileName = file.name.toLowerCase();
        let workflowName = file.name;
        if (fileName.endsWith('.json')) {
          workflowName = file.name.replace('.json', '');
        } else if (fileName.endsWith('.yml')) {
          workflowName = file.name.replace('.yml', '');
        } else if (fileName.endsWith('.yaml')) {
          workflowName = file.name.replace('.yaml', '');
        }
        
        return {
          id: Math.random().toString(36).substr(2, 9),
          file,
          fileName: file.name,
          workflowName: workflowName,
          workflowData: '',
          status: 'pending' as const,
        };
      });

    setSelectedFiles(prev => [...prev, ...newWorkflowFiles]);

    // 异步读取文件内容
    newWorkflowFiles.forEach(workflowFile => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          if (!content) {
            setSelectedFiles(prev => prev.map(f => 
              f.id === workflowFile.id 
                ? { ...f, status: 'invalid' as const, error: '文件内容为空' }
                : f
            ));
            return;
          }
          
          const workflowData = JSON.parse(content);
          
          if (!workflowData || typeof workflowData !== 'object') {
            setSelectedFiles(prev => prev.map(f => 
              f.id === workflowFile.id 
                ? { ...f, status: 'invalid' as const, error: '无效的工作流文件格式' }
                : f
            ));
            return;
          }

          if (!workflowData.schema || !workflowData.nodes || !Array.isArray(workflowData.nodes)) {
            setSelectedFiles(prev => prev.map(f => {
              if (f.id === workflowFile.id) {
                return {
                  ...f,
                  status: 'invalid' as const,
                  error: '无效的工作流文件格式，缺少必要的schema或nodes字段',
                };
              }
              return f;
            }));
            return;
          }

          setSelectedFiles(prev => prev.map(f => {
            if (f.id === workflowFile.id) {
              return {
                ...f,
                workflowData: content,
                status: 'valid' as const,
                preview: {
                  name: workflowData.name || '未命名工作流',
                  description: workflowData.description || '',
                  nodeCount: Array.isArray(workflowData.nodes) ? workflowData.nodes.length : 0,
                  edgeCount: Array.isArray(workflowData.edges) ? workflowData.edges.length : 0,
                  version: workflowData.version || 'v1.0'
                }
              };
            }
            return f;
          }));
        } catch (error) {
          console.error('批量文件解析错误:', error);
          const fileName = workflowFile.fileName.toLowerCase();
          const formatName = fileName.endsWith('.yml') || fileName.endsWith('.yaml') ? 'YAML' : 'JSON';
          
          setSelectedFiles(prev => prev.map(f => {
            if (f.id === workflowFile.id) {
              return {
                ...f,
                status: 'invalid' as const,
                error: `${formatName}格式错误，请检查文件内容是否有效`,
              };
            }
            return f;
          }));
        }
      };
      
      reader.onerror = () => {
        setSelectedFiles(prev => prev.map(f => 
          f.id === workflowFile.id 
            ? { ...f, status: 'invalid' as const, error: '文件读取失败' }
            : f
        ));
      };
      
      reader.readAsText(workflowFile.file);
    });
  }, []);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (importMode === 'single') {
      if (files[0]) {
        processSingleFile(files[0]);
      }
    } else {
      processBatchFiles(files);
    }
    
    // 清空input值，允许重复选择同一文件
    event.target.value = '';
  }, [importMode, processSingleFile, processBatchFiles]);

  // 拖拽处理
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (importMode === 'single') {
      if (files[0]) {
        processSingleFile(files[0]);
      }
    } else {
      processBatchFiles(files);
    }
  }, [importMode, processSingleFile, processBatchFiles]);

  // 单个导入处理
  const handleSingleImport = useCallback(async () => {
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
      // 创建新的AbortController
      abortControllerRef.current = new AbortController();
      
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
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: '导入失败' }));
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
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('导入请求已取消');
        return;
      }
      console.error('导入失败:', error);
      const errorMessage = error instanceof Error ? error.message : '导入失败，请重试';
      setParseError(errorMessage);
    } finally {
      setIsImporting(false);
      abortControllerRef.current = null;
    }
  }, [selectedFile, workflowName, validateWorkflowName, space_id, navigate]);

  // 批量导入处理
  const handleBatchImport = useCallback(async () => {
    if (selectedFiles.length === 0) {
      setParseError('请先选择文件');
      return;
    }

    // 验证所有文件
    const validFiles = selectedFiles.filter(f => f.status === 'valid');
    if (validFiles.length === 0) {
      setParseError('没有有效的文件可以导入');
      return;
    }

    // 验证工作流名称
    const nameErrors: string[] = [];
    const nameSet = new Set<string>();
    
    validFiles.forEach((file) => {
      const error = validateWorkflowName(file.workflowName);
      if (error) {
        nameErrors.push(`文件 "${file.fileName}": ${error}`);
      }
      
      if (nameSet.has(file.workflowName)) {
        nameErrors.push(`工作流名称重复: "${file.workflowName}"`);
      }
      nameSet.add(file.workflowName);
    });

    if (nameErrors.length > 0) {
      setParseError(`名称验证失败:\n${nameErrors.join('\n')}`);
      return;
    }

    setIsImporting(true);
    setImportProgress({
      totalCount: validFiles.length,
      successCount: 0,
      failedCount: 0,
      currentProcessing: validFiles[0]?.fileName || '',
    });

    try {
      // 创建新的AbortController
      abortControllerRef.current = new AbortController();
      
      const workflowFiles = validFiles.map(file => ({
        file_name: file.fileName,
        workflow_data: file.workflowData,
        workflow_name: file.workflowName,
      }));

      const response = await fetch('/api/workflow_api/batch_import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workflow_files: workflowFiles,
          space_id: space_id,
          creator_id: 'current_user',
          import_format: 'json',
          import_mode: batchImportMode,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: '批量导入失败' }));
        throw new Error(errorData.message || '批量导入失败');
      }

      const result: ApiResponse = await response.json();
      setImportResults(result.data);

      // 更新文件状态
      setSelectedFiles(prev => prev.map(file => {
        const successResult = result.data.success_list?.find(
          (s) => s.file_name === file.fileName
        );
        const failedResult = result.data.failed_list?.find(
          (f) => f.file_name === file.fileName
        );

        if (successResult) {
          return { ...file, status: 'success' as const };
        } else if (failedResult) {
          return { 
            ...file, 
            status: 'failed' as const, 
            error: failedResult.error_message 
          };
        }
        return file;
      }));

      setImportProgress({
        totalCount: result.data.total_count,
        successCount: result.data.success_count,
        failedCount: result.data.failed_count,
        currentProcessing: '',
      });

      if (result.data.success_count > 0) {
        setTimeout(() => {
          alert(`批量导入完成！\n成功: ${result.data.success_count}个\n失败: ${result.data.failed_count}个`);
        }, 1000);
      }

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('批量导入请求已取消');
        return;
      }
      console.error('批量导入失败:', error);
      setParseError(error instanceof Error ? error.message : '批量导入失败，请重试');
    } finally {
      setIsImporting(false);
      abortControllerRef.current = null;
    }
  }, [selectedFiles, validateWorkflowName, space_id, batchImportMode]);

  // 删除批量文件
  const removeBatchFile = useCallback((id: string) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  // 更新批量工作流名称
  const updateBatchWorkflowName = useCallback((id: string, name: string) => {
    setSelectedFiles(prev => prev.map(f => 
      f.id === id ? { ...f, workflowName: name } : f
    ));
  }, []);

  // 重置所有状态
  const handleReset = useCallback(() => {
    // 取消正在进行的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    setSelectedFile(null);
    setWorkflowName('');
    setWorkflowPreview(null);
    setSelectedFiles([]);
    setParseError('');
    setNameError('');
    setDragActive(false);
    setImportProgress(null);
    setImportResults(null);
  }, []);

  const formatFileSize = useCallback((bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  const validBatchFileCount = selectedFiles.filter(f => f.status === 'valid').length;
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: '32px 24px'
    }}>
      <div style={{ 
        maxWidth: '1000px', 
        margin: '0 auto',
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        {/* 页面头部 */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '40px',
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
            fontSize: '32px',
            fontWeight: '800',
            margin: '0 0 12px 0',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            📦 工作流导入
          </h1>
          <p style={{
            fontSize: '16px',
            margin: '0 auto',
            opacity: '0.9',
            maxWidth: '500px'
          }}>
            支持单个和批量导入工作流，快速部署您的工作流程
          </p>
        </div>

        {/* 导入模式选择 */}
        <div style={{ padding: '32px 40px 24px 40px' }}>
          <div style={{ 
            display: 'flex', 
            gap: '20px', 
            marginBottom: '24px',
            justifyContent: 'center'
          }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer',
              padding: '12px 20px',
              borderRadius: '8px',
              border: `2px solid ${importMode === 'single' ? '#667eea' : '#e2e8f0'}`,
              background: importMode === 'single' ? '#f0f4ff' : 'white',
              transition: 'all 0.3s ease'
            }}>
              <input
                type="radio"
                value="single"
                checked={importMode === 'single'}
                onChange={(e) => setImportMode(e.target.value as 'single' | 'batch')}
                style={{ marginRight: '8px' }}
                disabled={isImporting}
              />
              <span style={{ fontSize: '16px', fontWeight: '600' }}>
                🎯 单个导入
              </span>
            </label>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer',
              padding: '12px 20px',
              borderRadius: '8px',
              border: `2px solid ${importMode === 'batch' ? '#667eea' : '#e2e8f0'}`,
              background: importMode === 'batch' ? '#f0f4ff' : 'white',
              transition: 'all 0.3s ease'
            }}>
              <input
                type="radio"
                value="batch"
                checked={importMode === 'batch'}
                onChange={(e) => setImportMode(e.target.value as 'single' | 'batch')}
                style={{ marginRight: '8px' }}
                disabled={isImporting}
              />
              <span style={{ fontSize: '16px', fontWeight: '600' }}>
                📦 批量导入
              </span>
            </label>
          </div>

          {/* 批量导入模式选择 */}
          {importMode === 'batch' && (
            <div style={{ 
              textAlign: 'center', 
              marginBottom: '24px',
              padding: '16px',
              background: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '12px', 
                fontSize: '14px', 
                fontWeight: '600',
                color: '#2d3748' 
              }}>
                批量导入模式
              </label>
              <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    value="batch"
                    checked={batchImportMode === 'batch'}
                    onChange={(e) => setBatchImportMode(e.target.value as 'batch' | 'transaction')}
                    style={{ marginRight: '8px' }}
                    disabled={isImporting}
                  />
                  <span style={{ fontSize: '14px' }}>
                    <strong>批量模式</strong> - 允许部分失败，失败的文件不影响其他文件
                  </span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    value="transaction"
                    checked={batchImportMode === 'transaction'}
                    onChange={(e) => setBatchImportMode(e.target.value as 'batch' | 'transaction')}
                    style={{ marginRight: '8px' }}
                    disabled={isImporting}
                  />
                  <span style={{ fontSize: '14px' }}>
                    <strong>事务模式</strong> - 全部成功或全部失败，确保数据一致性
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* 文件上传区域 */}
        <div style={{ padding: '0 40px 24px 40px' }}>
          <div
            style={{
              border: `2px dashed ${dragActive ? '#667eea' : '#e2e8f0'}`,
              borderRadius: '16px',
              padding: '40px 20px',
              textAlign: 'center',
              background: dragActive ? '#f0f4ff' : '#fafbfc',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              position: 'relative',
              transform: dragActive ? 'scale(1.02)' : 'scale(1)'
            }}
            onClick={() => {
              const fileInput = document.getElementById('file-input') as HTMLInputElement;
              if (fileInput && !isImporting) {
                fileInput.click();
              }
            }}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const fileInput = document.getElementById('file-input') as HTMLInputElement;
                if (fileInput && !isImporting) {
                  fileInput.click();
                }
              }
            }}
            aria-label="拖拽文件到此处或点击选择文件"
          >
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              color: '#2d3748',
              marginBottom: '8px'
            }}>
              {importMode === 'single' ? '拖拽文件到此处或点击选择文件' : '拖拽文件到此处或点击选择多个文件'}
            </h3>
            <p style={{ 
              fontSize: '14px', 
              color: '#718096',
              marginBottom: '16px'
            }}>
              {importMode === 'single' 
                ? '支持JSON格式的工作流文件，最大10MB'
                : '支持同时选择多个JSON格式的工作流文件，最多50个文件，每个最大10MB'
              }
            </p>
            <input
              id="file-input"
              type="file"
              multiple={importMode === 'batch'}
              accept=".json,.yml,.yaml"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              disabled={isImporting}
              autoComplete="off"
              aria-label="选择工作流文件"
            />
            <div style={{
              display: 'inline-block',
              padding: '12px 24px',
              background: '#667eea',
              color: 'white',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
            }}>
              选择文件
            </div>
          </div>
        </div>

        {/* 单个导入界面 */}
        {importMode === 'single' && (
          <div style={{ padding: '0 40px 24px 40px' }}>
            {/* 文件信息 */}
            {selectedFile && (
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '24px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h4 style={{ margin: '0', fontSize: '16px', fontWeight: '600', color: '#2d3748' }}>
                    文件信息
                  </h4>
                  <button
                    onClick={() => setSelectedFile(null)}
                    style={{
                      padding: '6px',
                      background: 'transparent',
                      border: 'none',
                      fontSize: '18px',
                      cursor: 'pointer',
                      color: '#e53e3e',
                      opacity: isImporting ? 0.6 : 1
                    }}
                    disabled={isImporting}
                  >
                    ❌
                  </button>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '14px' }}>
                  <div>
                    <strong>文件名：</strong> {selectedFile.name}
                  </div>
                  <div>
                    <strong>文件大小：</strong> {formatFileSize(selectedFile.size)}
                  </div>
                </div>

                {workflowPreview && (
                  <div style={{
                    background: 'white',
                    padding: '16px',
                    borderRadius: '8px',
                    marginTop: '16px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <h5 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#2d3748' }}>
                      工作流预览
                    </h5>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                      <div><strong>名称：</strong> {workflowPreview.name}</div>
                      <div><strong>版本：</strong> {workflowPreview.version}</div>
                      <div><strong>节点数：</strong> {workflowPreview.nodeCount}</div>
                      <div><strong>连接数：</strong> {workflowPreview.edgeCount}</div>
                    </div>
                    {workflowPreview.description && (
                      <div style={{ marginTop: '12px' }}>
                        <strong>描述：</strong> {workflowPreview.description}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 工作流名称输入 */}
            {selectedFile && (
              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontSize: '14px', 
                  fontWeight: '600',
                  color: '#2d3748' 
                }}>
                  工作流名称 <span style={{ color: '#e53e3e' }}>*</span>
                </label>
                <input
                  type="text"
                  value={workflowName}
                  onChange={handleNameChange}
                  placeholder="请输入工作流名称（必须以字母开头）"
                  disabled={isImporting}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: `1px solid ${nameError ? '#e53e3e' : '#e2e8f0'}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    transition: 'border-color 0.3s ease'
                  }}
                />
                {nameError && (
                  <div style={{ 
                    color: '#e53e3e', 
                    fontSize: '12px', 
                    marginTop: '4px' 
                  }}>
                    {nameError}
                  </div>
                )}
              </div>
            )}

            {/* 错误提示 */}
            {parseError && (
              <div style={{
                background: '#fed7d7',
                color: '#c53030',
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                marginBottom: '24px',
                border: '1px solid #feb2b2'
              }}>
                ❌ {parseError}
              </div>
            )}

            {/* 操作按钮 */}
            <div style={{ 
              display: 'flex', 
              gap: '16px', 
              justifyContent: 'center'
            }}>
              <button
                onClick={handleReset}
                disabled={isImporting}
                style={{
                  padding: '14px 28px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '10px',
                  background: 'white',
                  color: '#4a5568',
                  cursor: isImporting ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  opacity: isImporting ? 0.6 : 1
                }}
              >
                🔄 重置
              </button>
              
              <button
                onClick={handleSingleImport}
                disabled={isImporting || !selectedFile || !workflowName.trim()}
                style={{
                  padding: '14px 28px',
                  border: 'none',
                  borderRadius: '10px',
                  background: isImporting || !selectedFile || !workflowName.trim() 
                    ? '#a0a0a0' 
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  cursor: isImporting || !selectedFile || !workflowName.trim() ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  transform: isImporting ? 'scale(0.98)' : 'scale(1)'
                }}
              >
                {isImporting ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ 
                      animation: 'spin 1s linear infinite',
                      display: 'inline-block'
                    }}>
                      ⏳
                    </span>
                    导入中...
                  </span>
                ) : (
                  '🚀 开始导入'
                )}
              </button>
            </div>
          </div>
        )}

        {/* 批量导入界面 */}
        {importMode === 'batch' && (
          <div style={{ padding: '0 40px 24px 40px' }}>
            {/* 文件列表 */}
            {selectedFiles.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '16px'
                }}>
                  <h4 style={{ 
                    fontSize: '18px', 
                    fontWeight: '600', 
                    color: '#2d3748'
                  }}>
                    文件列表 ({selectedFiles.length}) - 有效: {validBatchFileCount}
                  </h4>
                  <button
                    onClick={() => setSelectedFiles([])}
                    disabled={isImporting}
                    style={{
                      padding: '8px 16px',
                      background: '#e2e8f0',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      cursor: isImporting ? 'not-allowed' : 'pointer',
                      opacity: isImporting ? 0.6 : 1
                    }}
                  >
                    清空全部
                  </button>
                </div>
                
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {selectedFiles.map(file => (
                    <div key={file.id} style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '16px',
                      marginBottom: '12px',
                      background: 'white'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <span style={{ fontWeight: '600', color: '#2d3748' }}>{file.fileName}</span>
                            <span style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: '600',
                              background: file.status === 'valid' ? '#d1fae5' : 
                                         file.status === 'invalid' ? '#fee2e2' : '#f3f4f6',
                              color: file.status === 'valid' ? '#065f46' : 
                                    file.status === 'invalid' ? '#dc2626' : '#6b7280'
                            }}>
                              {file.status === 'pending' && '等待中'}
                              {file.status === 'valid' && '✅ 有效'}
                              {file.status === 'invalid' && '❌ 无效'}
                              {file.status === 'success' && '✅ 成功'}
                              {file.status === 'failed' && '❌ 失败'}
                            </span>
                          </div>
                          
                          {file.status === 'valid' && (
                            <div style={{ marginBottom: '12px' }}>
                              <input
                                type="text"
                                value={file.workflowName}
                                onChange={(e) => updateBatchWorkflowName(file.id, e.target.value)}
                                placeholder="工作流名称"
                                disabled={isImporting}
                                style={{
                                  width: '300px',
                                  padding: '8px 12px',
                                  border: '1px solid #e2e8f0',
                                  borderRadius: '6px',
                                  fontSize: '14px'
                                }}
                              />
                            </div>
                          )}

                          {file.preview && (
                            <div style={{
                              background: '#f7fafc',
                              padding: '12px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              color: '#4a5568'
                            }}>
                              <div>名称: {file.preview.name} | 节点: {file.preview.nodeCount} | 连接: {file.preview.edgeCount} | 版本: {file.preview.version}</div>
                              {file.preview.description && <div>描述: {file.preview.description}</div>}
                            </div>
                          )}

                          {file.error && (
                            <div style={{
                              background: '#fed7d7',
                              color: '#c53030',
                              padding: '8px 12px',
                              borderRadius: '6px',
                              fontSize: '14px',
                              marginTop: '8px'
                            }}>
                              {file.error}
                            </div>
                          )}
                        </div>
                        
                        <button
                          onClick={() => removeBatchFile(file.id)}
                          disabled={isImporting}
                          style={{
                            padding: '6px',
                            background: 'transparent',
                            border: 'none',
                            fontSize: '18px',
                            cursor: isImporting ? 'not-allowed' : 'pointer',
                            color: '#e53e3e',
                            opacity: isImporting ? 0.6 : 1
                          }}
                        >
                          ❌
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 导入进度 */}
            {importProgress && (
              <div style={{ 
                marginBottom: '24px',
                padding: '20px',
                background: '#f0f4ff',
                border: '1px solid #c7d2fe',
                borderRadius: '12px'
              }}>
                <h4 style={{ 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  color: '#3730a3',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  📊 导入进度
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#1e40af' }}>
                      {importProgress.totalCount}
                    </div>
                    <div style={{ fontSize: '14px', color: '#64748b' }}>总数</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#059669' }}>
                      {importProgress.successCount}
                    </div>
                    <div style={{ fontSize: '14px', color: '#64748b' }}>成功</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#dc2626' }}>
                      {importProgress.failedCount}
                    </div>
                    <div style={{ fontSize: '14px', color: '#64748b' }}>失败</div>
                  </div>
                </div>
                {importProgress.currentProcessing && (
                  <div style={{ 
                    marginTop: '12px', 
                    fontSize: '14px', 
                    color: '#4338ca',
                    textAlign: 'center'
                  }}>
                    正在处理: {importProgress.currentProcessing}
                  </div>
                )}
              </div>
            )}

            {/* 错误提示 */}
            {parseError && (
              <div style={{
                background: '#fed7d7',
                color: '#c53030',
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                marginBottom: '24px',
                border: '1px solid #feb2b2'
              }}>
                ❌ {parseError}
              </div>
            )}

            {/* 操作按钮 */}
            <div style={{ 
              display: 'flex', 
              gap: '16px', 
              justifyContent: 'center'
            }}>
              <button
                onClick={handleReset}
                disabled={isImporting}
                style={{
                  padding: '14px 28px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '10px',
                  background: 'white',
                  color: '#4a5568',
                  cursor: isImporting ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  opacity: isImporting ? 0.6 : 1
                }}
              >
                🔄 重置
              </button>
              
              <button
                onClick={handleBatchImport}
                disabled={isImporting || validBatchFileCount === 0}
                style={{
                  padding: '14px 28px',
                  border: 'none',
                  borderRadius: '10px',
                  background: isImporting || validBatchFileCount === 0 
                    ? '#a0a0a0' 
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  cursor: isImporting || validBatchFileCount === 0 ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  transform: isImporting ? 'scale(0.98)' : 'scale(1)'
                }}
              >
                {isImporting ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ 
                      animation: 'spin 1s linear infinite',
                      display: 'inline-block'
                    }}>
                      ⏳
                    </span>
                    批量导入中...
                  </span>
                ) : (
                  `📦 批量导入 (${validBatchFileCount}个文件)`
                )}
              </button>
            </div>
          </div>
        )}

        {/* 帮助信息 */}
        <div style={{ 
          padding: '24px 40px 40px 40px',
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0'
        }}>
          <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#2d3748', marginBottom: '12px' }}>
            💡 使用说明
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div>
              <h5 style={{ fontSize: '14px', fontWeight: '600', color: '#4a5568', marginBottom: '8px' }}>
                🎯 单个导入
              </h5>
              <ul style={{ fontSize: '13px', color: '#718096', lineHeight: '1.6', paddingLeft: '16px', margin: '0' }}>
                <li>支持JSON格式的工作流文件</li>
                <li>文件大小限制：最大10MB</li>
                <li>自动预览工作流信息</li>
                <li>支持拖拽上传</li>
              </ul>
            </div>
            <div>
              <h5 style={{ fontSize: '14px', fontWeight: '600', color: '#4a5568', marginBottom: '8px' }}>
                📦 批量导入
              </h5>
              <ul style={{ fontSize: '13px', color: '#718096', lineHeight: '1.6', paddingLeft: '16px', margin: '0' }}>
                <li>支持同时导入最多50个文件</li>
                <li>批量模式：允许部分失败</li>
                <li>事务模式：全部成功或全部失败</li>
                <li>实时进度跟踪</li>
              </ul>
            </div>
          </div>
          <div style={{ marginTop: '16px', fontSize: '13px', color: '#718096' }}>
            <strong>注意：</strong>工作流名称必须以字母开头，支持单个字母，只能包含字母、数字和下划线
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default Page;