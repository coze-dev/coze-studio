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

import { type ComponentProps, useState, type PropsWithChildren } from 'react';

import copy from 'copy-to-clipboard';
import classNames from 'classnames';
import { getReportError } from '@coze-common/chat-area-utils';
import {
  getIsTextMessage,
  useChatArea,
  useMessageBoxContext,
} from '@coze-common/chat-area';
import { I18n } from '@coze-arch/i18n';
import { IconCozCheckMark, IconCozCopy } from '@coze-arch/coze-design/icons';
import { IconButton, Toast, Tooltip } from '@coze-arch/coze-design';

import { ReportEventNames } from '../../report-events';
import { useTooltipTrigger } from '../../hooks/use-tooltip-trigger';

type CopyTextMessageProps = Omit<
  ComponentProps<typeof IconButton>,
  'icon' | 'iconSize' | 'onClick'
>;

export const CopyTextMessage: React.FC<
  PropsWithChildren<CopyTextMessageProps>
> = ({ className, ...props }) => {
  const { reporter } = useChatArea();
  const { message, meta } = useMessageBoxContext();

  const { content } = message;

  const [isCopySuccessful, setIsCopySuccessful] = useState<boolean>(false);
  const trigger = useTooltipTrigger('hover');

  // Unit s
  const COUNT_DOWN_TIME = 3;

  // The unit's is converted to a multiple of ms
  const TIMES = 1000;

  const handleCopy = () => {
    const resp = copy(content);
    if (resp) {
      // Copy successful
      setIsCopySuccessful(true);
      setTimeout(() => setIsCopySuccessful(false), COUNT_DOWN_TIME * TIMES);
      Toast.success({
        content: I18n.t('copy_success'),
        showClose: false,
        duration: COUNT_DOWN_TIME,
      });
      reporter.successEvent({
        eventName: ReportEventNames.CopyTextMessage,
      });
    } else {
      // Copy failed
      Toast.warning({
        content: I18n.t('copy_failed'),
        showClose: false,
        duration: COUNT_DOWN_TIME,
      });
      reporter.errorEvent({
        eventName: ReportEventNames.CopyTextMessage,
        ...getReportError('copy_text_message_error', 'copy_text_message_error'),
      });
    }
  };

  const isTextMessage = getIsTextMessage(message);

  if (!isTextMessage) {
    return null;
  }

  if (!meta.isGroupLastAnswerMessage) {
    return null;
  }

  const iconClassNames = classNames(className, 'w-[14px] h-[14px]');

  return (
    <Tooltip
      content={isCopySuccessful ? I18n.t('copied') : I18n.t('copy')}
      trigger={trigger}
    >
      <IconButton
        data-testid="chat-area.answer-action.copy-button"
        size="small"
        icon={
          isCopySuccessful ? (
            <IconCozCheckMark className={iconClassNames} />
          ) : (
            <IconCozCopy className={iconClassNames} />
          )
        }
        color="secondary"
        onClick={handleCopy}
        {...props}
      />
    </Tooltip>
  );
};
