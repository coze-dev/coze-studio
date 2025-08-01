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

import {
  type PropsWithChildren,
  createContext,
  useRef,
  useContext,
} from 'react';

import { ViewVariableType, type LiteralExpression } from '@coze-workflow/base';
import { usePersistCallback, useUpdateEffect } from '@coze-arch/hooks';

import { useUpload, getAccept, type FileItem } from '../../../hooks/use-upload';
import { transformExpressionInputToFileList } from './transform';

export interface UploadContextProps {
  triggerUpload: () => void;
  fileList: FileItem[];
  multiple: boolean;
  handleDelete: (uid?: string) => void;
  isImage: boolean;
  isUploading: boolean;
}
export const UploadContext = createContext<UploadContextProps | undefined>(
  undefined,
);

export type UploadProviderProps = PropsWithChildren<{
  value?: LiteralExpression;
  inputType: ViewVariableType;
  availableFileTypes?: ViewVariableType[];
  onChange?: (value) => void;
  onBlur?: () => void;
}>;

export const UploadProvider = ({
  value,
  inputType,
  availableFileTypes,
  onChange,
  onBlur,
  children,
}: UploadProviderProps) => {
  const multiple = ViewVariableType.isArrayType(inputType);
  const accept = getAccept(inputType, availableFileTypes);

  const isImage = [
    ViewVariableType.Image,
    ViewVariableType.ArrayImage,
    ViewVariableType.Svg,
    ViewVariableType.ArraySvg,
  ].includes(inputType);

  const { upload, deleteFile, fileList, isUploading } = useUpload({
    initialValue: transformExpressionInputToFileList(value),
    fileType: isImage ? 'image' : 'object',
    multiple,
    accept,
  });

  const inputRef = useRef<HTMLInputElement>(null);

  const triggerUpload = () => {
    inputRef.current?.click();
  };

  const handleChange = usePersistCallback(() => {
    if (multiple) {
      const val = fileList.reduce(
        (prev, cur) => {
          const { url, name } = prev;
          if (cur.url) {
            url.push(cur.url);
            name.push(cur.name);
          }
          return {
            url,
            name,
          };
        },
        {
          url: [] as string[],
          name: [] as string[],
        },
      );
      onChange?.(val);
    } else {
      onChange?.(fileList[0]);
    }
    onBlur?.();
  });

  useUpdateEffect(() => {
    // After all uploads are completed, onchange will be triggered to avoid state loss after refreshing the canvas.
    if (!isUploading) {
      handleChange();
    }
  }, [isUploading, fileList]);

  return (
    <UploadContext.Provider
      value={{
        triggerUpload,
        fileList,
        multiple,
        handleDelete: deleteFile,
        isImage,
        isUploading,
      }}
    >
      {children}
      <input
        ref={inputRef}
        className="hidden"
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={e => {
          const { files } = e.target;
          Object.values(files || {}).forEach(file => {
            upload(file);
          });
        }}
      />
    </UploadContext.Provider>
  );
};

export const useUploadContext = () => {
  const context = useContext(UploadContext);

  return (context || {}) as UploadContextProps;
};
