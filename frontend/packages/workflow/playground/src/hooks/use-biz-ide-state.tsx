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
 * Global hook to manage the state of the Biz IDE and interact with React components
 */

import { create } from 'zustand';
import { I18n } from '@coze-arch/i18n';
import { Modal } from '@coze-arch/bot-semi';
import { IconWarningInfo } from '@coze-arch/bot-icons';

import { useSingletonInnerSideSheet } from '../components/workflow-inner-side-sheet';

// TODO: Change to UIModal

import styles from './use-biz-ide-state.module.less';

interface BizIDEState {
  /**
   * The currently enabled BizIDE unique identifier
   */
  uniqueId: string | null;
  /**
   * Is BizIDE currently turned on?
   */
  isBizIDEOpen: boolean;
  /**
   * Is the currently enabled BizIDE in the test run?
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
    // When passing in the id, it means to close the pop-up window of the specified id. When the id is inconsistent with the current nodeId, it means that it has been closed
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
      * Close Biz IDE
      * Check whether it is running, including the appearance of the confirm dialog box is also encapsulated here
      * You only need to call this hook externally.
      * In three cases it resolves true and closes BizIDE.
      *   1. BizIDE is not opened
          2. BizIDE is open, but not running
          3. BizIDE is running, but the user clicks confirm to confirm
      */
    closeBizIDE,
    /**
     * Force shutdown of Biz IDE, whether running or not
     */
    openBizIDE,
    forceCloseBizIDE,
    closeConfirm,
  };
};
