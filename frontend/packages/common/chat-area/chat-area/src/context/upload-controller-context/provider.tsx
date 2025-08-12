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

import { type PropsWithChildren, useRef, useEffect } from 'react';

import { UploadController } from '../../service/upload-controller';
import {
  UploadControllerContext,
  type UploadControllerContextProps,
} from './context';

export const UploadControllerProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const uploadControllerMap = useRef<
    UploadControllerContextProps['uploadControllerMap']
  >({});
  const createControllerAndUpload: UploadControllerContextProps['createControllerAndUpload'] =
    param => {
      uploadControllerMap.current[param.fileId] = new UploadController(param);
    };
  const cancelUploadById: UploadControllerContextProps['cancelUploadById'] =
    id => {
      const controller = uploadControllerMap.current[id];
      if (!controller) {
        return;
      }
      controller.cancel();
      delete uploadControllerMap.current[id];
    };

  const clearAllSideEffect: UploadControllerContextProps['clearAllSideEffect'] =
    () => {
      Object.entries(uploadControllerMap.current).forEach(([, controller]) =>
        controller.cancel(),
      );
      uploadControllerMap.current = {};
    };

  useEffect(() => clearAllSideEffect, []);

  return (
    <UploadControllerContext.Provider
      value={{
        uploadControllerMap: uploadControllerMap.current,
        createControllerAndUpload,
        cancelUploadById,
        clearAllSideEffect,
      }}
    >
      {children}
    </UploadControllerContext.Provider>
  );
};
