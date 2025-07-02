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
