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

// Select时保存的数据结构
export interface FileInfo {
  id: FileId;
  name?: string;
  type?: FileNodeType;
  hasChildren?: boolean;
  file_type?: string;
  file_url?: string;
  // 飞书 Wiki 空间需要使用
  space_id?: string;
  obj_token?: string;
}
