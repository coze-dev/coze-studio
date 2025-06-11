import { useContext } from 'react';

import { UploadControllerContext } from './context';

export const useUploadController = () => useContext(UploadControllerContext);
