import { createContext } from 'react';

export interface DragUploadTargetContextProps {
  isDragOver: boolean;
}

export const DragUploadTargetContext =
  createContext<DragUploadTargetContextProps>({
    isDragOver: false,
  });
