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

import { useState, useCallback } from 'react';

import {
  processZipFile,
  processTextFile,
  updateFileStatus,
  createWorkflowPreview,
  createWorkflowName,
} from '../utils/file-processor';
import {
  sanitizeWorkflowName,
  generateRandomId,
  convertFileToBase64,
} from '../utils';
import type { WorkflowFile } from '../types';

const SUPPORTED_EXTENSIONS = ['.json', '.yml', '.yaml', '.zip'];

export const useFileProcessor = () => {
  const [selectedFiles, setSelectedFiles] = useState<WorkflowFile[]>([]);

  const isFileSupported = (fileName: string): boolean =>
    SUPPORTED_EXTENSIONS.some(ext => fileName.toLowerCase().endsWith(ext));

  const handleZipFileProcessing = async (
    workflowFile: WorkflowFile,
  ): Promise<void> => {
    setSelectedFiles(prev =>
      updateFileStatus(prev, workflowFile.id, { status: 'validating' }),
    );

    const result = await processZipFile(workflowFile);

    if (result.error) {
      setSelectedFiles(prev =>
        updateFileStatus(prev, workflowFile.id, {
          status: 'invalid',
          error: result.error,
        }),
      );
      return;
    }

    const preview = createWorkflowPreview(result.workflowData);
    const workflowName = createWorkflowName(
      result.workflowData,
      workflowFile.fileName,
    );
    const originalContent = await convertFileToBase64(workflowFile.file);

    setSelectedFiles(prev =>
      updateFileStatus(prev, workflowFile.id, {
        workflowName,
        workflowData: JSON.stringify(result.workflowData),
        originalContent,
        status: 'valid',
        preview,
      }),
    );
  };

  const handleTextFileProcessing = async (
    workflowFile: WorkflowFile,
  ): Promise<void> => {
    const result = await processTextFile(workflowFile);

    if (result.error) {
      setSelectedFiles(prev =>
        updateFileStatus(prev, workflowFile.id, {
          status: 'invalid',
          error: result.error,
        }),
      );
      return;
    }

    const preview = createWorkflowPreview(result.workflowData);
    const workflowName = createWorkflowName(
      result.workflowData,
      workflowFile.fileName,
    );
    const originalContent = await workflowFile.file.text();

    setSelectedFiles(prev =>
      updateFileStatus(prev, workflowFile.id, {
        workflowName,
        workflowData: JSON.stringify(result.workflowData),
        originalContent,
        status: 'valid',
        preview,
      }),
    );
  };

  const addFiles = useCallback((files: File[]) => {
    const newWorkflowFiles: WorkflowFile[] = files
      .filter(file => isFileSupported(file.name))
      .map(file => ({
        id: generateRandomId(),
        file,
        fileName: file.name,
        workflowName: sanitizeWorkflowName(file.name),
        workflowData: '',
        originalContent: '',
        status: 'pending' as const,
      }));

    setSelectedFiles(prev => [...prev, ...newWorkflowFiles]);

    newWorkflowFiles.forEach(workflowFile => {
      const fileName = workflowFile.fileName.toLowerCase();
      if (fileName.endsWith('.zip')) {
        handleZipFileProcessing(workflowFile);
      } else {
        handleTextFileProcessing(workflowFile);
      }
    });
  }, []);

  const removeFile = useCallback((id: string) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  const updateWorkflowName = useCallback((id: string, name: string) => {
    setSelectedFiles(prev =>
      prev.map(f => (f.id === id ? { ...f, workflowName: name } : f)),
    );
  }, []);

  const clearAllFiles = useCallback(() => {
    setSelectedFiles([]);
  }, []);

  return {
    selectedFiles,
    addFiles,
    removeFile,
    updateWorkflowName,
    clearAllFiles,
    setSelectedFiles,
  };
};
