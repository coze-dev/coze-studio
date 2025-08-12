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

import { useState } from 'react';

import cls from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { IconCozUpload, IconCozInfoCircle } from '@coze-arch/coze-design/icons';
import { Typography, Tooltip, Button } from '@coze-arch/coze-design';

import img from './image.png';

import css from './drag-upload-content.module.less';

interface BaseDragUploadContentProps {
  onUpload?: () => void;
}

const BaseDragUploadContent: React.FC<BaseDragUploadContentProps> = ({
  onUpload,
}) => (
  <div className={css['base-upload-content']}>
    <IconCozUpload className={css['upload-icon']} />
    <div className={css['upload-title']}>
      {I18n.t('upload_image_guide')}
      <Tooltip
        content={
          <div className={css['upload-tooltip']}>
            <Typography.Text>
              {I18n.t('bgi_upload_image_format_requirement_title')}
            </Typography.Text>
            <br />
            <Typography.Text size="small" type="secondary">
              {I18n.t('bgi_upload_image_format_requirement')}
            </Typography.Text>
            <br />
            <img src={img} />
          </div>
        }
      >
        <IconCozInfoCircle className={css['tooltip-icon']} />
      </Tooltip>
    </div>
    <Typography.Text
      size="small"
      type="secondary"
      className={css['upload-desc']}
    >
      {I18n.t('upload_image_format_requirement')}
    </Typography.Text>
    <Button onClick={onUpload} color="primary">
      {I18n.t('upload_image')}
    </Button>
  </div>
);

export const FullDragUploadContent = () => (
  <div className={css['full-upload-content']}>
    <BaseDragUploadContent />
  </div>
);

interface DragUploadContentProps {
  onUpload: () => void;
}

export const DragUploadContent: React.FC<DragUploadContentProps> = ({
  onUpload,
}) => {
  const [dragIn, setDragIn] = useState(false);

  return (
    <div
      className={cls(css['normal-upload-content'], {
        [css.dragging]: dragIn,
      })}
      onClick={e => e.stopPropagation()}
      onDragEnter={() => {
        setDragIn(true);
      }}
      onDragLeave={() => {
        setDragIn(false);
      }}
    >
      <BaseDragUploadContent onUpload={onUpload} />
    </div>
  );
};
