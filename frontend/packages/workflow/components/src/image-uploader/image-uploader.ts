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
 
import { workflowApi } from '@coze-workflow/base/api';
import { REPORT_EVENTS } from '@coze-arch/report-events';
import { I18n } from '@coze-arch/i18n';
import { upLoadFile } from '@coze-arch/bot-utils';
import { CustomError } from '@coze-arch/bot-error';
import { FileBizType } from '@coze-arch/bot-api/developer_api';
import { DeveloperApi } from '@coze-arch/bot-api';

/** 图片上传错误码 */
export enum ImgUploadErrNo {
  Success = 0,
  /** 缺少文件 */
  NoFile,
  /** 上传失败 */
  UploadFail,
  /** 上传超时 */
  UploadTimeout,
  /** 获取 URL 失败 */
  GetUrlFail,
  /** 校验异常, 但是不明确具体异常 */
  ValidateError,
  /** 文件尺寸超出限制 */
  MaxSizeError,
  /** 文件类型不支持 */
  SuffixError,
  /** 最大宽度限制 */
  MaxWidthError,
  /** 最大高度限制 */
  MaxHeightError,
  /** 最小宽度限制 */
  MinWidthError,
  /** 最小高度限制 */
  MinHeightError,
  /** 固定宽高比 */
  AspectRatioError,
}

export interface ImageRule {
  /** 文件大小限制, 单位 b, 1M = 1 * 1024 * 1024 */
  maxSize?: number;
  /** 文件后缀 */
  suffix?: string[];
  /** 最大宽度限制 */
  maxWidth?: number;
  /** 最大高度限制 */
  maxHeight?: number;
  /** 最小宽度限制 */
  minWidth?: number;
  /** 最小高度限制 */
  minHeight?: number;
  /** 固定宽高比 */
  aspectRatio?: number;
}

type UploadResult =
  | {
      isSuccess: false;
      errNo: ImgUploadErrNo;
      msg: string;
    }
  | {
      isSuccess: true;
      errNo: ImgUploadErrNo.Success;
      uri: string;
      url: string;
    };

/**
 * Workflow 图片上传
 */
class ImageUploader {
  /** 任务 ID, 用于避免 ABA 问题 */
  private taskId = 0;
  /**
   * 上传模式
   * - api 直接使用接口上传
   * - uploader 上传到视频云服务, 走 workflow 服务. !海外版未经过测试
   */
  mode: 'uploader' | 'api' = 'uploader';
  /** 校验规则 */
  rules?: ImageRule;
  /** 上传的文件 */
  file?: File;
  /** 展示 Url, 添加文件后生成, 用于预览 */
  displayUrl?: string;
  /** 上传状态 */
  isUploading = false;
  /** 超时时间 */
  timeout?: number;
  /** 校验结果 */
  validateResult?: {
    isSuccess: boolean;
    errNo: ImgUploadErrNo;
    msg?: string;
  };
  /** 上传结果 */
  uploadResult?: UploadResult;

  constructor(config?: {
    rules?: ImageRule;
    mode?: ImageUploader['mode'];
    timeout?: number;
  }) {
    this.rules = config?.rules ?? this.rules;
    this.mode = config?.mode ?? this.mode;
    this.timeout = config?.timeout ?? this.timeout;
  }

  /** 选择待上传文件 */
  async select(file: File) {
    if (!file) {
      throw new CustomError('normal_error', '选择文件为空');
    }
    this.reset();
    this.file = file;
    this.displayUrl = URL.createObjectURL(this.file);

    await this.validate().catch(() => {
      this.validateResult = {
        isSuccess: false,
        errNo: ImgUploadErrNo.ValidateError,
        msg: I18n.t('imageflow_upload_error'),
      };
    });
  }

