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

import { type FC, type ReactNode } from 'react';

import { Icon, Popover } from '@coze-arch/bot-semi';

import { ReactComponent as InfoSVG } from '../../../../assets/icon_info_outlined.svg';

import s from './index.module.less';

export const ColumnHeader: FC<{
  label: string;
  required: boolean;
  tips: ReactNode;
}> = p => {
  const { label, required, tips } = p;
  return (
    <div className={s['column-title']}>
      <span>{label}</span>
      {required ? <span style={{ color: 'red' }}>*</span> : null}
      <Popover showArrow position="top" content={<div>{tips}</div>}>
        <Icon
          svg={<InfoSVG />}
          className={s['table-header-label-tooltip-icon']}
        />
      </Popover>
    </div>
  );
};
