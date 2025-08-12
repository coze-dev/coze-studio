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

import { type PropsWithChildren, memo } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { isEqual } from 'lodash-es';
import classNames from 'classnames';
import { UIKitTooltip } from '@coze-common/chat-uikit';
import { Checkbox } from '@coze-arch/bot-semi';

import { WaitGenerating } from '../../wait-generating';
import { type ComponentTypesMap } from '../../types';
import { SuggestionInChat } from '../../suggestion';
import { ContextDividerWithOnboarding } from '../../context-divider-with-onboarding';
import { isMessageGroupEqual } from '../../../utils/message-group/message-group';
import { findMessageById } from '../../../utils/message';
import { localLog } from '../../../utils/local-log';
import { type MessageGroup } from '../../../store/types';
import { useShowBackGround } from '../../../hooks/public/use-show-bgackground';
import { useDeleteMessageGroup } from '../../../hooks/messages/use-delete-message-group';
import { useChatAreaCustomComponent } from '../../../hooks/context/use-chat-area-custom-component';
import { useChatAreaStoreSet } from '../../../hooks/context/use-chat-area-context';
import { usePreference } from '../../../context/preference';

import s from './index.module.less';

import './index.less';

const BuiltinMessageGroupWrapper: ComponentTypesMap['messageGroupWrapper'] = ({
  children,
  replyId,
  messageGroup,
}) => {
  const { selectable: isSelectModeEnabled } = usePreference();

  const { useSelectionStore } = useChatAreaStoreSet();

  const { addReplyId, removeReplyId, isChecked } = useSelectionStore(
    useShallow(state => ({
      addReplyId: state.addReplyId,
      removeReplyId: state.removeReplyId,
      isChecked: state.selectedReplyIdList.some(id => id === replyId),
    })),
  );

  const handleCheckboxChange = (e: { target: { checked?: boolean } }) => {
    if (!replyId) {
      return;
    }

    if (e.target.checked) {
      addReplyId(replyId);
    } else {
      removeReplyId(replyId);
    }
  };

  const selectable = messageGroup?.selectable ?? true;

  const { messageWidth } = usePreference();
  const showBackground = useShowBackGround();

  localLog('render BuiltinMessageGroupWrapper', replyId);

  return (
    <div className={classNames(s.wrapper, 'message-group-wrapper')}>
      <div
        className={classNames(s.border, {
          [s['background-mode-checkbox'] as string]: showBackground,
        })}
        style={{ width: messageWidth }}
      >
        {isSelectModeEnabled ? (
          <div className={s.checkbox}>
            <UIKitTooltip content={messageGroup?.unSelectableTips}>
              <Checkbox
                className="chat-package-message-group-wrap-checkbox"
                onChange={handleCheckboxChange}
                disabled={!selectable}
                checked={isChecked}
              ></Checkbox>
            </UIKitTooltip>
          </div>
        ) : null}
        <div className={s.content}>{children}</div>
      </div>
    </div>
  );
};

export const MessageGroupWrapper: React.FC<
  PropsWithChildren<{ messageGroup: MessageGroup }>
> = memo(
  ({ messageGroup, children }) => {
    const componentTypesMap = useChatAreaCustomComponent();
    const { useMessageMetaStore } = useChatAreaStoreSet();
    const { messageGroupWrapper } = componentTypesMap;
    const Wrapper = messageGroupWrapper || BuiltinMessageGroupWrapper;

    const {
      memberSet: { userMessageId },
      groupId,
      showContextDivider,
      isLatest,
    } = messageGroup;

    const userMessageMeta = useMessageMetaStore(state => {
      if (!userMessageId) {
        return;
      }
      return findMessageById(state.metaList, userMessageId);
    }, isEqual);

    // TODO: Current server level does not support interrupting local messages. Sending messages cannot be deleted. This status needs to be flagged
    const isSendingMessage = Boolean(userMessageMeta?.isSending);

    const deleteMessageGroup = useDeleteMessageGroup();

    const { showClearContextDivider: showClearContextDividerByPreference } =
      usePreference();

    const showContextDividerWithOnboarding =
      showClearContextDividerByPreference && showContextDivider;

    return (
      <>
        {showContextDividerWithOnboarding ? (
          <ContextDividerWithOnboarding
            isLatest={isLatest}
            showOnboarding={showContextDivider === 'with-onboarding'}
          />
        ) : null}
        <Wrapper
          replyId={
            userMessageMeta?.isSending ? undefined : messageGroup.groupId
          }
          deleteMessageGroup={() => deleteMessageGroup(groupId)}
          isSendingMessage={isSendingMessage}
          messageGroup={messageGroup}
        >
          {isLatest ? (
            <>
              {!showContextDividerWithOnboarding && <SuggestionInChat />}
              <WaitGenerating />
            </>
          ) : null}
          {children}
        </Wrapper>
      </>
    );
  },
  (prev, current) =>
    isMessageGroupEqual(prev.messageGroup, current.messageGroup),
);

MessageGroupWrapper.displayName = 'ChatAreaMessageGroupWrapper';
BuiltinMessageGroupWrapper.displayName = 'ChatAreaBuiltinMessageGroupWrapper';