  /** 上传图片 */
  async upload() {
    // 未选择文件或文件不符合要求
    if (!this.file || !this.validateResult?.isSuccess || this.isUploading) {
      return;
    }

    this.isUploading = true;

    // 添加任务 ID,避免 ABA 问题
    this.taskId += 1;
    const currentId = this.taskId;

    let uploadResult: UploadResult;
    if (this.mode === 'api') {
      uploadResult = await this.uploadByApi(this.file);
    } else if (this.mode === 'uploader') {
      uploadResult = await this.uploadByUploader(this.file);
    } else {
      throw new CustomError('normal_error', 'ImageUploader mode error');
    }

    if (currentId !== this.taskId) {
      return;
    }

    this.uploadResult = uploadResult;
    this.isUploading = false;
  }

  private uploadByUploader(file: File): Promise<UploadResult> {
    return new Promise(resolve => {
      const timer =
        this.timeout &&
        setTimeout(
          () =>
            resolve({
              isSuccess: false,
              errNo: ImgUploadErrNo.UploadTimeout,
              msg: I18n.t('imageflow_upload_error7'),
            }),
          this.timeout,
        );

      const doUpload = async () => {
        const uri = await upLoadFile({
          biz: 'workflow',
          file,
          fileType: 'image',
        })
          .then(result => {
            if (!result) {
              throw new CustomError('normal_error', 'no uri');
            }
            return result;
          })
          .catch(() => {
            resolve({
              isSuccess: false,
              errNo: ImgUploadErrNo.UploadFail,
              msg: I18n.t('imageflow_upload_error'),
            });
            return '';
          });

        if (!uri) {
          return;
        }
        // 获取 url
        const resp = await workflowApi
          .SignImageURL(
            {
              uri,
            },
            {
              __disableErrorToast: true,
            },
          )
          .catch(() => null);
        const url = resp?.url || '';

        if (url) {
          resolve({
            isSuccess: true,
            errNo: ImgUploadErrNo.Success,
            uri,
            url,
          });
        } else {
          resolve({
            isSuccess: false,
            errNo: ImgUploadErrNo.GetUrlFail,
            msg: I18n.t('imageflow_upload_error'),
          });
        }
      };

      doUpload().finally(() => {
        clearTimeout(timer);
      });
    });
  }

  private uploadByApi(file: File): Promise<UploadResult> {
    return new Promise(resolve => {
      const timer =
        this.timeout &&
        setTimeout(
          () =>
            resolve({
              isSuccess: false,
              errNo: ImgUploadErrNo.UploadTimeout,
              msg: I18n.t('imageflow_upload_error7'),
            }),
          this.timeout,
        );

      const doUpload = async function () {
        const base64 = await getBase64(file).catch(() => '');

        if (!base64) {
          resolve({
            isSuccess: false,
            errNo: ImgUploadErrNo.UploadFail,
            msg: I18n.t('imageflow_upload_error'),
          });
          return;
        }

        await DeveloperApi.UploadFile({
          file_head: {
            file_type: getFileExtension(file.name),
            biz_type: FileBizType.BIZ_BOT_WORKFLOW,
          },
          data: base64,
        })
          .then(result => {
            resolve({
              isSuccess: true,
              errNo: ImgUploadErrNo.Success,
              uri: result.data?.upload_uri || '',
              url: result.data?.upload_url || '',
            });
          })
          .catch(() => {
            resolve({
              isSuccess: false,
              errNo: ImgUploadErrNo.UploadFail,
              msg: I18n.t('imageflow_upload_error'),
            });
          });
      };
      doUpload().finally(() => {
        clearTimeout(timer);
      });
    });
  }

  reset() {
    this.file = undefined;
    if (this.displayUrl) {
      // 是内部链接
      URL.revokeObjectURL(this.displayUrl);
      this.displayUrl = undefined;
    }
    this.isUploading = false;
    this.uploadResult = undefined;
    this.validateResult = undefined;
    this.taskId += 1;
  }

