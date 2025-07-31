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

import React, { type ReactNode, useState } from 'react';

import { useShallow } from 'zustand/react/shallow';
import {
  DotStatus,
  useGenerateImageStore,
} from '@coze-studio/bot-detail-store';
import { I18n } from '@coze-arch/i18n';
import { UIModal } from '@coze-arch/bot-semi';
import { type BackgroundImageInfo } from '@coze-arch/bot-api/developer_api';
import { useBackgroundContent } from '@coze-agent-ide/chat-background-shared';
import { BackgroundConfigContent } from '@coze-agent-ide/chat-background-config-content-adapter';

import s from './index.module.less';
export interface UseChatBackgroundUploaderProps {
  onSuccess: (value: BackgroundImageInfo[]) => void;
  backgroundValue: BackgroundImageInfo[];
  getUserId: () => {
    userId: string;
  };
}
export interface UseChatBackgroundUploaderReturn {
  node: ReactNode;
  open: () => void;
}
export const useChatBackgroundUploader = (
  props: UseChatBackgroundUploaderProps,
): UseChatBackgroundUploaderReturn => {
  const [show, setShow] = useState(false);
  const { markRead } = useBackgroundContent();
  const { imageLoading, gifLoading, setGenerateBackgroundModalByImmer } =
    useGenerateImageStore(
      useShallow(state => ({
        imageLoading: state.generateBackGroundModal.image.loading,
        gifLoading: state.generateBackGroundModal.gif.loading,
        setGenerateBackgroundModalByImmer:
          state.setGenerateBackgroundModalByImmer,
      })),
    );

  const cancel = () => {
    // A token that needs to mark the message as read
    markRead();
    // close Modal
    setShow(false);
    // There is a Reverse Badge state in production
    if (gifLoading || imageLoading) {
      setGenerateBackgroundModalByImmer(state => {
        if (gifLoading) {
          state.gif.dotStatus = DotStatus.Generating;
        } else {
          state.image.dotStatus = DotStatus.Generating;
        }
      });
    }
  };

  return {
    node: show && (
      <UIModal
        type="action"
        title={I18n.t('bgi_title')}
        visible
        width={800}
        className={s['background-config-modal']}
        bodyStyle={{
          display: 'flex',
          flexDirection: 'column',
        }}
        centered
        footer={null}
        onCancel={cancel}
      >
        <BackgroundConfigContent {...props} cancel={cancel} />
      </UIModal>
    ),
    open: () => {
      setShow(true);
    },
  };
};
