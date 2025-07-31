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
  /** image restrictions */
  rules?: ImageUploader['rules'];
  /** upload mode */
  mode?: ImageUploader['mode'];
  /** upload configuration */
  timeout?: ImageUploader['timeout'];
}

interface UseImageUploaderReturn {
  /** Image ID for submission to the service */
  uri: string;
  /** Picture display address */
  url: string;
  /** file name */
  fileName: string;
  /** Uploading status */
  loading: boolean;
  /** Upload failed status */
  isError: boolean;
  /** Upload image */
  uploadImg: (file: File) => Promise<ImageUploader['uploadResult']>;
  /** Clear uploaded images */
  clearImg: () => void;
  /** Retry after upload failure */
  retryUploadImg: () => Promise<ImageUploader['uploadResult']>;
  /**
   * Set the initial state for echoing data sent by the service
   *
   * @param val corresponding value
   * @Param isMerge Whether to merge mode, merge mode only updates incoming fields. Default false
   */
  setImgValue: (
    val: { uri?: string; url?: string; fileName?: string },
    isMerge?: boolean,
  ) => void;
}

/** cache filename */
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

      // Non-Merge mode, unset values are cleared
      if (!isMerge) {
        setUrl(targetDisplayUrl ?? '');
        setUri(targetUri ?? '');
        setFileName(targetFileName ?? '');
      }

      // Filename special logic, remapping filenames from cache based on URIs
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
      // The picture verification failed.
      if (!uploaderRef.current.validateResult?.isSuccess) {
        Toast.error(
          uploaderRef.current.validateResult?.msg || '图片不符合要求',
        );
        // @ts-expect-error here validateResult.isSuccess is false
        return uploaderRef.current.validateResult;
      }

      setIsError(false);
      setLoading(true);
      setUrl(uploaderRef.current.displayUrl || '');
      setFileName(file.name || '');
      await uploaderRef.current.upload();
      setLoading(false);

      // Upload result
      const { uploadResult } = uploaderRef.current;

      // No upload result indicates that the upload is cancelled.
      if (!uploadResult) {
        return;
      }

      setIsError(!uploadResult.isSuccess);

      if (uploadResult.isSuccess) {
        Toast.success(I18n.t('file_upload_success'));
        setUri(uploadResult.uri);
        // FIXME: A reasonable design should cache with URIs, but Imageflow initially only stored URLs, using URLs as a temporary solution
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
    // Resend pre-check, there is a file and the verification is passed
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

    // Upload result
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
