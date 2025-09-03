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

import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Modal, Button, LoadingButton } from '@coze-arch/coze-design';
import { useUserInfo } from '@coze-foundation/account-adapter';
import { I18n } from '@coze-arch/i18n';

interface WorkflowImportModalProps {
  visible: boolean;
  onCancel: () => void;
}

interface WorkflowFile {
  id: string;
  fileName: string;
  workflowName: string;
  originalContent: string;
  workflowData: string;
  status: 'pending' | 'validating' | 'valid' | 'invalid' | 'importing' | 'success' | 'failed';
  error?: string;
  preview?: {
    name: string;
    nodeCount: number;
    edgeCount: number;
    version: string;
    description?: string;
  };
}

const WorkflowImportModal: React.FC<WorkflowImportModalProps> = ({ visible, onCancel }) => {
  const { space_id } = useParams<{ space_id: string }>();
  const navigate = useNavigate();
  const userInfo = useUserInfo();
  
  const [selectedFiles, setSelectedFiles] = useState<WorkflowFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showImportForm, setShowImportForm] = useState(true);
  const [resultModalData, setResultModalData] = useState<{
    successCount: number;
    failedCount: number;
    firstWorkflowId?: string;
    failedFiles?: Array<{
      file_name: string;
      workflow_name: string;
      error_code: string;
      error_message: string;
      fail_reason?: string;
    }>;
  }>({ successCount: 0, failedCount: 0 });

  const generateRandomId = (): string =>
    Math.random().toString(36).substr(2, 9);

  const sanitizeWorkflowName = (fileName: string): string => {
    let workflowName = fileName;
    const lowerName = fileName.toLowerCase();

    if (lowerName.endsWith('.json')) {
      workflowName = fileName.replace('.json', '');
    } else if (lowerName.endsWith('.yml')) {
      workflowName = fileName.replace('.yml', '');
    } else if (lowerName.endsWith('.yaml')) {
      workflowName = fileName.replace('.yaml', '');
    } else if (lowerName.endsWith('.zip')) {
      workflowName = fileName.replace('.zip', '');
    }

    workflowName = workflowName.replace(/[^a-zA-Z0-9_]/g, '_');
    if (!/^[a-zA-Z]/.test(workflowName)) {
      workflowName = `Workflow_${workflowName}`;
    }
    if (workflowName.length < 2) {
      workflowName = `Workflow_${Math.random().toString(36).substr(2, 6)}`;
    }

    return workflowName;
  };

  const handleFilesSelected = useCallback((files: FileList) => {
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      
      if (file.name.toLowerCase().endsWith('.zip')) {
        reader.onload = (e) => {
          const result = e.target?.result as string;
          if (result) {
            const base64Content = result.split(',')[1];
            if (base64Content) {
              const newFile: WorkflowFile = {
                id: generateRandomId(),
                fileName: file.name,
                workflowName: sanitizeWorkflowName(file.name),
                originalContent: base64Content,
                workflowData: base64Content,
                status: 'valid',
              };
              setSelectedFiles(prev => [...prev, newFile]);
            }
          }
        };
        reader.readAsDataURL(file);
      } else {
        reader.onload = (e) => {
          const content = e.target?.result as string;
          if (content) {
            const hasGarbledText = /�/.test(content) || /[^\x00-\x7F\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef]/.test(content);
            
            if (hasGarbledText) {
              console.warn(`File "${file.name}" may have encoding issues, trying alternative encoding`);
              tryAlternativeEncoding(file);
              return;
            }
            
            const newFile: WorkflowFile = {
              id: generateRandomId(),
              fileName: file.name,
              workflowName: sanitizeWorkflowName(file.name),
              originalContent: content,
              workflowData: content,
              status: 'valid',
            };
            setSelectedFiles(prev => [...prev, newFile]);
          }
        };
        reader.readAsText(file, 'UTF-8');
      }
      
      const tryAlternativeEncoding = (file: File) => {
        const alternativeReader = new FileReader();
        alternativeReader.onload = (e) => {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          if (arrayBuffer) {
            let content = '';
            try {
              const utf8Decoder = new TextDecoder('utf-8');
              content = utf8Decoder.decode(arrayBuffer);
              
              if (/�/.test(content)) {
                try {
                  const gbkDecoder = new TextDecoder('gbk');
                  content = gbkDecoder.decode(arrayBuffer);
                } catch {
                  try {
                    const gb2312Decoder = new TextDecoder('gb2312');
                    content = gb2312Decoder.decode(arrayBuffer);
                  } catch {
                    console.warn(`Unable to properly decode file "${file.name}", using UTF-8`);
                  }
                }
              }
              
              const newFile: WorkflowFile = {
                id: generateRandomId(),
                fileName: file.name,
                workflowName: sanitizeWorkflowName(file.name),
                originalContent: content,
                workflowData: content,
                status: 'valid',
              };
              setSelectedFiles(prev => [...prev, newFile]);
            } catch (error) {
              console.error(`Error decoding file "${file.name}":`, error);
              reader.readAsText(file, 'UTF-8');
            }
          }
        };
        alternativeReader.readAsArrayBuffer(file);
      };
    });
  }, []);

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
    if (files && files.length > 0) {
      handleFilesSelected(files);
    }
  };

  const FileUpload = () => (
    <div
      style={{
        border: `2px dashed ${dragActive ? '#667eea' : '#cbd5e0'}`,
        borderRadius: '12px',
        padding: '48px 24px',
        textAlign: 'center',
        backgroundColor: dragActive ? '#f0f4ff' : '#f9fafb',
        transition: 'all 0.3s ease',
        cursor: isImporting ? 'not-allowed' : 'pointer',
        opacity: isImporting ? 0.6 : 1,
        marginBottom: '24px',
      }}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => !isImporting && document.getElementById('file-input')?.click()}
    >
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
      <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#2d3748', marginBottom: '8px' }}>
        {I18n.t('workflow_import_drag_and_drop')}
      </h3>
      <p style={{ fontSize: '14px', color: '#718096', marginBottom: '8px' }}>
        {I18n.t('workflow_import_support_format')}
      </p>
      <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '16px' }}>
        {I18n.t('workflow_import_batch_description')}
      </p>
      <input
        id="file-input"
        type="file"
        multiple
        accept=".json,.yml,.yaml,.zip"
        onChange={(e) => {
          const files = e.target.files;
          if (files && files.length > 0) {
            handleFilesSelected(files);
          }
        }}
        style={{ display: 'none' }}
        disabled={isImporting}
      />
      <div
        style={{
          display: 'inline-block',
          padding: '10px 24px',
          background: '#667eea',
          color: 'white',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer',
        }}
      >
        {I18n.t('workflow_import_select_file')}
      </div>
    </div>
  );

  const FileList = () => (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>
          {I18n.t('workflow_import_file_list')} ({selectedFiles.length})
        </h3>
        <Button 
          onClick={() => setSelectedFiles([])} 
          disabled={isImporting}
          size="small"
          style={{
            borderColor: '#ef4444',
            borderWidth: '1.5px',
            color: '#ef4444',
            backgroundColor: 'white',
            fontWeight: '500',
            boxShadow: '0 1px 2px rgba(239, 68, 68, 0.1)',
          }}
          onMouseEnter={(e) => {
            if (!isImporting) {
              e.currentTarget.style.backgroundColor = '#fef2f2';
              e.currentTarget.style.borderColor = '#dc2626';
              e.currentTarget.style.borderWidth = '1.5px';
              e.currentTarget.style.color = '#dc2626';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(220, 38, 38, 0.2)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isImporting) {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.borderColor = '#ef4444';
              e.currentTarget.style.borderWidth = '1.5px';
              e.currentTarget.style.color = '#ef4444';
              e.currentTarget.style.boxShadow = '0 1px 2px rgba(239, 68, 68, 0.1)';
            }
          }}
        >
          {I18n.t('workflow_import_clear_all')}
        </Button>
      </div>
      
      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {selectedFiles.map(file => (
          <div key={file.id} style={{ 
            border: '1px solid #e2e8f0', 
            borderRadius: '8px', 
            padding: '12px', 
            marginBottom: '8px',
            backgroundColor: '#fafbfc'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: '500', marginBottom: '4px' }}>{file.fileName}</div>
                <input
                  type="text"
                  value={file.workflowName}
                  onChange={(e) => {
                    setSelectedFiles(prev => 
                      prev.map(f => 
                        f.id === file.id ? { ...f, workflowName: e.target.value } : f
                      )
                    );
                  }}
                  placeholder={I18n.t('workflow_import_workflow_name_placeholder')}
                  disabled={isImporting}
                  style={{
                    width: '300px',
                    padding: '6px 8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px',
                  }}
                />
              </div>
              <Button 
                onClick={() => setSelectedFiles(prev => prev.filter(f => f.id !== file.id))}
                disabled={isImporting}
                size="small"
                style={{
                  borderColor: '#ef4444',
                  borderWidth: '1.5px',
                  color: '#ef4444',
                  backgroundColor: 'white',
                  fontWeight: '500',
                  boxShadow: '0 1px 2px rgba(239, 68, 68, 0.1)',
                }}
                onMouseEnter={(e) => {
                  if (!isImporting) {
                    e.currentTarget.style.backgroundColor = '#fef2f2';
                    e.currentTarget.style.borderColor = '#dc2626';
                    e.currentTarget.style.borderWidth = '1.5px';
                    e.currentTarget.style.color = '#dc2626';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(220, 38, 38, 0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isImporting) {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.borderColor = '#ef4444';
                    e.currentTarget.style.borderWidth = '1.5px';
                    e.currentTarget.style.color = '#ef4444';
                    e.currentTarget.style.boxShadow = '0 1px 2px rgba(239, 68, 68, 0.1)';
                  }
                }}
              >
                {I18n.t('workflow_import_delete')}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const handleImport = async () => {
    if (!space_id) {
      alert(I18n.t('workflow_import_error_missing_name'));
      return;
    }

    if (selectedFiles.length === 0) {
      alert(I18n.t('workflow_import_select_file_tip'));
      return;
    }

    setShowImportForm(false);
    setIsImporting(true);

    try {
      const workflowFiles = [];
      const validationErrors = [];

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        
        if (!file.fileName) {
          validationErrors.push(`文件 ${i + 1} 缺少文件名`);
          continue;
        }
        if (!file.workflowName) {
          validationErrors.push(`文件 "${file.fileName}" 缺少工作流名称`);
          continue;
        }
        if (!file.originalContent) {
          validationErrors.push(`文件 "${file.fileName}" 缺少工作流数据`);
          continue;
        }
        
        if (file.fileName.toLowerCase().endsWith('.zip')) {
          const isValidBase64 = /^[A-Za-z0-9+/]*={0,2}$/.test(file.originalContent);
          console.log(`ZIP file validation for ${file.fileName}:`, {
            dataLength: file.originalContent.length,
            isValidBase64,
            dataPreview: file.originalContent.substring(0, 50)
          });
          
          if (!isValidBase64) {
            validationErrors.push(`ZIP文件 "${file.fileName}" 包含无效的base64数据`);
            continue;
          }
        }

        workflowFiles.push({
          file_name: file.fileName,
          workflow_data: file.originalContent,
          workflow_name: file.workflowName,
        });
      }

      if (validationErrors.length > 0) {
        console.warn('文件验证警告:', validationErrors);
      }

      if (workflowFiles.length === 0) {
        throw new Error('没有有效的文件可以导入');
      }

      console.log('发送批量导入请求:', {
        workflow_files: workflowFiles,
        space_id: space_id,
        import_mode: 'batch',
        import_format: 'mixed',
      });

      const response = await fetch('/api/workflow_api/batch_import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workflow_files: workflowFiles,
          space_id: space_id,
          creator_id: userInfo?.uid || space_id,
          import_mode: 'batch',
          import_format: 'mixed',
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        let errorMessage = `导入失败，HTTP状态码: ${response.status}`;
        try {
          const errorData = await response.json();
          console.log('Error response data:', errorData);
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (parseError) {
          console.log('Failed to parse error response');
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Success response:', result);
      
      const responseData = result.data || result || {};
      
      const successCount = responseData.success_count || responseData.success_list?.length || 0;
      const failedCount = responseData.failed_count || responseData.failed_list?.length || 0;
      const firstWorkflowId = responseData.success_list?.length ? responseData.success_list[0].workflow_id : null;

      console.log('Import results:', { successCount, failedCount, firstWorkflowId });
      
      setResultModalData({ 
        successCount, 
        failedCount, 
        firstWorkflowId, 
        failedFiles: responseData.failed_list || []
      });
      setShowResultModal(true);
      
    } catch (error) {
      console.error('批量导入失败:', error);
      alert(error instanceof Error ? error.message : I18n.t('workflow_import_failed'));
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    if (!isImporting) {
      setSelectedFiles([]);
      setShowImportForm(true);
      setShowResultModal(false);
      onCancel();
    }
  };

  const ImportResultModal: React.FC = () => {
    const { successCount, failedCount, firstWorkflowId, failedFiles } = resultModalData;
    const totalCount = successCount + failedCount;
    
    let title = '';
    let message = '';
    let icon = '';
    
    if (successCount > 0 && failedCount > 0) {
      title = I18n.t('workflow_import_partial_complete');
      message = I18n.t('workflow_import_partial_message', { total: totalCount.toString(), success: successCount.toString(), failed: failedCount.toString() });
      icon = '⚠️';
    } else if (successCount > 0) {
      title = I18n.t('workflow_import_success');
      message = I18n.t('workflow_import_success_message', { count: successCount.toString() });
      icon = '✅';
    } else {
      title = I18n.t('workflow_import_failed');
      message = I18n.t('workflow_import_failed_message', { count: failedCount.toString() });
      icon = '❌';
    }

    const hasSuccess = successCount > 0;
    const hasFailures = failedCount > 0;

    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          overflow: 'hidden',
          paddingTop: '20px',
          paddingBottom: '20px',
          boxSizing: 'border-box',
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowResultModal(false);
            handleClose();
          }
        }}
      >
        <div
          style={{
            width: 'auto',
            backgroundColor: 'transparent',
            borderRadius: '12px',
            padding: '0',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            maxHeight: 'none',
            overflow: 'visible',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ 
            textAlign: 'left', 
            marginBottom: '0',
            color: '#1f2937',
            fontSize: '24px',
            fontWeight: '600',
            backgroundColor: 'white',
            padding: '20px 32px',
            borderRadius: '12px 12px 0 0',
            width: '600px',
            boxSizing: 'border-box',
          }}>
            {I18n.t('workflow_import_result')}
          </div>

          <div
            style={{
              width: '600px',
              backgroundColor: 'white',
              borderRadius: '0',
              padding: '24px 32px',
              marginBottom: '0',
              marginTop: '0',
              boxSizing: 'border-box',
              textAlign: 'center',
            }}
          >
            <div style={{ 
              textAlign: 'center',
              fontSize: '48px', 
              marginBottom: '16px',
              filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))',
            }}>
              {icon}
            </div>
            
            <h2
              style={{
                fontSize: '20px',
                fontWeight: 700,
                color: '#1f2937',
                marginBottom: '12px',
                margin: 0,
                textAlign: 'center',
              }}
            >
              {title}
            </h2>
            
            <p
              style={{
                fontSize: '16px',
                color: '#6b7280',
                marginBottom: hasFailures ? '16px' : '0',
                lineHeight: '1.6',
                textAlign: 'center',
                width: '100%',
              }}
            >
              {message}
            </p>

            {hasFailures && failedFiles && failedFiles.length > 0 && (
              <div style={{ width: '100%' }}>
                <div style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                  textAlign: 'left',
                }}>
                  <div style={{
                    padding: '12px 16px',
                    backgroundColor: '#fef2f2',
                    borderBottom: '1px solid #fecaca',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#dc2626',
                  }}>
                    {I18n.t('workflow_import_failed_files_details')} ({failedCount})
                  </div>
                  <div style={{
                    maxHeight: '150px',
                    overflowY: 'auto',
                  }}>
                    {failedFiles.map((file, index) => (
                      <div
                        key={index}
                        style={{
                          padding: '12px 16px',
                          borderBottom: index < failedFiles.length - 1 ? '1px solid #f3f4f6' : 'none',
                        }}
                      >
                        <div style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          color: '#374151',
                          marginBottom: '4px',
                        }}>
                          {file.file_name}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#6b7280',
                          marginBottom: '6px',
                        }}>
                          {I18n.t('workflow_import_workflow_name')}: {file.workflow_name}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#dc2626',
                          lineHeight: '1.4',
                        }}>
                          <strong>{I18n.t('workflow_import_error_reason')}:</strong> {file.error_message || file.fail_reason || I18n.t('workflow_import_unknown_error')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            justifyContent: 'flex-end',
            backgroundColor: 'white',
            padding: '20px 32px',
            borderRadius: '0 0 12px 12px',
            width: '600px',
            boxSizing: 'border-box',
          }}>
            <button
              onClick={() => {
                setShowResultModal(false);
                handleClose();
              }}
              style={{
                padding: '8px 16px',
                border: '2px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor: 'white',
                color: '#374151',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f9fafb';
                e.currentTarget.style.borderColor = '#9ca3af';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.borderColor = '#d1d5db';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
              }}
            >
              {hasSuccess ? I18n.t('workflow_import_complete') : I18n.t('workflow_import_close')}
            </button>

            {hasSuccess && firstWorkflowId && (
              <button
                onClick={() => {
                  navigate(`/work_flow?workflow_id=${firstWorkflowId}&space_id=${space_id}`);
                  setShowResultModal(false);
                  handleClose();
                }}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#059669';
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(16, 185, 129, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#10b981';
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(16, 185, 129, 0.3)';
                }}
              >
                {I18n.t('workflow_import_view_workflow')}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const validFileCount = selectedFiles.filter(f => f.status === 'valid').length;

  return (
    <>
      <Modal
        title={showImportForm ? I18n.t('workflow_import') : I18n.t('workflow_import_result')}
        visible={visible && (showImportForm || isImporting)}
        onCancel={handleClose}
        width={showImportForm ? 800 : 600}
        footer={
          showImportForm ? (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <Button 
                onClick={handleClose} 
                disabled={isImporting}
                style={{
                  borderColor: '#d1d5db',
                  color: '#6b7280',
                  backgroundColor: 'white',
                  fontWeight: '500',
                }}
                onMouseEnter={(e) => {
                  if (!isImporting) {
                    e.currentTarget.style.borderColor = '#9ca3af';
                    e.currentTarget.style.color = '#374151';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isImporting) {
                    e.currentTarget.style.borderColor = '#d1d5db';
                    e.currentTarget.style.color = '#6b7280';
                  }
                }}
              >
                {I18n.t('workflow_import_cancel')}
              </Button>
              <LoadingButton
                type="primary"
                loading={isImporting}
                disabled={validFileCount === 0}
                onClick={handleImport}
                style={{
                  backgroundColor: isImporting || validFileCount === 0 ? '#94a3b8' : '#10b981',
                  borderColor: isImporting || validFileCount === 0 ? '#94a3b8' : '#10b981',
                  fontWeight: '600',
                  boxShadow: isImporting || validFileCount === 0 ? 'none' : '0 2px 8px rgba(16, 185, 129, 0.25)',
                }}
                onMouseEnter={(e) => {
                  if (!isImporting && validFileCount > 0) {
                    e.currentTarget.style.backgroundColor = '#059669';
                    e.currentTarget.style.borderColor = '#059669';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.35)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isImporting && validFileCount > 0) {
                    e.currentTarget.style.backgroundColor = '#10b981';
                    e.currentTarget.style.borderColor = '#10b981';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.25)';
                  }
                }}
              >
                {isImporting 
                  ? I18n.t('workflow_import_importing')
                  : I18n.t('workflow_import_button_import', { count: validFileCount.toString() })
                }
              </LoadingButton>
            </div>
          ) : null
        }
      >
        {showImportForm ? (
          <>
            <FileUpload />
            {selectedFiles.length > 0 && <FileList />}
          </>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '24px' }}>⏳</div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>
              {I18n.t('workflow_import_importing')}
            </h3>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '0' }}>
              {I18n.t('workflow_import_importing')}
            </p>
          </div>
        )}
      </Modal>

      {showResultModal && <ImportResultModal />}
    </>
  );
};

export default WorkflowImportModal;