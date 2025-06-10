import { type FC } from 'react';

import { I18n } from '@coze-arch/i18n';
import { IconCozUpload } from '@coze/coze-design/icons';
import { Button } from '@coze/coze-design';
export interface FileUploadBtnProps {
  isImage?: boolean;
}
export const FileUploadBtn: FC<FileUploadBtnProps> = ({ isImage }) => (
  <Button
    className="coz-fg-primary font-normal h-[20px]"
    color="primary"
    size="small"
    icon={<IconCozUpload />}
    style={{ width: '100%', height: '20px', borderRadius: 'var(--coze-4)' }}
  >
    {isImage
      ? I18n.t('imageflow_input_upload_placeholder')
      : I18n.t('plugin_file_upload')}
  </Button>
);
