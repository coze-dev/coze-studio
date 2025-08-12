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

import { useCallback, useEffect } from 'react';

import { nanoid } from 'nanoid';
import classNames from 'classnames';
import { useUpdateEffect } from 'ahooks';
import { ViewVariableType } from '@coze-workflow/base/types';
import { I18n } from '@coze-arch/i18n';
import {
  Upload,
  Toast,
  type FileItem as SemiFileItem,
} from '@coze-arch/coze-design';
import { typeSafeJSONParse } from '@coze-arch/bot-utils';
import { type SetterComponentProps } from '@flowgram-adapter/free-layout-editor';

import {
  useUpload,
  type FileItem,
  FileItemStatus,
  formatBytes,
  getAccept,
} from '@/hooks/use-upload';
import { FileIcon } from '@/components/file-icon';

import styles from './index.module.less';

interface IProps {
  accept: string;
  multiple: boolean;
  disabled?: boolean;
  viewVariableType?: ViewVariableType;
  fileType: 'object' | 'image';
}
type FileUploadProps = SetterComponentProps<string | undefined, IProps>;

const getInitialValue = (
  val: string | undefined,
  multiple: boolean,
): FileItem[] => {
  if (multiple) {
    const multipleVal = typeSafeJSONParse(val);
    if (Array.isArray(multipleVal)) {
      return multipleVal.map(url => ({
        url,
        uid: nanoid(),
        name: I18n.t('plugin_file_unknown'),
      })) as FileItem[];
    }
  }
  if (val) {
    return [
      {
        url: val,
        uid: nanoid(),
        name: I18n.t('plugin_file_unknown'),
      },
    ] as FileItem[];
  }
  return [];
};

const getDefaultPropsByViewVariableType = (
  viewVariableType?: ViewVariableType,
) =>
  viewVariableType
    ? {
        accept: getAccept(viewVariableType),
        fileType: [
          ViewVariableType.Image,
          ViewVariableType.ArrayImage,
        ].includes(viewVariableType)
          ? 'image'
          : 'object',
        multiple: ViewVariableType.isArrayType(viewVariableType),
      }
    : {};

const FileUpload = ({
  value,
  onChange,
  readonly,
  options,
}: FileUploadProps) => {
  const { accept, multiple, fileType, ...restOptions } = Object.assign(
    {},
    getDefaultPropsByViewVariableType(options.viewVariableType),
    options,
  );

  const maxFileCount = multiple ? 20 : 1;

  const {
    upload,
    fileList,
    // isUploading,
    deleteFile,
    setFileList,
  } = useUpload({
    multiple,
    fileType,
    accept,
    maxFileCount,
  });

  const handleUpload = async file => {
    const { fileInstance } = file;
    await upload(fileInstance);
  };

  const getSubmitValue = useCallback((): string | undefined => {
    let newVal: string | undefined;
    if (multiple) {
      newVal = JSON.stringify(
        fileList.filter(item => item.url).map(item => item.url),
      );
    } else {
      newVal = fileList[0]?.url;
    }
    return newVal;
  }, [fileList, multiple]);

  // When the fileList is updated, onChange is triggered.
  useUpdateEffect(() => {
    const newVal = getSubmitValue();
    onChange?.(newVal);
  }, [getSubmitValue]);

  // When the form value is updated, sync to fileList
  useEffect(() => {
    const val = getSubmitValue();
    if (val !== value) {
      setFileList(getInitialValue(value, multiple));
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

  return (
    <div
      className={classNames(styles.container, {
        [styles['hide-upload-area']]: fileList?.length >= maxFileCount,
      })}
    >
      <Upload
        disabled={readonly}
        action=""
        limit={maxFileCount}
        fileList={semiFileList}
        customRequest={handleUpload}
        draggable={true}
        dragMainText={I18n.t('imageflow_upload_action_common')}
        dragSubText={I18n.t('imageflow_upload_type', {
          type: accept,
        })}
        multiple={multiple}
        accept={accept}
        onAcceptInvalid={handleAcceptInvalid}
        previewFile={file => {
          const { uid } = file;
          const fileItem = fileList.find(item => item.uid === uid);
          if (fileItem) {
            return <FileIcon file={fileItem} size={36} />;
          }
        }}
        onRemove={(currentFile, list, currentFileItem) => {
          deleteFile(currentFileItem.uid);
        }}
        onClear={() => setFileList([])}
        {...restOptions}
      />
    </div>
  );
};

export const fileUpload = {
  key: 'FileUpload',
  component: FileUpload,
};
