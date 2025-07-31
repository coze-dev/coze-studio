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
import { DotStatus } from '@coze-studio/bot-detail-store';
import { I18n } from '@coze-arch/i18n';
import {
  IconCozCheckMarkCircleFillPalette,
  IconCozLoading,
  IconCozWarningCircleFillPalette,
} from '@coze-arch/coze-design/icons';
import { Tooltip } from '@coze-arch/coze-design';

import s from './index.module.less';

export interface AvatarBackgroundNoticeDotProps {
  status: DotStatus;
}

export const AvatarBackgroundNoticeDot: React.FC<
  AvatarBackgroundNoticeDotProps
> = ({ status }) => {
  if (status === DotStatus.None || status === DotStatus.Cancel) {
    return null;
  }
  const dot = {
    [DotStatus.Generating]: (
      <Tooltip content={I18n.t('profilepicture_hover_generating')}>
        <IconCozLoading
          className={classNames(s.icon, s['icon-generating'])}
          spin={true}
        />
      </Tooltip>
    ),
    [DotStatus.Success]: (
      <Tooltip content={I18n.t('profilepicture_hover_generated')}>
        <IconCozCheckMarkCircleFillPalette
          className={classNames(s.icon, s['icon-success'])}
        />
      </Tooltip>
    ),
    [DotStatus.Fail]: (
      <Tooltip content={I18n.t('profilepicture_hover_failed')}>
        <IconCozWarningCircleFillPalette
          className={classNames(s.icon, s['icon-fail'])}
        />
      </Tooltip>
    ),
  };
  return (
    <div
      className={classNames(
        s.ctn,
        status === DotStatus.Generating ? s.loading : undefined,
      )}
    >
      {dot[status]}
    </div>
  );
};
