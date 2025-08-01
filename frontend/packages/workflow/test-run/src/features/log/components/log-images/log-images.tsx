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

import { I18n } from '@coze-arch/i18n';
import { IconCozArrowBottom } from '@coze-arch/coze-design/icons';
import { Button } from '@coze-arch/coze-design';

import { LogWrap } from '../log-parser/log-wrap';
import { ImagesPreview } from './images-preview';

interface LogImagesProps {
  images: string[];
  onDownload?: () => void;
}

export const LogImages: React.FC<LogImagesProps> = ({ images, onDownload }) => {
  if (!images || !images.length) {
    return null;
  }

  return (
    <LogWrap
      labelStyle={{
        height: '24px',
      }}
      label={I18n.t('imageflow_output_display')}
      copyable={false}
      extra={
        <Button
          icon={<IconCozArrowBottom />}
          color="primary"
          type="primary"
          onClick={onDownload}
          size="small"
        >
          {I18n.t('imageflow_output_display_save')}
        </Button>
      }
    >
      <ImagesPreview images={images} />
    </LogWrap>
  );
};
