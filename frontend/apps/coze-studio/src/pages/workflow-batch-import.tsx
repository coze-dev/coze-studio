import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

interface WorkflowFile {
  id: string;
  file: File;
  fileName: string;
  workflowName: string;
  workflowData: string;
  status: 'pending' | 'validating' | 'valid' | 'invalid' | 'importing' | 'success' | 'failed';
  error?: string;
  preview?: {
    name: string;
    description: string;
    nodeCount: number;
    edgeCount: number;
    version: string;
  };
}

interface ImportProgress {
  totalCount: number;
  successCount: number;
  failedCount: number;
  currentProcessing: string;
}

const WorkflowBatchImport: React.FC = () => {
  const navigate = useNavigate();
  const { space_id } = useParams<{ space_id: string }>();

  const [selectedFiles, setSelectedFiles] = useState<WorkflowFile[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importMode, setImportMode] = useState<'batch' | 'transaction'>('batch');
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [importResults, setImportResults] = useState<any>(null);

  // 返回上一页
  const handleGoBack = () => {
    navigate(`/space/${space_id}/library`);
  };

  // 处理文件选择
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    addFiles(files);
  };

  // 添加文件
  const addFiles = (files: File[]) => {
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
          const workflowData = JSON.parse(content);

          setSelectedFiles(prev => prev.map(f => {
            if (f.id === workflowFile.id) {
              if (!workflowData.schema || !workflowData.nodes) {
                return {
                  ...f,
                  status: 'invalid' as const,
                  error: '无效的工作流文件格式，缺少必要的schema或nodes字段',
                };
              }

              return {
                ...f,
                workflowData: content,
                status: 'valid' as const,
                preview: {
                  name: workflowData.name || '未命名工作流',
                  description: workflowData.description || '',
                  nodeCount: workflowData.nodes?.length || 0,
                  edgeCount: workflowData.edges?.length || 0,
                  version: workflowData.version || 'v1.0'
                }
              };
            }
            return f;
          }));
        } catch (error) {
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
      reader.readAsText(workflowFile.file);
    });
  };

  // 删除文件
  const removeFile = (id: string) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== id));
  };

  // 更新工作流名称
  const updateWorkflowName = (id: string, name: string) => {
    setSelectedFiles(prev => prev.map(f => 
      f.id === id ? { ...f, workflowName: name } : f
    ));
  };

  // 验证工作流名称
  const validateWorkflowName = (name: string): string => {
    if (!name.trim()) {
      return '工作流名称不能为空';
    }
    
    if (!/^[a-zA-Z]/.test(name)) {
      return '工作流名称必须以字母开头';
    }
    
    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(name)) {
      return '工作流名称只能包含字母、数字和下划线';
    }
    
    if (name.length < 1 || name.length > 50) {
      return '工作流名称长度应在1-50个字符之间';
    }
    
    return '';
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
    
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  // 批量导入
  const handleBatchImport = async () => {
    if (selectedFiles.length === 0) {
      alert('请先选择文件');
      return;
    }

    // 验证所有文件
    const validFiles = selectedFiles.filter(f => f.status === 'valid');
    if (validFiles.length === 0) {
      alert('没有有效的文件可以导入');
      return;
    }

    // 验证工作流名称
    const nameErrors: string[] = [];
    const nameSet = new Set<string>();
    
    validFiles.forEach((file, index) => {
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
      alert(`名称验证失败:\\n${nameErrors.join('\\n')}`);
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
          import_mode: importMode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '批量导入失败');
      }

      const result = await response.json();
      setImportResults(result.data);

      // 更新文件状态
      setSelectedFiles(prev => prev.map(file => {
        const successResult = result.data.success_list?.find(
          (s: any) => s.file_name === file.fileName
        );
        const failedResult = result.data.failed_list?.find(
          (f: any) => f.file_name === file.fileName
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
          alert(`批量导入完成！\\n成功: ${result.data.success_count}个\\n失败: ${result.data.failed_count}个`);
        }, 1000);
      }

    } catch (error) {
      console.error('批量导入失败:', error);
      alert(error instanceof Error ? error.message : '批量导入失败，请重试');
    } finally {
      setIsImporting(false);
    }
  };

  // 获取文件状态样式
  const getFileStatusStyle = (status: WorkflowFile['status']) => {
    const baseStyle = {
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: '600',
    };

    switch (status) {
      case 'pending':
        return { ...baseStyle, background: '#f3f4f6', color: '#6b7280' };
      case 'valid':
        return { ...baseStyle, background: '#d1fae5', color: '#065f46' };
      case 'invalid':
        return { ...baseStyle, background: '#fee2e2', color: '#dc2626' };
      case 'success':
        return { ...baseStyle, background: '#d1fae5', color: '#065f46' };
      case 'failed':
        return { ...baseStyle, background: '#fee2e2', color: '#dc2626' };
      default:
        return baseStyle;
    }
  };

  const validFileCount = selectedFiles.filter(f => f.status === 'valid').length;

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
      }}>
        {/* 标题区域 */}
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '800',
            color: '#1a202c',
            marginBottom: '12px'
          }}>
            📦 工作流批量导入
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#718096',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            支持批量上传多个工作流JSON文件，可选择批量模式（允许部分失败）或事务模式（全部成功或全部失败）
          </p>
          
          {/* 测试API连接按钮 */}
          <button
            onClick={async () => {
              try {
                const response = await fetch('/api/workflow_api/batch_import', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    workflow_files: [],
                    space_id: space_id,
                    creator_id: 'test',
                    import_format: 'json',
                    import_mode: 'batch'
                  })
                });
                const result = await response.json();
                console.log('API测试结果:', result);
                alert(`API连接测试: ${response.ok ? '成功' : '失败'}\n状态码: ${response.status}\n响应: ${JSON.stringify(result)}`);
              } catch (error) {
                console.error('API测试失败:', error);
                alert(`API测试失败: ${error}`);
              }
            }}
            style={{
              marginTop: '16px',
              padding: '8px 16px',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            🧪 测试API连接
          </button>
        </div>

        {/* 导入模式选择 */}
        <div style={{ marginBottom: '30px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '12px', 
            fontSize: '16px', 
            fontWeight: '600',
            color: '#2d3748' 
          }}>
            导入模式
          </label>
          <div style={{ display: 'flex', gap: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                value="batch"
                checked={importMode === 'batch'}
                onChange={(e) => setImportMode(e.target.value as 'batch')}
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
                checked={importMode === 'transaction'}
                onChange={(e) => setImportMode(e.target.value as 'transaction')}
                style={{ marginRight: '8px' }}
                disabled={isImporting}
              />
              <span style={{ fontSize: '14px' }}>
                <strong>事务模式</strong> - 全部成功或全部失败，确保数据一致性
              </span>
            </label>
          </div>
        </div>

        {/* 文件上传区域 */}
        <div style={{ marginBottom: '30px' }}>
          <div
            style={{
              border: `2px dashed ${dragActive ? '#667eea' : '#e2e8f0'}`,
              borderRadius: '12px',
              padding: '40px 20px',
              textAlign: 'center',
              background: dragActive ? '#f0f4ff' : '#fafbfc',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              position: 'relative',
              transform: dragActive ? 'scale(1.02)' : 'scale(1)'
            }}
            onClick={() => document.getElementById('file-input')?.click()}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              color: '#2d3748',
              marginBottom: '8px'
            }}>
              拖拽文件到此处或点击选择文件
            </h3>
            <p style={{ 
              fontSize: '14px', 
              color: '#718096',
              marginBottom: '16px'
            }}>
              支持同时选择多个JSON格式的工作流文件，最多50个文件
            </p>
            <input
              id="file-input"
              type="file"
              multiple
              accept=".json"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              disabled={isImporting}
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

        {/* 文件列表 */}
        {selectedFiles.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                color: '#2d3748'
              }}>
                文件列表 ({selectedFiles.length}) - 有效: {validFileCount}
              </h3>
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
                        <span style={getFileStatusStyle(file.status)}>
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
                            onChange={(e) => updateWorkflowName(file.id, e.target.value)}
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
                      onClick={() => removeFile(file.id)}
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
            marginBottom: '30px',
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

        {/* 操作按钮 */}
        <div style={{ 
          display: 'flex', 
          gap: '16px', 
          justifyContent: 'center',
          marginTop: '30px'
        }}>
          <button
            onClick={handleGoBack}
            disabled={isImporting}
            style={{
              padding: '16px 32px',
              border: '2px solid #e2e8f0',
              borderRadius: '12px',
              background: 'white',
              color: '#4a5568',
              cursor: isImporting ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              opacity: isImporting ? 0.6 : 1
            }}
          >
            ❌ 取消
          </button>
          
          <button
            onClick={handleBatchImport}
            disabled={isImporting || validFileCount === 0}
            style={{
              padding: '16px 32px',
              border: 'none',
              borderRadius: '12px',
              background: isImporting || validFileCount === 0 
                ? '#a0a0a0' 
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              cursor: isImporting || validFileCount === 0 ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              transform: isImporting ? 'scale(0.98)' : 'scale(1)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {isImporting ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ 
                  animation: 'spin 1s linear infinite',
                  display: 'inline-block',
                  fontSize: '18px'
                }}>
                  ⏳
                </span>
                批量导入中...
              </span>
            ) : (
              `📦 批量导入 (${validFileCount}个文件)`
            )}
          </button>
        </div>

        {/* 帮助信息 */}
        <div style={{ 
          marginTop: '40px', 
          padding: '20px', 
          background: '#f8fafc', 
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#2d3748', marginBottom: '12px' }}>
            💡 使用说明
          </h4>
          <ul style={{ fontSize: '14px', color: '#4a5568', lineHeight: '1.6', paddingLeft: '20px' }}>
            <li style={{ marginBottom: '6px' }}>
              <strong>支持格式：</strong>仅支持JSON格式的工作流文件
            </li>
            <li style={{ marginBottom: '6px' }}>
              <strong>批量限制：</strong>单次最多支持50个文件
            </li>
            <li style={{ marginBottom: '6px' }}>
              <strong>名称规则：</strong>工作流名称必须以字母开头，支持单个字母，只能包含字母、数字和下划线
            </li>
            <li style={{ marginBottom: '6px' }}>
              <strong>批量模式：</strong>允许部分文件导入失败，不影响其他文件
            </li>
            <li>
              <strong>事务模式：</strong>要求所有文件都成功导入，否则全部回滚
            </li>
          </ul>
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

export default WorkflowBatchImport;