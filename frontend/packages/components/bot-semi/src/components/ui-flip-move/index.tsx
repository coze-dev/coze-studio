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

import FlipMove from 'react-flip-move';
import React, { PropsWithChildren } from 'react';

export type UIHeaderProps = PropsWithChildren<{
  flipMoveProps?: FlipMove.FlipMoveProps;
}>;

const defaultAnimation: Record<string, FlipMove.AnimationProp> = {
  appear: 'fade',
  enter: {
    from: {
      transform: 'translateY(15px)',
      opacity: '0',
    },
    to: {
      transform: '',
    },
  },
  leave: {
    from: {
      transform: '',
    },
    to: {
      transform: 'translateY(15px)',
      opacity: '0',
    },
  },
};
export const UIFlipMove: React.FC<UIHeaderProps> = ({
  children,
  flipMoveProps,
}) => (
  <>
    <FlipMove
      duration={200}
      easing="ease-out"
      appearAnimation={defaultAnimation.appear}
      enterAnimation={defaultAnimation.enter}
      leaveAnimation={defaultAnimation.leave}
      {...flipMoveProps}
    >
      {children}
    </FlipMove>
  </>
);
