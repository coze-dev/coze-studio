import { type PropsWithChildren } from 'react';

import {
  DragUploadTargetContext,
  type DragUploadTargetContextProps,
} from './context';

export const DragUploadContextProvider: React.FC<
  PropsWithChildren<DragUploadTargetContextProps>
> = ({ children, ...props }) => (
  <DragUploadTargetContext.Provider value={props}>
    {children}
  </DragUploadTargetContext.Provider>
);

DragUploadContextProvider.displayName = 'ChatAreaDragUploadContextProvider';
