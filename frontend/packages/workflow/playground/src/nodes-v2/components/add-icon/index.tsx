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

import { type FC } from 'react';

import { IconCozPlus } from '@coze-arch/coze-design/icons';
import { IconButton, Tooltip } from '@coze-arch/coze-design';

interface AddIconProps {
  disabledTooltip?: string;
  onClick?: (e) => void;
}

export const AddIcon: FC<AddIconProps> = ({ disabledTooltip, onClick }) =>
  disabledTooltip ? (
    <Tooltip content={disabledTooltip}>
      <IconButton
        disabled={!!disabledTooltip}
        color="highlight"
        size="small"
        icon={<IconCozPlus className="text-sm" />}
        onClick={onClick}
      />
    </Tooltip>
  ) : (
    <IconButton
      color="highlight"
      size="small"
      icon={<IconCozPlus className="text-sm" />}
      onClick={onClick}
    />
  );
