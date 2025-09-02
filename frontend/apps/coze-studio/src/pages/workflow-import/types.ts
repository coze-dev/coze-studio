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

export interface WorkflowFile {
  id: string;
  file: File;
  fileName: string;
  workflowName: string;
  workflowData: string;
  originalContent: string;
  status:
    | 'pending'
    | 'validating'
    | 'valid'
    | 'invalid'
    | 'importing'
    | 'success'
    | 'failed';
  error?: string;
  preview?: {
    name: string;
    description: string;
    nodeCount: number;
    edgeCount: number;
    version: string;
  };
}

export interface ImportProgress {
  totalCount: number;
  successCount: number;
  failedCount: number;
  currentProcessing: string;
}

export interface ImportResults {
  success_count?: number;
  failed_count?: number;
  success_list?: Array<{
    workflow_id: string;
    file_name: string;
  }>;
  failed_list?: Array<{
    file_name: string;
    workflow_name: string;
    error_code: string;
    error_message: string;
    fail_reason?: string;
  }>;
}
