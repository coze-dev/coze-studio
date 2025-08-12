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

import ClickAwayListener from 'react-click-away-listener';
import React, { useEffect, useRef } from 'react';

import { nanoid } from 'nanoid';
import classNames from 'classnames';
import { useUpdateEffect, useSize } from 'ahooks';
import { I18n } from '@coze-arch/i18n';
import { Toast } from '@coze-arch/coze-design';
import { typeSafeJSONParse } from '@coze-arch/bot-utils';
import {
  type FileItem as SemiFileItem,
  type RenderFileItemProps,
} from '@coze-arch/bot-semi/Upload';
import { Upload } from '@coze-arch/bot-semi';
import { usePersistCallback } from '@coze-arch/hooks';

import {
  useUpload,
  type FileItem,
  FileItemStatus,
  formatBytes,
} from '@/hooks/use-upload';
import { useFileDragging } from '@/components/test-run/test-form-materials/file/use-file-dragging';
import CustomUploadNode from '@/components/test-run/test-form-materials/file/custom-upload-node';
import { FileIcon } from '@/components/file-icon';

import { type BaseFileProps } from './types';
import CustomFileItem from './custom-file-item';

import styles from './index.module.less';

const TEST_RUN_FILE_NAME_KEY = 'x-wf-file_name';

/**
 * Generate the file URL and add the file name parameter.
 * When a file is not required, it should return undefined.
 */
const getFormatFileUrl = (curFile: FileItem) => {
  const originUrl = curFile?.url;
  const fileName = curFile?.name ?? '';
  try {
    const urlObj = new URL(originUrl as string);
    const params = new URLSearchParams(urlObj.search);

    if (params.has(TEST_RUN_FILE_NAME_KEY)) {
      params.set(TEST_RUN_FILE_NAME_KEY, fileName);
    } else {
      params.append(TEST_RUN_FILE_NAME_KEY, fileName);
    }

    urlObj.search = params.toString();

    return urlObj.toString();
  } catch (e) {
    return originUrl;
  }
};

const getParsedFileInfo = (formatUrl: string) => {
  try {
    const url = new URL(formatUrl);
    const params = new URLSearchParams(url.search);
    const fileName =
      params.get(TEST_RUN_FILE_NAME_KEY) ?? I18n.t('plugin_file_unknown');

    return {
      url: formatUrl,
      uid: nanoid(),
      name: fileName,
    };
  } catch (err) {
    console.error(`parse file url error: ${formatUrl}`, err);
    return {
      url: '',
      uid: nanoid(),
      name: I18n.t('plugin_file_unknown'),
    };
  }
};

const getInitialValue = (val: string, multiple: boolean): FileItem[] => {
  if (multiple) {
    const multipleVal = typeSafeJSONParse(val);
    if (Array.isArray(multipleVal)) {
      return multipleVal.map(url => getParsedFileInfo(url)) as FileItem[];
    }
  }
  if (val) {
    return [getParsedFileInfo(val)] as FileItem[];
  }
  return [];
};

export const FileBaseAdapter: React.FC<BaseFileProps> = props => {
  const {
    validateStatus,
    value,
    onChange,
    onBlur,
    onFocus,
    accept,
    multiple,
    disabled,
    fileType,
  } = props;

  const focusRef = useRef(false);
  const { ref: wrapperRef, fileDragging } = useFileDragging();
  const wrapperSize = useSize(wrapperRef);

  const maxFileCount = multiple ? 20 : 1;

  const { upload, fileList, isUploading, deleteFile, setFileList } = useUpload({
    multiple,
    fileType,
    accept,
    maxFileCount,
  });

  const handleFocus = () => {
    if (!focusRef.current) {
      focusRef.current = true;
      onFocus?.();
    }
  };
  const handleBlur = () => {
    if (focusRef.current) {
      focusRef.current = false;
      onBlur?.();
    }
  };
  const handleClickAway = () => {
    if (!isUploading) {
      handleBlur();
    }
  };

  const handleUpload = async file => {
    const { fileInstance } = file;
    await upload(fileInstance);
  };

  const getSubmitValue = usePersistCallback((): string | undefined => {
    let newVal: string | undefined;
    if (multiple) {
      const fileUrlList = fileList
        .filter(item => item.url)
        .map(item => getFormatFileUrl(item));
      newVal =
        fileUrlList?.length > 0 ? JSON.stringify(fileUrlList) : undefined;
    } else {
      const singleFile = fileList?.[0];
      newVal = getFormatFileUrl(singleFile);
    }
    return newVal;
  });

  const handleChange = usePersistCallback(val => onChange?.(val));

  // When the fileList is updated, onChange is triggered.
  useUpdateEffect(() => {
    const newVal = getSubmitValue();
    handleChange?.(newVal);
  }, [fileList]);

  // When the form value is updated, sync to fileList
  useEffect(() => {
    const val = getSubmitValue();
    if (val !== value) {
      setFileList(getInitialValue(value as string, multiple));
    }
  }, [value]);

  const handleAcceptInvalid = () => {
    Toast.error(
      I18n.t('imageflow_upload_error_type', {
        type: accept,
      }),
    );
  };

  const semiFileList: SemiFileItem[] = fileList.map(file => ({
    name: file.name,
    size: file.size !== undefined ? formatBytes(file.size) : '',
    uid: file.uid || nanoid(),
    status: file.status || FileItemStatus.Success,
    url: file.uil,
    validateMessage: file.validateMessage,
    percent: file.percent,
    preview: true,
  }));

  const renderFileItem = (renderProps: RenderFileItemProps) => (
    <CustomFileItem {...renderProps} />
  );

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <div
        ref={wrapperRef}
        className={classNames(styles.container, {
          [styles['hide-upload-area']]: fileList.length >= maxFileCount,
          [styles['list-item-wrap']]: wrapperSize && wrapperSize.width > 388,
        })}
      >
        <Upload
          disabled={disabled}
          action=""
          limit={maxFileCount}
          fileList={semiFileList}
          data-testid={props['data-testid']}
          className={validateStatus === 'error' ? 'has-error' : ''}
          customRequest={handleUpload}
          draggable={true}
          dragMainText={I18n.t('imageflow_upload_action_common')}
          dragSubText={I18n.t('imageflow_upload_type', {
            type: accept,
          })}
          multiple={multiple}
          accept={accept}
          onDrop={handleFocus}
          onOpenFileDialog={handleFocus}
          onAcceptInvalid={handleAcceptInvalid}
          previewFile={file => {
            const { uid } = file;
            const fileItem = fileList.find(item => item.uid === uid);
            if (fileItem) {
              return <FileIcon file={fileItem} size={16} hideLoadingIcon />;
            }
          }}
          onRemove={(currentFile, list, currentFileItem) => {
            deleteFile(currentFileItem.uid);
          }}
          showClear={false}
          renderFileItem={renderFileItem}
        >
          <CustomUploadNode
            accept={accept}
            fileType={fileType}
            disabled={disabled}
            fileDragging={fileDragging}
            fileList={fileList}
            setFileList={setFileList}
          />
        </Upload>
      </div>
    </ClickAwayListener>
  );
};
