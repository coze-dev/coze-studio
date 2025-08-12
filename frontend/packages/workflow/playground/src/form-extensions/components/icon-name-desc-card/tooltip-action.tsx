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

import { type MouseEventHandler, type FC, type ReactNode } from 'react';

import { Tooltip, IconButton } from '@coze-arch/coze-design';

export const TooltipAction: FC<{
  icon: ReactNode;
  tooltip: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  testID?: string;
}> = props => {
  const { icon, tooltip, onClick, testID } = props;
  return (
    <Tooltip content={tooltip} autoAdjustOverflow>
      <IconButton
        icon={icon}
        color="secondary"
        onClick={onClick}
        data-testid={testID}
      />
    </Tooltip>
  );
};
