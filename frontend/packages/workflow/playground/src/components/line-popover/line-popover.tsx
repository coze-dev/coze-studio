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

/* eslint-disable @typescript-eslint/no-explicit-any */

import classNames from 'classnames';
import { Popover } from '@coze-arch/bot-semi';
import { type IPoint } from '@flowgram-adapter/common';

import { LineErrorTip } from './line-error-tip';

const PADDING = 12;

export const LinePopover = (props: Record<string, any>) => {
  const { className, line, isHovered, ...other } = props;

  const { hasError, bezier, position } = line;

  const { bbox } = bezier;
  // relative position
  const toRelative = (p: IPoint) => ({
    x: p.x - bbox.x + PADDING,
    y: p.y - bbox.y + PADDING,
  });
  const fromPos = toRelative(position.from);
  const toPos = toRelative(position.to);

  const left = bbox.x + Math.abs((toPos.x - fromPos.x) / 2);
  const top = bbox.y + Math.abs((toPos.y - fromPos.y) / 2);

  return (
    <Popover
      className={classNames('p-4', className)}
      showArrow
      content={() => <LineErrorTip />}
      visible={isHovered && hasError}
      {...other}
    >
      {/* Tooltip anchor point, you need to calculate the center position of the line */}
      <div
        style={{
          left,
          top,
          position: 'absolute',
        }}
      ></div>
    </Popover>
  );
};
