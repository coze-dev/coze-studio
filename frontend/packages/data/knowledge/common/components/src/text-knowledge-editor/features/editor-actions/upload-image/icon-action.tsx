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

import { IconCozImage } from '@coze-arch/coze-design/icons';
import { IconButton } from '@coze-arch/coze-design';

import { BaseUploadImage, type BaseUploadImageProps } from './base';

export const UploadImageIcon = (
  props: Omit<BaseUploadImageProps, 'renderUI'>,
) => (
  <BaseUploadImage
    {...props}
    renderUI={({ disabled }) => (
      <IconButton
        disabled={disabled}
        size="small"
        color="secondary"
        iconPosition="left"
        className="coz-fg-secondary leading-none !w-6 !h-6"
        icon={<IconCozImage className="text-[14px]" />}
      />
    )}
  />
);
