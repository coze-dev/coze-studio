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

import { useBotDetailIsReadonly } from '@coze-studio/bot-detail-store';
import { IconButton } from '@coze-arch/coze-design';
import { IconAuto } from '@coze-arch/bot-icons';

import { ToolTooltip } from '../tool-tooltip';
import { type ToolButtonCommonProps } from '../../typings/button';

interface AutoGenerateButtonProps extends ToolButtonCommonProps {
  enableAutoHidden?: boolean;
}

export const AutoGenerateButton: FC<AutoGenerateButtonProps> = ({
  onClick,
  tooltips,
  loading,
  disabled,
  enableAutoHidden,
  ...restProps
}) => {
  const readonly = useBotDetailIsReadonly();

  if (readonly && enableAutoHidden) {
    return null;
  }

  return (
    <ToolTooltip content={tooltips}>
      <IconButton
        icon={<IconAuto />}
        loading={loading}
        disabled={!!disabled}
        onClick={onClick}
        size="small"
        color="secondary"
        data-testid={restProps['data-testid']}
      />
    </ToolTooltip>
  );
};
