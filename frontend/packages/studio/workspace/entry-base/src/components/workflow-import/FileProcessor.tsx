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

interface WorkflowFile {
  id: string;
  fileName: string;
  workflowName: string;
  originalContent: string;
  workflowData: string;
  status:
    | 'pending'
    | 'validating'
    | 'valid'
    | 'invalid'
    | 'importing'
    | 'success'
    | 'failed';
  error?: string;
}

const RANDOM_ID_BASE = 36;
const RANDOM_ID_START = 2;
const RANDOM_ID_LENGTH = 9;
const MIN_FILENAME_LENGTH = 2;
const FALLBACK_ID_LENGTH = 6;

export const generateRandomId = (): string =>
  Math.random()
    .toString(RANDOM_ID_BASE)
    .substr(RANDOM_ID_START, RANDOM_ID_LENGTH);

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
  if (workflowName.length < MIN_FILENAME_LENGTH) {
    workflowName = `Workflow_${Math.random().toString(RANDOM_ID_BASE).substr(RANDOM_ID_START, FALLBACK_ID_LENGTH)}`;
  }

  return workflowName;
};

const tryAlternativeEncoding = (
  file: File,
  setSelectedFiles: (fn: (prev: WorkflowFile[]) => WorkflowFile[]) => void,
) => {
  const alternativeReader = new FileReader();
  alternativeReader.onload = e => {
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
          } catch (gbkError) {
            console.warn(`GBK decoding failed for "${file.name}":`, gbkError);
            try {
              const gb2312Decoder = new TextDecoder('gb2312');
              content = gb2312Decoder.decode(arrayBuffer);
            } catch (gb2312Error) {
              console.warn(
                `GB2312 decoding failed for "${file.name}":`,
                gb2312Error,
              );
              console.warn(
                `Unable to properly decode file "${file.name}", using UTF-8`,
              );
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
        const reader = new FileReader();
        reader.onload = fallbackEvent => {
          const result = fallbackEvent.target?.result as string;
          if (result) {
            const newFile: WorkflowFile = {
              id: generateRandomId(),
              fileName: file.name,
              workflowName: sanitizeWorkflowName(file.name),
              originalContent: result,
              workflowData: result,
              status: 'valid',
            };
            setSelectedFiles(prev => [...prev, newFile]);
          }
        };
        reader.readAsText(file, 'UTF-8');
      }
    }
  };
  alternativeReader.readAsArrayBuffer(file);
};

export const processFiles = (
  files: FileList,
  setSelectedFiles: (fn: (prev: WorkflowFile[]) => WorkflowFile[]) => void,
) => {
  Array.from(files).forEach(file => {
    const reader = new FileReader();

    if (file.name.toLowerCase().endsWith('.zip')) {
      reader.onload = e => {
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
      reader.onload = e => {
        const content = e.target?.result as string;
        if (content) {
          const hasGarbledText = /�/.test(content);

          if (hasGarbledText) {
            console.warn(
              `File "${file.name}" may have encoding issues, trying alternative encoding`,
            );
            tryAlternativeEncoding(file, setSelectedFiles);
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
  });
};
