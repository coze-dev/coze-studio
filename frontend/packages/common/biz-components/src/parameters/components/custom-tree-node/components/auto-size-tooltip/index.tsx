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

import React, { type PropsWithChildren, useRef } from 'react';

import classNames from 'classnames';
import { type TooltipProps } from '@coze-arch/bot-semi/Tooltip';
import { Tooltip } from '@coze-arch/bot-semi';

import styles from './index.module.less';

type AutoSizeTooltipProps = PropsWithChildren<
  {
    className?: string;
    style?: React.CSSProperties;
    containerClassName?: string;
    containerStyle?: React.CSSProperties;
    tooltipClassName?: string;
    tooltipStyle?: React.CSSProperties;
  } & Omit<TooltipProps, 'className' | 'style'>
>;

export default function AutoSizeTooltip({
  children,
  className,
  style,
  tooltipClassName,
  tooltipStyle,
  containerClassName,
  containerStyle,
  ...rest
}: AutoSizeTooltipProps) {
  const nanoRef = useRef<HTMLDivElement | null>(null);
  const renderContent = () => (
    <>
      <div
        ref={nanoRef}
        className={classNames(styles.nano, containerClassName)}
        style={containerStyle}
      />
      <Tooltip
        {...rest}
        className={classNames(
          styles.tooltip,
          styles['top-level'],
          tooltipClassName,
        )}
        style={{ left: 0, ...tooltipStyle }}
      >
        {children}
      </Tooltip>
    </>
  );
  return (
    <div
      className={classNames(styles.popup_container, className)}
      style={style}
    >
      {renderContent()}
    </div>
  );
}
