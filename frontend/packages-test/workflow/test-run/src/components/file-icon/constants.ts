export enum FileItemStatus {
  Success = 'success',
  UploadFail = 'uploadFail',
  ValidateFail = 'validateFail',
  Validating = 'validating',
  Uploading = 'uploading',
  Wait = 'wait',
}

// 支持预览的图片类型
export const PREVIEW_IMAGE_TYPE = ['jpg', 'jpeg', 'png', 'webp', 'svg'];
