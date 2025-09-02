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

import { load } from 'js-yaml';

const RANDOM_ID_LENGTH = 9;
const MIN_WORKFLOW_NAME_LENGTH = 2;
const MAX_WORKFLOW_NAME_LENGTH = 100;
const SUBSTRING_START = 2;
const SUBSTRING_LENGTH = 6;
const RADIX_36 = 36;

export const generateRandomId = (): string =>
  Math.random().toString(RADIX_36).substr(SUBSTRING_START, RANDOM_ID_LENGTH);

export const sanitizeWorkflowName = (fileName: string): string => {
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
  if (workflowName.length < MIN_WORKFLOW_NAME_LENGTH) {
    workflowName = `Workflow_${Math.random().toString(RADIX_36).substr(SUBSTRING_START, SUBSTRING_LENGTH)}`;
  }

  return workflowName;
};

export const validateWorkflowName = (name: string): string => {
  if (!name.trim()) {
    return '工作流名称不能为空';
  }

  if (!/^[a-zA-Z]/.test(name)) {
    return '工作流名称必须以字母开头';
  }

  if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(name)) {
    return '工作流名称只能包含字母、数字和下划线';
  }

  if (
    name.length < MIN_WORKFLOW_NAME_LENGTH ||
    name.length > MAX_WORKFLOW_NAME_LENGTH
  ) {
    return '工作流名称长度应在2-100个字符之间';
  }

  return '';
};

export const parseWorkflowData = (
  content: string,
  isYamlFile: boolean,
): Record<string, unknown> => {
  if (isYamlFile) {
    return load(content) as Record<string, unknown>;
  } else {
    return JSON.parse(content);
  }
};

export const convertFileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      if (!arrayBuffer) {
        reject(new Error('Failed to read ZIP file'));
        return;
      }

      const bytes = new Uint8Array(arrayBuffer);
      let binary = '';
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = btoa(binary);
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Failed to read ZIP file'));
    reader.readAsArrayBuffer(file);
  });

export const isValidWorkflowData = (data: Record<string, unknown>): boolean => {
  if (!data || typeof data !== 'object') {
    return false;
  }

  return !!(
    data.schema ||
    data.nodes ||
    data.workflow_id ||
    data.name ||
    data.edges ||
    data.canvas
  );
};
