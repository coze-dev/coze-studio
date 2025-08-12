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

import type { ReactNode } from 'react';

import { IconCloseNoCycle } from '@coze-arch/bot-icons';

import s from './sidesheet-title.module.less';

interface SideSheetTitleProps {
  icon?: ReactNode;
  title?: ReactNode;
  action?: ReactNode;
  onClose?: () => void;
}

export function SideSheetTitle({
  icon = <IconCloseNoCycle />,
  title,
  action,
  onClose,
}: SideSheetTitleProps) {
  return (
    <div className={s.container}>
      {icon ? (
        <div className={s.icon} onClick={onClose}>
          {icon}
        </div>
      ) : null}
      <div className={s.title}>{title}</div>
      <div className={s.action}>{action}</div>
    </div>
  );
}
