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

import { createContext } from 'react';

import {
  type UploadControllerProps,
  type UploadController,
} from '../../service/upload-controller';

export interface UploadControllerContextProps {
  uploadControllerMap: Record<string, UploadController>;
  createControllerAndUpload: (param: UploadControllerProps) => void;
  cancelUploadById: (id: string) => void;
  clearAllSideEffect: () => void;
}

export const UploadControllerContext =
  createContext<UploadControllerContextProps>({
    uploadControllerMap: {},
    createControllerAndUpload: () => void 0,
    cancelUploadById: () => void 0,
    clearAllSideEffect: () => void 0,
  });
