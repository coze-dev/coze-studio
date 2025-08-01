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

import React, { useEffect } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { userStoreService } from '@coze-studio/user-store';
import { SkillKeyEnum } from '@coze-agent-ide/tool-config';
import {
  AddButton,
  ToolContentBlock,
  useToolValidData,
  type ToolEntryCommonProps,
} from '@coze-agent-ide/tool';
import { I18n } from '@coze-arch/i18n';
import { OpenBlockEvent, emitEvent } from '@coze-arch/bot-utils';
import { useBotSkillStore } from '@coze-studio/bot-detail-store/bot-skill';
import { useBotDetailIsReadonly } from '@coze-studio/bot-detail-store';
import { useDefaultExPandCheck } from '@coze-arch/bot-hooks';
import { useBackgroundContent } from '@coze-agent-ide/chat-background-shared';
import { type UseChatBackgroundUploaderProps } from '@coze-agent-ide/chat-background';
import {
  useChatBackgroundUploader,
  ChatBackGroundContent,
} from '@coze-agent-ide/chat-background';

type ITextToSpeechProps = ToolEntryCommonProps;
export const ChatBackground: React.FC<ITextToSpeechProps> = ({ title }) => {
  const setToolValidData = useToolValidData();

  const { backgroundImageInfoList, setBackgroundImageInfoList } =
    useBotSkillStore(
      useShallow($store => ({
        backgroundImageInfoList: $store.backgroundImageInfoList,
        setBackgroundImageInfoList: $store.setBackgroundImageInfoList,
      })),
    );

  const isReadonly = useBotDetailIsReadonly();

  const { showDot } = useBackgroundContent();

  const hasBackGroundImage = Boolean(
    backgroundImageInfoList?.[0]?.web_background_image?.origin_image_url,
  );

  const defaultExpand = useDefaultExPandCheck({
    blockKey: SkillKeyEnum.BACKGROUND_IMAGE_BLOCK,
    configured: hasBackGroundImage || showDot, // No picture, there is a status in progress, and the background cover module is not allowed to be hidden.
  });

  const userInfo = userStoreService.useUserInfo();
  const getUserId: UseChatBackgroundUploaderProps['getUserId'] = () => ({
    userId: userInfo?.user_id_str ?? '',
  });

  const { node, open } = useChatBackgroundUploader({
    getUserId,
    onSuccess: value => {
      setBackgroundImageInfoList(value);
      emitEvent(OpenBlockEvent.BACKGROUND_IMAGE_BLOCK);
    },
    backgroundValue: backgroundImageInfoList,
  });

  useEffect(() => {
    setToolValidData(hasBackGroundImage);
  }, [hasBackGroundImage]);

  return (
    <>
      <ToolContentBlock
        showBottomBorder
        tooltipType={'tooltip'}
        header={title}
        defaultExpand={defaultExpand}
        actionButton={
          <>
            <AddButton
              tooltips={
                hasBackGroundImage ? I18n.t('bgi_already_set') : undefined
              }
              onClick={() => {
                open();
              }}
              disabled={hasBackGroundImage}
              enableAutoHidden={true}
              data-testid="bot.editor.tool.background.add-button"
            />
          </>
        }
      >
        <ChatBackGroundContent
          isReadOnly={isReadonly}
          backgroundImageInfoList={backgroundImageInfoList}
          openConfig={open}
          setBackgroundImageInfoList={setBackgroundImageInfoList}
        />
      </ToolContentBlock>
      {node}
    </>
  );
};
