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

import { I18n } from '@coze-arch/i18n';
import { IconCozEdit, IconCozTrashCan } from '@coze-arch/coze-design/icons';
import { Typography, CozAvatar, IconButton } from '@coze-arch/coze-design';
import { type BackgroundImageInfo } from '@coze-arch/bot-api/workflow_api';

import { BackgroundModal } from './background-upload';

import css from './role-background.module.less';

interface RoleBackgroundProps {
  value?: BackgroundImageInfo;
  disabled?: boolean;
  onChange: (v: BackgroundImageInfo) => void;
}

export const RoleBackground: React.FC<RoleBackgroundProps> = ({
  value,
  disabled,
  onChange,
}) => {
  const [visible, setVisible] = useState(false);
  const url = value?.web_background_image?.origin_image_url;

  return (
    <div>
      <Typography.Text size="small" type="secondary">
        {I18n.t('bgi_desc')}
      </Typography.Text>

      {url ? (
        <div className={css['bg-block']}>
          <CozAvatar src={url} type="platform" />
          <div className={css['op-btns']}>
            <IconButton
              icon={<IconCozEdit />}
              color="secondary"
              size="small"
              disabled={disabled}
              onClick={() => setVisible(true)}
            />
            <IconButton
              icon={<IconCozTrashCan />}
              color="secondary"
              size="small"
              disabled={disabled}
              onClick={() => onChange({})}
            />
          </div>
          <BackgroundModal
            visible={visible}
            value={value}
            onCancel={() => setVisible(false)}
            onChange={onChange}
          />
        </div>
      ) : null}
    </div>
  );
};
