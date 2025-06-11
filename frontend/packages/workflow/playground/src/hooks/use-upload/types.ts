export enum FileItemStatus {
  Success = 'success',
  UploadFail = 'uploadFail',
  ValidateFail = 'validateFail',
  Validating = 'validating',
  Uploading = 'uploading',
  Wait = 'wait',
}

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}
