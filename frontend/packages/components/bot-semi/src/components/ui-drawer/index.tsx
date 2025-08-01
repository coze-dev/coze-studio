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

import React, { PropsWithChildren, useEffect, useState } from 'react';

import classNames from 'classnames';

import s from './index.module.less';

interface UISheetProps {
  direction?: 'left' | 'right';
  open?: boolean;
}

export const UIDrawer: React.FC<PropsWithChildren<UISheetProps>> = ({
  direction,
  open,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    setIsOpen(open ?? false);
  }, [open]);

  return (
    <div className={s.wrapper}>
      <div
        className={classNames(
          s.panel,
          isOpen ? s.open : '',
          isOpen ? s[`open-${direction}`] : '',
        )}
      >
        <button onClick={() => setIsOpen(false)}>Collapse</button>
      </div>
    </div>
  );
};
