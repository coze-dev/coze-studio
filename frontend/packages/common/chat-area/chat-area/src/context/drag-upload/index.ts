import { useContext } from 'react';

import { DragUploadTargetContext } from './context';

export const useDragUploadContext = () => useContext(DragUploadTargetContext);
