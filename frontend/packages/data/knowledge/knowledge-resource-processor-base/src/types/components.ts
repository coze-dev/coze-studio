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

/**
 * types for src/components
 */

import { type FileId } from '@coze-data/knowledge-common-components/file-picker';
import { type FileNodeType } from '@coze-arch/bot-api/memory';

export interface ViewOnlinePageDetailProps {
  id?: string;
  url?: string;
  content?: string;
  title?: string;
}

export enum UploadMode {
  Picker = 'picker',
  Error = 'error',
}

// Data Structure Saved When Selecting
export interface FileInfo {
  id: FileId;
  name?: string;
  type?: FileNodeType;
  hasChildren?: boolean;
  file_type?: string;
  file_url?: string;
  // Feishu Wiki space is required
  space_id?: string;
  obj_token?: string;
}
