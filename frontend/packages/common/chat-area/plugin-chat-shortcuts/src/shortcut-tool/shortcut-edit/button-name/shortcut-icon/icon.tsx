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

import cls from 'classnames';
import { type FileInfo } from '@coze-arch/bot-api/playground_api';

import DefaultIcon from '../../../../assets/shortcut-icon-default.svg';

export interface ShortcutIconProps {
  icon?: FileInfo;
  className?: string;
  width?: number;
  height?: number;
}
const DEFAULT_ICON_SIZE = 28;

const DefaultIconInfo = {
  url: DefaultIcon,
};

export const Icon: FC<ShortcutIconProps> = props => {
  const { icon, width, height, className } = props;
  return (
    <div className="flex items-center">
      <img
        className={cls(
          'rounded-[6px] p-1 coz-mg-primary hover:coz-mg-secondary-hovered mr-1 cursor-pointer',
          className,
        )}
        style={{
          width: width ?? DEFAULT_ICON_SIZE,
          height: height ?? DEFAULT_ICON_SIZE,
        }}
        alt="icon"
        src={icon?.url || DefaultIconInfo.url}
      />
    </div>
  );
};
