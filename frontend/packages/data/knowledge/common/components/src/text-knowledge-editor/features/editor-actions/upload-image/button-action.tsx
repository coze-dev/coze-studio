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
import { IconCozImage } from '@coze-arch/coze-design/icons';
import { Button } from '@coze-arch/coze-design';

import { BaseUploadImage, type BaseUploadImageProps } from './base';

export const UploadImageButton = (
  props: Omit<BaseUploadImageProps, 'renderUI'>,
) => (
  <BaseUploadImage
    {...props}
    renderUI={({ disabled }) => (
      <Button
        disabled={disabled}
        color="primary"
        className="coz-fg-primary leading-none"
        icon={<IconCozImage className="text-[14px]" />}
      >
        {I18n.t('knowledge_insert_img_002')}
      </Button>
    )}
  />
);
