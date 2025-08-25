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
      <div className="flex justify-center items-center h-screen">
        <div className="max-w-md p-6 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-lg font-semibold text-red-800 mb-2">错误</h3>
          <p className="text-red-600">未找到工作空间ID</p>
        </div>
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
        if (!content) {
          setParseError('文件内容为空');
          setSelectedFile(null);
          return;
        }
        
        const workflowData = JSON.parse(content);
        
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
        setParseError('JSON格式错误，请检查文件内容是否有效');
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
      .filter(file => file.name.endsWith('.json'))
      .map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        fileName: file.name,
        workflowName: file.name.replace('.json', ''),
        workflowData: '',
        status: 'pending' as const,
      }));

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
          setSelectedFiles(prev => prev.map(f => {
            if (f.id === workflowFile.id) {
              return {
                ...f,
                status: 'invalid' as const,
                error: 'JSON格式错误，请检查文件内容是否有效',
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

  // 获取状态图标
  const getStatusIcon = (status: WorkflowFile['status']) => {
    switch (status) {
      case 'pending':
        return <span className="text-gray-400">⏳</span>;
      case 'valid':
        return <span className="text-green-500">✅</span>;
      case 'invalid':
        return <span className="text-red-500">❌</span>;
      case 'success':
        return <span className="text-green-600">✅</span>;
      case 'failed':
        return <span className="text-red-600">❌</span>;
      default:
        return <span className="text-gray-400">⏳</span>;
    }
  };

  // 获取状态标签颜色
  const getStatusTagColor = (status: WorkflowFile['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'valid':
        return 'bg-green-100 text-green-800';
      case 'invalid':
        return 'bg-red-100 text-red-800';
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 获取状态标签文本
  const getStatusTagText = (status: WorkflowFile['status']) => {
    switch (status) {
      case 'pending':
        return '等待中';
      case 'valid':
        return '有效';
      case 'invalid':
        return '无效';
      case 'success':
        return '成功';
      case 'failed':
        return '失败';
      default:
        return '未知';
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* 页面头部 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleGoBack}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                ← 返回资源库
              </button>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  📦 工作流导入
                </h1>
                <p className="text-gray-600">
                  支持单个和批量导入工作流，快速部署您的工作流程
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 导入模式选择 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              选择导入模式
            </h2>
            <div className="flex space-x-4">
              <button
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  importMode === 'single'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setImportMode('single')}
                disabled={isImporting}
              >
                🎯 单个导入
              </button>
              <button
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  importMode === 'batch'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setImportMode('batch')}
                disabled={isImporting}
              >
                📦 批量导入
              </button>
            </div>
          </div>

          {/* 批量导入模式选择 */}
          {importMode === 'batch' && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-md font-semibold text-gray-900 mb-3">
                批量导入模式
              </h3>
              <div className="flex space-x-4">
                <button
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    batchImportMode === 'batch'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setBatchImportMode('batch')}
                  disabled={isImporting}
                >
                  批量模式
                </button>
                <button
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    batchImportMode === 'transaction'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setBatchImportMode('transaction')}
                  disabled={isImporting}
                >
                  事务模式
                </button>
              </div>
              <div className="mt-3 text-sm text-gray-600">
                <div>• <strong>批量模式</strong> - 允许部分失败，失败的文件不影响其他文件</div>
                <div>• <strong>事务模式</strong> - 全部成功或全部失败，确保数据一致性</div>
              </div>
            </div>
          )}
        </div>

        {/* 文件上传区域 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
              ${dragActive 
                ? 'border-blue-500 bg-blue-50 scale-105' 
                : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
              }
            `}
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
            <div className="text-4xl text-gray-400 mb-4">📁</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {importMode === 'single' ? '拖拽文件到此处或点击选择文件' : '拖拽文件到此处或点击选择多个文件'}
            </h3>
            <p className="text-gray-600 mb-4">
              {importMode === 'single' 
                ? '支持JSON格式的工作流文件，最大10MB'
                : '支持同时选择多个JSON格式的工作流文件，最多50个文件，每个最大10MB'
              }
            </p>
            <input
              id="file-input"
              type="file"
              multiple={importMode === 'batch'}
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isImporting}
              autoComplete="off"
              aria-label="选择工作流文件"
            />
            <button
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isImporting}
            >
              选择文件
            </button>
          </div>
        </div>

        {/* 单个导入界面 */}
        {importMode === 'single' && selectedFile && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                文件信息
              </h2>
              <button
                onClick={() => setSelectedFile(null)}
                className="px-3 py-1 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors duration-200 disabled:opacity-50"
                disabled={isImporting}
              >
                移除文件
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm text-gray-600">文件名</p>
                <div className="font-medium">{selectedFile.name}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm text-gray-600">文件大小</p>
                <div className="font-medium">{formatFileSize(selectedFile.size)}</div>
              </div>
            </div>

            {workflowPreview && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="text-md font-semibold text-blue-800 mb-3">
                  工作流预览
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">名称：</span>
                    <span className="font-medium">{workflowPreview.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">版本：</span>
                    <span className="font-medium">{workflowPreview.version}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">节点数：</span>
                    <span className="font-medium">{workflowPreview.nodeCount}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">连接数：</span>
                    <span className="font-medium">{workflowPreview.edgeCount}</span>
                  </div>
                </div>
                {workflowPreview.description && (
                  <div className="mt-3">
                    <span className="text-gray-600">描述：</span>
                    <span className="ml-2">{workflowPreview.description}</span>
                  </div>
                )}
              </div>
            )}

            <div className="border-t border-gray-200 my-6" />

            {/* 工作流名称输入 */}
            <div className="mb-4">
              <h3 className="text-md font-semibold text-gray-900 mb-2">
                工作流名称 <span className="text-red-500">*</span>
              </h3>
              <input
                type="text"
                value={workflowName}
                onChange={handleNameChange}
                placeholder="请输入工作流名称（必须以字母开头）"
                disabled={isImporting}
                className={`
                  w-full px-3 py-2 border rounded-lg transition-colors duration-200
                  ${nameError 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                  }
                  focus:outline-none focus:ring-2
                `}
              />
              {nameError && (
                <p className="text-red-500 text-sm mt-1">
                  {nameError}
                </p>
              )}
            </div>

            {/* 操作按钮 */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleReset}
                disabled={isImporting}
                className="px-6 py-3 border-2 border-gray-300 rounded-lg bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
              >
                🔄 重置
              </button>
              
              <button
                onClick={handleSingleImport}
                disabled={isImporting || !selectedFile || !workflowName.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isImporting ? '导入中...' : '🚀 开始导入'}
              </button>
            </div>
          </div>
        )}

        {/* 批量导入界面 */}
        {importMode === 'batch' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            {/* 文件列表 */}
            {selectedFiles.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    文件列表 ({selectedFiles.length}) - 有效: {validBatchFileCount}
                  </h2>
                  <button
                    onClick={() => setSelectedFiles([])}
                    disabled={isImporting}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50"
                  >
                    清空全部
                  </button>
                </div>
                
                <div className="max-h-96 overflow-y-auto space-y-3">
                  {selectedFiles.map(file => (
                    <div key={file.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            {getStatusIcon(file.status)}
                            <span className="font-medium">{file.fileName}</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusTagColor(file.status)}`}>
                              {getStatusTagText(file.status)}
                            </span>
                          </div>
                          
                          {file.status === 'valid' && (
                            <div className="mb-3">
                              <input
                                type="text"
                                value={file.workflowName}
                                onChange={(e) => updateBatchWorkflowName(file.id, e.target.value)}
                                placeholder="工作流名称"
                                disabled={isImporting}
                                className="w-80 px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                              />
                            </div>
                          )}

                          {file.preview && (
                            <div className="bg-white p-3 rounded text-sm text-gray-600">
                              <div>名称: {file.preview.name} | 节点: {file.preview.nodeCount} | 连接: {file.preview.edgeCount} | 版本: {file.preview.version}</div>
                              {file.preview.description && <div>描述: {file.preview.description}</div>}
                            </div>
                          )}

                          {file.error && (
                            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                              {file.error}
                            </div>
                          )}
                        </div>
                        
                        <button
                          onClick={() => removeBatchFile(file.id)}
                          disabled={isImporting}
                          className="px-2 py-1 text-red-600 border border-red-300 rounded hover:bg-red-50 transition-colors duration-200 disabled:opacity-50"
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
              <div className="mb-6">
                <h3 className="text-md font-semibold text-gray-900 mb-3">
                  📊 导入进度
                </h3>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{importProgress.totalCount}</div>
                    <p className="text-gray-600">总数</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{importProgress.successCount}</div>
                    <p className="text-gray-600">成功</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{importProgress.failedCount}</div>
                    <p className="text-gray-600">失败</p>
                  </div>
                </div>
                {importProgress.currentProcessing && (
                  <div className="text-center text-blue-600">
                    正在处理: {importProgress.currentProcessing}
                  </div>
                )}
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleReset}
                disabled={isImporting}
                className="px-6 py-3 border-2 border-gray-300 rounded-lg bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
              >
                🔄 重置
              </button>
              
              <button
                onClick={handleBatchImport}
                disabled={isImporting || validBatchFileCount === 0}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isImporting ? '批量导入中...' : `📦 批量导入 (${validBatchFileCount}个文件)`}
              </button>
            </div>
          </div>
        )}

        {/* 错误提示 */}
        {parseError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-red-800 font-semibold mb-2">导入错误</h3>
                <p className="text-red-700 whitespace-pre-line">{parseError}</p>
              </div>
              <button
                onClick={() => setParseError('')}
                className="text-red-400 hover:text-red-600"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* 帮助信息 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            💡 使用说明
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-md font-semibold text-gray-900 mb-2">
                🎯 单个导入
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 支持JSON格式的工作流文件</li>
                <li>• 文件大小限制：最大10MB</li>
                <li>• 自动预览工作流信息</li>
                <li>• 支持拖拽上传</li>
              </ul>
            </div>
            <div>
              <h3 className="text-md font-semibold text-gray-900 mb-2">
                📦 批量导入
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 支持同时导入最多50个文件</li>
                <li>• 批量模式：允许部分失败</li>
                <li>• 事务模式：全部成功或全部失败</li>
                <li>• 实时进度跟踪</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              <strong>注意：</strong>工作流名称必须以字母开头，支持单个字母，只能包含字母、数字和下划线
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;