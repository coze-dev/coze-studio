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

import { type FC } from 'react';

import { I18n } from '@coze-arch/i18n';
import { IconCozUpload } from '@coze-arch/coze-design/icons';
import { Button } from '@coze-arch/coze-design';
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
