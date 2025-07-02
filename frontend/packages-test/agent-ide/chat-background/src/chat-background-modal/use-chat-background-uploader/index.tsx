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
    // 需要标记消息已读的标记
    markRead();
    // close Modal
    setShow(false);
    // 存在正在生图的，扭转Badge状态
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