  // eslint-disable-next-line complexity
  private async validate() {
    if (!this.file || !this.displayUrl) {
      return;
    }

    const rules = this.rules || {};

    // 文件尺寸
    if (rules.maxSize) {
      if (this.file.size > rules.maxSize) {
        this.validateResult = {
          isSuccess: false,
          errNo: ImgUploadErrNo.MaxSizeError,
          msg: I18n.t('imageflow_upload_exceed', {
            size: formatBytes(rules.maxSize),
          }),
        };
        return;
      }
    }

    // 文件后缀
    if (Array.isArray(rules.suffix) && rules.suffix.length > 0) {
      const fileExtension = getFileExtension(this.file.name);
      if (!rules.suffix.includes(fileExtension)) {
        this.validateResult = {
          isSuccess: false,
          errNo: ImgUploadErrNo.SuffixError,
          msg: I18n.t('imageflow_upload_error_type', {
            type: `${rules.suffix.filter(Boolean).join('/')}`,
          }),
        };
        return;
      }
    }

    // 图片尺寸
    const { width, height } = await getImageSize(this.displayUrl);

    if (!width || !height) {
      this.validateResult = {
        isSuccess: false,
        errNo: ImgUploadErrNo.ValidateError,
        msg: I18n.t('imageflow_upload_error6'),
      };
      return;
    }
    if (rules.maxWidth) {
      if (width > rules.maxWidth) {
        this.validateResult = {
          isSuccess: false,
          errNo: ImgUploadErrNo.MaxWidthError,
          msg: I18n.t('imageflow_upload_error5', {
            value: `${rules.maxWidth}px`,
          }),
        };
        return;
      }
    }
    if (rules.maxHeight) {
      if (height > rules.maxHeight) {
        this.validateResult = {
          isSuccess: false,
          errNo: ImgUploadErrNo.MaxHeightError,
          msg: I18n.t('imageflow_upload_error4', {
            value: `${rules.maxHeight}px`,
          }),
        };
        return;
      }
    }
    if (rules.minWidth) {
      if (width < rules.minWidth) {
        this.validateResult = {
          isSuccess: false,
          errNo: ImgUploadErrNo.MinWidthError,
          msg: I18n.t('imageflow_upload_error3', {
            value: `${rules.minWidth}px`,
          }),
        };
        return;
      }
    }
    if (rules.minHeight) {
      if (height < rules.minHeight) {
        this.validateResult = {
          isSuccess: false,
          errNo: ImgUploadErrNo.MinHeightError,
          msg: I18n.t('imageflow_upload_error2', {
            value: `${rules.minHeight}px`,
          }),
        };
        return;
      }
    }
    if (rules.aspectRatio) {
      if (width / height - rules.aspectRatio > Number.MIN_VALUE) {
        this.validateResult = {
          isSuccess: false,
          errNo: ImgUploadErrNo.AspectRatioError,
          msg: I18n.t('imageflow_upload_error1'),
        };
        return;
      }
    }

    this.validateResult = {
      isSuccess: true,
      errNo: ImgUploadErrNo.Success,
      msg: 'success',
    };
  }
}

export default ImageUploader;

function getBase64(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = event => {
      const result = event.target?.result;
      if (!result || typeof result !== 'string') {
        reject(
          new CustomError(REPORT_EVENTS.parmasValidation, 'file read fail'),
        );
        return;
      }
      resolve(result.replace(/^.*?,/, ''));
    };
    fileReader.readAsDataURL(file);
  });
}

/** 获取文件名后缀 */
function getFileExtension(name: string) {
  const index = name.lastIndexOf('.');
  return name.slice(index + 1).toLowerCase();
}

/**
 * @param url 获取图片宽高
 */
function getImageSize(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () =>
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    img.onerror = e => reject(e);
    img.src = url;
  });
}

/**
 * 格式化文件大小
 * @param bytes 文件大小
 * @param decimals 小数位数, 默认 2 位
 * @example
 * formatBytes(1024);       // 1KB
 * formatBytes('1024');     // 1KB
 * formatBytes(1234);       // 1.21KB
 * formatBytes(1234, 3);    // 1.205KB
 */
function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) {
    return '0 Bytes';
  }
  const k = 1024,
    dm = decimals,
    sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
    i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))}${sizes[i]}`;
}
