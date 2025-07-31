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

import { useState, type FC } from 'react';

import classNames from 'classnames';
import { IconButton, Tooltip } from '@coze-arch/coze-design';

import { reportNavClick } from '../utils';
import { type LayoutButtonItem } from '../types';

export const GlobalLayoutActionBtn: FC<LayoutButtonItem> = ({
  icon,
  iconClass,
  onClick,
  tooltip,
  dataTestId,
  className,
  portal,
  renderButton,
}) => {
  const [visible, setVisible] = useState(false);

  const onButtonClick = () => {
    setVisible(false);
    reportNavClick(tooltip);
    onClick?.();
  };

  const btn = renderButton ? (
    renderButton({
      onClick: onButtonClick,
      icon,
      dataTestId,
    })
  ) : (
    <IconButton
      color="secondary"
      size="large"
      className={classNames(className, { '!h-full': !!iconClass })}
      icon={
        <div
          className={classNames(
            'text-[20px] coz-fg-primary h-[20px]',
            iconClass,
          )}
        >
          {icon}
        </div>
      }
      onClick={onButtonClick}
      data-testid={dataTestId}
    />
  );
  // If tooltip is empty, tooltip is not displayed
  return (
    <>
      {tooltip ? (
        <Tooltip
          content={tooltip}
          position="right"
          clickToHide
          visible={visible}
          onVisibleChange={setVisible}
        >
          {btn}
        </Tooltip>
      ) : (
        btn
      )}
      {portal}
    </>
  );
};
