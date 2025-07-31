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

import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { IconCozImage } from '@coze-arch/coze-design/icons';
import { Menu } from '@coze-arch/coze-design';

import { BaseUploadImage, type BaseUploadImageProps } from './base';

export const UploadImageMenu = (
  props: Omit<BaseUploadImageProps, 'renderUI'>,
) => (
  <BaseUploadImage
    {...props}
    renderUI={({ disabled }) => (
      <Menu.Item
        disabled={disabled}
        icon={
          <IconCozImage
            className={classNames('w-3.5 h-3.5', {
              'opacity-30': disabled,
            })}
          />
        }
        className={classNames('h-8 p-2 text-xs rounded-lg', {
          'cursor-not-allowed': disabled,
        })}
      >
        {I18n.t('knowledge_insert_img_002')}
      </Menu.Item>
    )}
  />
);
