import { connect, mapProps } from '@formily/react';

import { FileUpload as FileUploadAdapter } from '../../file-upload';

export const FileUpload = connect(
  FileUploadAdapter,
  mapProps({ validateStatus: true }),
);
