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

import React from 'react';

import { I18n } from '@coze-arch/i18n';
import { Button, Typography } from '@coze-arch/coze-design';

import css from './upload-modal-footer.module.less';

interface UploadModalFooterProps {
  onReUpload: () => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export const UploadModalFooter: React.FC<UploadModalFooterProps> = ({
  onReUpload,
  onSubmit,
  onCancel,
}) => (
  <div className={css['modal-footer']}>
    <div className={css['modal-left']}>
      <Button color="primary" onClick={onReUpload}>
        {I18n.t('bgi_reupload')}
      </Button>
      <Typography.Text type="secondary" size="small">
        {I18n.t('bgi_adjust_tooltip_content')}
      </Typography.Text>
    </div>
    <div className={css['modal-right']}>
      <Button color="highlight" onClick={onCancel}>
        {I18n.t('Cancel')}
      </Button>
      <Button onClick={onSubmit}>{I18n.t('Confirm')}</Button>
    </div>
  </div>
);
