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

import {
  sanitizeWorkflowName,
  parseWorkflowData,
  convertFileToBase64,
  isValidWorkflowData,
} from '../utils';
import type { WorkflowFile } from '../types';

export const processZipFile = async (
  workflowFile: WorkflowFile,
): Promise<{ workflowData: Record<string, unknown>; error?: string }> => {
  try {
    const zipBase64 = await convertFileToBase64(workflowFile.file);

    // ZIP文件直接作为工作流数据，让批量导入API处理
    return {
      workflowData: {
        name: sanitizeWorkflowName(
          workflowFile.fileName.replace(/\.zip$/i, ''),
        ),
        description: 'ZIP工作流文件，将在导入时自动解析',
        format: 'zip',
        data: zipBase64,
      },
    };
  } catch (error) {
    console.error('ZIP处理失败:', error);
    return {
      workflowData: {},
      error:
        error instanceof Error ? error.message : '处理ZIP文件时发生未知错误',
    };
  }
};

export const processTextFile = async (
  workflowFile: WorkflowFile,
): Promise<{ workflowData: Record<string, unknown>; error?: string }> => {
  try {
    const fileContent = await workflowFile.file.text();
    const fileName = workflowFile.fileName.toLowerCase();
    const isYamlFile = fileName.endsWith('.yml') || fileName.endsWith('.yaml');
    const workflowData = parseWorkflowData(fileContent, isYamlFile);

    if (!isValidWorkflowData(workflowData)) {
      return {
        workflowData: {},
        error: '无效的工作流数据格式，请检查文件内容',
      };
    }

    return { workflowData };
  } catch (error) {
    console.error('文本文件处理失败:', error);
    return {
      workflowData: {},
      error: error instanceof Error ? error.message : '解析文件时发生未知错误',
    };
  }
};

export const createWorkflowPreview = (
  workflowData: Record<string, unknown>,
) => ({
  name: (workflowData.name as string) || '未命名工作流',
  description: (workflowData.description as string) || '',
  nodeCount:
    Array.isArray(workflowData.nodes) || Array.isArray(workflowData.steps)
      ? (workflowData.nodes as unknown[])?.length ||
        (workflowData.steps as unknown[])?.length ||
        0
      : 0,
  edgeCount: Array.isArray(workflowData.edges)
    ? (workflowData.edges as unknown[]).length
    : 0,
  version: (workflowData.version as string) || '1.0',
});

export const updateFileStatus = (
  files: WorkflowFile[],
  fileId: string,
  updates: Partial<WorkflowFile>,
): WorkflowFile[] =>
  files.map(f => (f.id === fileId ? { ...f, ...updates } : f));

export const createWorkflowName = (
  workflowData: Record<string, unknown>,
  fileName: string,
): string => {
  const baseName =
    (workflowData.name as string) ||
    fileName.replace(/\.(json|yml|yaml|zip)$/i, '');
  return sanitizeWorkflowName(baseName);
};
