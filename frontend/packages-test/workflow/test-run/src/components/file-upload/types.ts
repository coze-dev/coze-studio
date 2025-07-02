import type { FileItemStatus } from '../file-icon';

export interface FileItem extends File {
  // 唯一标识
  uid?: string;
  // 文件地址
  url?: string;
  // 上传进度
  percent?: number;
  // 校验信息
  validateMessage?: string;
  status?: FileItemStatus;
  [key: string]: any;
}
