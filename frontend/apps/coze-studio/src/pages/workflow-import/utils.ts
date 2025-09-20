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
import { t } from './utils/i18n';

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
    return t('workflow_name_empty');
  }

  if (!/^[a-zA-Z]/.test(name)) {
    return t('workflow_name_must_start_letter');
  }

  if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(name)) {
    return t('workflow_name_invalid_chars');
  }

  if (
    name.length < MIN_WORKFLOW_NAME_LENGTH ||
    name.length > MAX_WORKFLOW_NAME_LENGTH
  ) {
    return t('workflow_name_length_invalid');
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
      const result = e.target?.result;
      if (!result) {
        reject(new Error('Failed to read file'));
        return;
      }
      
      // FileReader.readAsDataURL() returns "data:type;base64,base64data"
      // We only need the base64 part
      const base64 = (result as string).split(',')[1];
      if (!base64) {
        reject(new Error('Failed to extract base64 data'));
        return;
      }
      
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
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
