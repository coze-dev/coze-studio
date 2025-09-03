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

import { useNavigate, useParams } from 'react-router-dom';
import React, { useState } from 'react';

import { I18n } from '@coze-arch/i18n';
import { useImportHandler } from './workflow-import/hooks/use-import-handler';
import { useFileProcessor } from './workflow-import/hooks/use-file-processor';
import { createDragHandlers } from './workflow-import/utils/drag-handlers';
import { createImportHandlers } from './workflow-import/utils/component-handlers';
import FileUpload from './workflow-import/components/FileUpload';
import FileList from './workflow-import/components/FileList';
import { Button, LoadingButton, Space } from '@coze-arch/coze-design';

interface WorkflowImportProps {
  visible: boolean;
  onCancel: () => void;
}

const WorkflowImport: React.FC<WorkflowImportProps> = ({ visible, onCancel }) => {
  const navigate = useNavigate();
  const { space_id } = useParams<{ space_id: string }>();

  const {
    selectedFiles,
    addFiles,
    removeFile,
    updateWorkflowName,
    clearAllFiles,
    setSelectedFiles,
  } = useFileProcessor();

  const { 
    isImporting, 
    showResultModal, 
    resultModalData, 
    setShowResultModal,
    navigateToWorkflow,
    handleBatchImport,
  } = useImportHandler();

  const [dragActive, setDragActive] = useState(false);

  // 获取导入结果的图标
  const getResultIcon = () => {
    const { successCount, failedCount } = resultModalData;
    if (successCount > 0 && failedCount > 0) {
      return '⚠️';
    } else if (successCount > 0) {
      return '✅';
    } else {
      return '❌';
    }
  };

  // 获取导入结果的标题
  const getResultTitle = () => {
    const { successCount, failedCount } = resultModalData;
    if (successCount > 0 && failedCount > 0) {
      return I18n.t('workflow_import_partial_complete');
    } else if (successCount > 0) {
      return I18n.t('workflow_import_success');
    } else {
      return I18n.t('workflow_import_failed');
    }
  };

  // 获取导入结果的消息
  const getResultMessage = () => {
    const { successCount, failedCount } = resultModalData;
    const totalCount = successCount + failedCount;
    
    if (successCount > 0 && failedCount > 0) {
      return I18n.t('workflow_import_partial_message', { 
        total: totalCount.toString(), 
        success: successCount.toString(), 
        failed: failedCount.toString() 
      });
    } else if (successCount > 0) {
      return I18n.t('workflow_import_success_message', { count: successCount.toString() });
    } else {
      return I18n.t('workflow_import_failed_message', { count: failedCount.toString() });
    }
  };

  const dragHandlers = createDragHandlers(setDragActive, addFiles);
  const importHandlers = createImportHandlers({
    navigate,
    spaceId: space_id,
    addFiles,
    selectedFiles,
    importMode: 'batch', // 固定使用批量模式
    setSelectedFiles,
    handleBatchImport,
    resultModalData,
    navigateToWorkflow,
    setShowResultModal,
  });

  const validFileCount = selectedFiles.filter(f => f.status === 'valid').length;

  const handleImport = () => {
    if (!space_id) {
      alert('缺少工作空间ID');
      return;
    }

    handleBatchImport({
      selectedFiles,
      spaceId: space_id,
      importMode: 'batch',
      setSelectedFiles,
    });
  };

  if (!visible) {
    return null;
  }

  return (
    <>
      <style>
        {`
          /* 导入结果弹窗时隐藏页面滚动条 */
          body {
            overflow: ${showResultModal ? 'hidden' : 'auto'};
          }
        `}
      </style>

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
          alignItems: showResultModal ? 'center' : 'center',
          zIndex: 1000,
          overflow: 'hidden',
          paddingTop: showResultModal ? '20px' : '0',
          paddingBottom: showResultModal ? '20px' : '0',
          boxSizing: 'border-box',
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget && !isImporting) {
            onCancel();
          }
        }}
      >
        <div
          style={{
            width: showResultModal ? 'auto' : '800px',
            backgroundColor: showResultModal ? 'transparent' : 'white',
            borderRadius: showResultModal ? '12px' : '12px',
            padding: showResultModal ? '0' : '32px',
            boxShadow: showResultModal ? '0 20px 60px rgba(0,0,0,0.3)' : '0 20px 60px rgba(0,0,0,0.3)',
            maxHeight: showResultModal ? 'none' : '80vh',
            overflow: 'visible',
            boxSizing: 'border-box',
            display: showResultModal ? 'flex' : 'block',
            flexDirection: showResultModal ? 'column' : 'row',
            alignItems: showResultModal ? 'center' : 'stretch',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {showResultModal ? (
            // 显示导入结果 - 三个独立部分
            <>
              {/* 第一部分：标题 */}
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

              {/* 第二部分：导入结果内容 */}
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
                {/* 结果图标 */}
                <div style={{ 
                  textAlign: 'center',
                  fontSize: '48px', 
                  marginBottom: '16px',
                  filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))',
                }}>
                  {getResultIcon()}
                </div>
                
                {/* 结果标题 */}
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  color: '#1f2937',
                  marginBottom: '12px',
                  margin: 0,
                  textAlign: 'center',
                }}>
                  {getResultTitle()}
                </h2>
                
                {/* 结果详情 */}
                <p style={{
                  fontSize: '16px',
                  color: '#6b7280',
                  marginBottom: resultModalData.failedCount > 0 ? '16px' : '0',
                  lineHeight: '1.6',
                  textAlign: 'center',
                }}>
                  {getResultMessage()}
                </p>

                {/* 失败文件详情区域 */}
                {resultModalData.failedCount > 0 && resultModalData.failedFiles && resultModalData.failedFiles.length > 0 && (
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
                        {I18n.t('workflow_import_failed_files_details')} ({resultModalData.failedCount})
                      </div>
                      <div style={{
                        maxHeight: '150px',
                        overflowY: 'auto',
                      }}>
                        {resultModalData.failedFiles.map((file, index) => (
                          <div
                            key={index}
                            style={{
                              padding: '12px 16px',
                              borderBottom: index < resultModalData.failedFiles.length - 1 ? '1px solid #f3f4f6' : 'none',
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

              {/* 第三部分：按钮 */}
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
                  onClick={importHandlers.handleCancelResult}
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
                  {resultModalData.successCount > 0 ? I18n.t('workflow_import_complete') : I18n.t('workflow_import_close')}
                </button>

                {resultModalData.successCount > 0 && resultModalData.firstWorkflowId && (
                  <button
                    onClick={importHandlers.handleConfirmResult}
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
            </>
          ) : (
            // 显示导入界面
            <>
              {/* 标题 */}
              <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '600', margin: 0, color: '#2d3748' }}>
                  {I18n.t('workflow_import')}
                </h2>
              </div>

              {/* 文件上传区域 */}
              <FileUpload
                dragActive={dragActive}
                isImporting={isImporting}
                onFilesSelected={importHandlers.handleFileSelect}
                onDragEnter={dragHandlers.handleDragEnter}
                onDragLeave={dragHandlers.handleDragLeave}
                onDragOver={dragHandlers.handleDragOver}
                onDrop={dragHandlers.handleDrop}
              />

              {/* 文件列表 */}
              {selectedFiles.length > 0 && (
                <div style={{ marginTop: '24px' }}>
                  <FileList
                    selectedFiles={selectedFiles}
                    isImporting={isImporting}
                    onRemoveFile={removeFile}
                    onUpdateWorkflowName={updateWorkflowName}
                    onClearAll={clearAllFiles}
                  />
                </div>
              )}

              {/* 底部按钮 */}
              <div
                style={{
                  marginTop: '32px',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '16px',
                }}
              >
                <Button 
                  onClick={onCancel} 
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
            </>
          )}
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
    </>
  );
};

export default WorkflowImport;
