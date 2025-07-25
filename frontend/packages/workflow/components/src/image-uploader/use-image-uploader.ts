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
 
/* eslint-disable @coze-arch/max-line-per-function */
import { useCallback, useEffect, useRef, useState } from 'react';

import { useUnmount } from 'ahooks';
import { I18n } from '@coze-arch/i18n';
import { Toast } from '@coze-arch/coze-design';

import ImageUploader, { ImgUploadErrNo } from './image-uploader';

interface UseImageUploaderParams {
  /** 图片限制条件 */
  rules?: ImageUploader['rules'];
  /** 上传模式 */
  mode?: ImageUploader['mode'];
  /** 上传配置 */
  timeout?: ImageUploader['timeout'];
}

interface UseImageUploaderReturn {
  /** 图片标识, 用于提交给服务 */
  uri: string;
  /** 图片展示地址 */
  url: string;
  /** 文件名 */
  fileName: string;
  /** 上传中状态 */
  loading: boolean;
  /** 上传失败状态 */
  isError: boolean;
  /** 上传图片 */
  uploadImg: (file: File) => Promise<ImageUploader['uploadResult']>;
  /** 清除已上传图片 */
  clearImg: () => void;
  /** 上传失败后重试 */
  retryUploadImg: () => Promise<ImageUploader['uploadResult']>;
  /**
   * 设置初始状态, 用于回显服务下发的数据
   *
   * @param val 对应值
   * @param isMerge 是否 merge 模式, merge 模式仅更新传入字段. 默认 false
   */
  setImgValue: (
    val: { uri?: string; url?: string; fileName?: string },
    isMerge?: boolean,
  ) => void;
}

/** 缓存文件名 */
const fileNameCache: Record<string, string> = Object.create(null);

// eslint-disable-next-line max-lines-per-function
export default function useImageUploader(
  params?: UseImageUploaderParams,
): UseImageUploaderReturn {
  const { rules, mode, timeout } = params || {};
  const uploaderRef = useRef<ImageUploader>(
    new ImageUploader({ rules, mode, timeout }),
  );
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [uri, setUri] = useState('');
  const [url, setUrl] = useState('');
  const [fileName, setFileName] = useState('');

  useUnmount(() => {
    uploaderRef.current?.reset();
  });

  useEffect(() => {
    uploaderRef.current.rules = rules;
    uploaderRef.current.mode = mode ?? uploaderRef.current.mode;
  }, [rules, mode]);

  const setImgValue: UseImageUploaderReturn['setImgValue'] = useCallback(
    (
      { url: targetDisplayUrl, uri: targetUri, fileName: targetFileName },
      isMerge = false,
    ) => {
      if (typeof targetUri !== 'undefined') {
        setUri(targetUri);
      }
      if (typeof targetDisplayUrl !== 'undefined') {
        setUrl(targetDisplayUrl);
      }
      if (typeof targetFileName !== 'undefined') {
        setFileName(targetFileName);
      }

      // 非 Merge 模式, 未设置的值清空
      if (!isMerge) {
        setUrl(targetDisplayUrl ?? '');
        setUri(targetUri ?? '');
        setFileName(targetFileName ?? '');
      }

      // 文件名特殊逻辑, 根据 uri 从缓存重映射文件名
      if (!targetFileName) {
        if (targetUri && fileNameCache[targetUri]) {
          setFileName(fileNameCache[targetUri]);
        } else if (!targetUri) {
          setFileName('');
        }
      }

      if (typeof targetUri !== 'undefined' || !isMerge) {
        setLoading(false);
        setIsError(false);
        uploaderRef.current?.reset();
      }
    },
    [],
  );

  const uploadImg = useCallback(
    async (file: File): Promise<ImageUploader['uploadResult'] | undefined> => {
      await uploaderRef.current.select(file);
      // 图片校验不通过
      if (!uploaderRef.current.validateResult?.isSuccess) {
        Toast.error(
          uploaderRef.current.validateResult?.msg || '图片不符合要求',
        );
        // @ts-expect-error 此处 validateResult.isSuccess 为 false
        return uploaderRef.current.validateResult;
      }

      setIsError(false);
      setLoading(true);
      setUrl(uploaderRef.current.displayUrl || '');
      setFileName(file.name || '');
      await uploaderRef.current.upload();
      setLoading(false);

      // 上传结果
      const { uploadResult } = uploaderRef.current;

      // 无上传结果说明上传取消
      if (!uploadResult) {
        return;
      }

      setIsError(!uploadResult.isSuccess);

      if (uploadResult.isSuccess) {
        Toast.success(I18n.t('file_upload_success'));
        setUri(uploadResult.uri);
        // FIXME: 合理的设计应该用 uri 进行缓存, 但是 Imageflow 初期只存储了 url, 使用 url 作为临时方案
        fileNameCache[uploadResult.url] = `${file.name}`;
      } else {
        Toast.error(uploadResult.msg);
      }
      return uploadResult;
    },
    [],
  );

  const retryUploadImg = useCallback(async (): Promise<
    ImageUploader['uploadResult']
  > => {
    // 重传前置检查, 有文件且校验通过
    if (
      !uploaderRef.current?.file ||
      !uploaderRef.current?.validateResult?.isSuccess
    ) {
      Toast.error(I18n.t('imageflow_upload_action'));
      return {
        isSuccess: false,
        errNo: ImgUploadErrNo.NoFile,
        msg: '请选择文件',
      };
    }
    setLoading(true);
    setIsError(false);
    await uploaderRef.current.upload();
    setLoading(false);

    // 上传结果
    const uploadResult = uploaderRef.current.uploadResult || {
      isSuccess: false,
      errNo: ImgUploadErrNo.UploadFail,
      msg: '无上传结果',
    };

    setIsError(!uploadResult.isSuccess);
    if (uploadResult.isSuccess) {
      Toast.success(I18n.t('file_upload_success'));
      setUri(uploadResult.uri);
      fileNameCache[uploadResult.url] = uploaderRef.current.file.name;
    } else {
      Toast.error(uploadResult.msg);
    }
    return uploadResult;
  }, []);

  const clearImg = useCallback(() => {
    setUri('');
    setUrl('');
    setFileName('');
    setLoading(false);
    setIsError(false);
    uploaderRef.current?.reset();
  }, []);

  return {
    uri,
    url,
    fileName,
    loading,
    isError,
    uploadImg,
    clearImg,
    retryUploadImg,
    setImgValue,
  };
}
