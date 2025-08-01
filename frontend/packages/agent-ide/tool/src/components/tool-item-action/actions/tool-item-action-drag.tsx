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

import { type ComponentProps, type FC } from 'react';

import classNames from 'classnames';
import { IconCozHamburger } from '@coze-arch/coze-design/icons';

import { ToolItemAction } from '..';

type ToolItemActionEditProps = ComponentProps<typeof ToolItemAction> & {
  isDragging: boolean;
};

export const ToolItemActionDrag: FC<ToolItemActionEditProps> = props => {
  const { disabled, isDragging } = props;
  return (
    <ToolItemAction hoverStyle={false} {...props}>
      <IconCozHamburger
        className={classNames('text-sm', {
          'coz-fg-secondary': !disabled,
          'coz-fg-dim': disabled,
          'cursor-grab': !isDragging,
          'cursor-grabbing': isDragging,
        })}
      />
    </ToolItemAction>
  );
};
