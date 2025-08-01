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

import React, {
  type PropsWithChildren,
  type ReactElement,
  useMemo,
} from 'react';

import { nanoid } from 'nanoid';
import classNames from 'classnames';

import s from './index.module.less';

export const PopupContainer: React.FC<
  PropsWithChildren<{
    className?: string;
    containerName?: string;
    containerClassName?: string;
    containerStyle?: React.CSSProperties;
  }>
> = ({
  className,
  children,
  containerName,
  containerClassName,
  containerStyle,
}) => {
  const _nanoid = useMemo(
    () => `${containerName || 'popup_container'}_${nanoid()}`,
    [containerName],
  );
  const _children = React.cloneElement(children as unknown as ReactElement, {
    getPopupContainer: () => document.getElementById(_nanoid) as HTMLElement,
  });
  return (
    <div className={classNames(s['popup-container'], className)}>
      {_children}
      <div
        id={_nanoid}
        style={containerStyle}
        className={classNames([
          'nowheel',
          s['popup-container-id'],
          containerClassName,
        ])}
      ></div>
    </div>
  );
};

export default PopupContainer;
