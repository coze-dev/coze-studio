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

import { type ComponentProps, type PropsWithChildren } from 'react';

import classNames from 'classnames';
import {
  useMessageBoxContext,
  useLatestSectionId,
} from '@coze-common/chat-area';
import { I18n } from '@coze-arch/i18n';
import { IconCozRefresh } from '@coze-arch/coze-design/icons';
import { IconButton, Tooltip } from '@coze-arch/coze-design';

import { getShowRegenerate } from '../../utils/get-show-regenerate';
import { useTooltipTrigger } from '../../hooks/use-tooltip-trigger';

type RegenerateMessageProps = Omit<
  ComponentProps<typeof IconButton>,
  'icon' | 'iconSize' | 'onClick'
>;

export const RegenerateMessage: React.FC<
  PropsWithChildren<RegenerateMessageProps>
> = ({ className, ...props }) => {
  const { message, meta, regenerateMessage } = useMessageBoxContext();
  const latestSectionId = useLatestSectionId();

  const trigger = useTooltipTrigger('hover');

  const showRegenerate = getShowRegenerate({ message, meta, latestSectionId });
  if (!showRegenerate) {
    return null;
  }

  return (
    <Tooltip trigger={trigger} content={I18n.t('message_tool_regenerate')}>
      <IconButton
        data-testid="chat-area.answer-action.regenerate-message-button"
        size="small"
        color="secondary"
        icon={
          <IconCozRefresh
            className={classNames(className, 'w-[14px] h-[14px]')}
          />
        }
        onClick={() => {
          regenerateMessage();
        }}
        {...props}
      />
    </Tooltip>
  );
};
