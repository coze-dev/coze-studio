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
 
/**
 * 全局hook，管理 Biz IDE 的状态，与 React 组件交互
 */

import { create } from 'zustand';
import { I18n } from '@coze-arch/i18n';
import { Modal } from '@coze-arch/bot-semi';
import { IconWarningInfo } from '@coze-arch/bot-icons';

import { useSingletonInnerSideSheet } from '../components/workflow-inner-side-sheet';

// TODO: 改成 UIModal

import styles from './use-biz-ide-state.module.less';

interface BizIDEState {
  /**
   * 当前开启的 BizIDE 唯一标识
   */
  uniqueId: string | null;
  /**
   * 当前是否有 BizIDE 开启
   */
  isBizIDEOpen: boolean;
  /**
   * 当前开启的 BizIDE 是否在 test 运行中
   */
  isBizIDETesting: boolean;
}

interface BizIDEStateStore extends BizIDEState {
  setUniqueId: (uniqueId: string) => void;
  setIsBizIDEOpen: (isBizIDEOpen: boolean) => void;
  setIsBizIDETesting: (isBizIDETesting: boolean) => void;
  setData: (data: Partial<BizIDEState>) => void;
}

const useBizIDEStateStore = create<BizIDEStateStore>(set => ({
  uniqueId: null,
  setUniqueId: uniqueId => set({ uniqueId }),
  isBizIDEOpen: false,
  setIsBizIDEOpen: isBizIDEOpen => set({ isBizIDEOpen }),
  isBizIDETesting: false,
  setIsBizIDETesting: isBizIDETesting => set({ isBizIDETesting }),
  setData: (data: Partial<BizIDEState>) => set(data),
}));

export const useBizIDEState = () => {
  const {
    uniqueId,
    isBizIDEOpen,
    isBizIDETesting,
    setUniqueId,
    setIsBizIDEOpen,
    setIsBizIDETesting,
    setData,
  } = useBizIDEStateStore(state => state);

  const {
    handleOpen: openSideSheet,
    handleClose: closeSideSheet,
    visible,
    forceClose,
  } = useSingletonInnerSideSheet(uniqueId || '');

  const openBizIDE = async id => {
    const opened = await openSideSheet(id);
    if (opened) {
      setUniqueId(id);
      setIsBizIDEOpen(true);
    }
  };

  const closeBizIDE = async () => {
    const closed = await closeSideSheet();
    if (closed) {
      setData({
        uniqueId: null,
        isBizIDEOpen: false,
        isBizIDETesting: false,
      });
    }
    return closed;
  };

  const closeConfirm = async (id?: string): Promise<boolean> => {
    // 当传入id时，表示关闭指定id的弹窗。当id和当前nodeId不一致时，说明已经关闭了
    if (id && id !== uniqueId) {
      return true;
    }

    if (!isBizIDEOpen || !isBizIDETesting) {
      return true;
    }

    return new Promise(resolve => {
      Modal.warning({
        icon: (
          <IconWarningInfo
            className={styles.warningIcon}
            style={{
              width: 22,
              height: 22,
            }}
          />
        ),
        title: I18n.t('workflow_detail_code_is_running'),
        content: I18n.t('workflow_detail_code_is_terminate_execution'),
        okType: 'warning',
        okText: I18n.t('Confirm'),
        cancelText: I18n.t('Cancel'),
        onOk: () => {
          setData({
            uniqueId: null,
            isBizIDEOpen: false,
            isBizIDETesting: false,
          });
          resolve(true);
        },
        onCancel: () => {
          resolve(false);
        },
      });
    });
  };

  const forceCloseBizIDE = () => {
    if (visible) {
      forceClose();
    }

    setData({
      uniqueId: null,
      isBizIDEOpen: false,
      isBizIDETesting: false,
    });
  };

  return {
    uniqueId,
    isBizIDEOpen,
    isBizIDETesting,
    setBizIDEUniqueId: setUniqueId,
    setIsBizIDEOpen,
    setIsBizIDETesting,
    /**
      * 关闭 Biz IDE
      * 检测是否正在运行中，包括 confirm 对话框的出现也封装在这里
      * 外部只需要调用这个 hook 即可
      * 在三种情况下会 resolve true，并关闭 BizIDE
      *   1. BizIDE 没有被打开
          2. BizIDE 被打开了，但是不在运行中
          3. BizIDE 在运行中，但是用户点击了 confirm 确认
      */
    closeBizIDE,
    /**
     * 强制关闭 Biz IDE，不管是否在运行中
     */
    openBizIDE,
    forceCloseBizIDE,
    closeConfirm,
  };
};
