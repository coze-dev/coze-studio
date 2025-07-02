import { FILE_TYPE_CONFIG } from '@coze-common/chat-core/shared/const';

const BYTES = 1024;
export const MAX_FILE_MBYTE = 500;

export const DEFAULT_MAX_FILE_SIZE = MAX_FILE_MBYTE * BYTES * BYTES;

export const enum UploadType {
  IMAGE = 0,
  FILE = 1,
}

export const ACCEPT_FILE_EXTENSION = FILE_TYPE_CONFIG.map(cnf => cnf.accept)
  .flat(1)
  .join(',');
