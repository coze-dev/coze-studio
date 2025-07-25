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
 
import React, { useState, useCallback, useEffect, useRef } from 'react';

import { I18n } from '@coze-arch/i18n';
import { Modal } from '@coze-arch/coze-design';
import {
  useIDEService,
  WindowService,
  ViewService,
  ModalService,
  ModalType,
  type CustomTitleType,
} from '@coze-project-ide/framework';

import styles from './styles.module.less';

export const CloseConfirmModal = () => {
  const modalService = useIDEService<ModalService>(ModalService);
  const windowService = useIDEService<WindowService>(WindowService);
  const viewService = useIDEService<ViewService>(ViewService);

  const currentTitlesRef = useRef<CustomTitleType[]>();

  const [visible, setVisible] = useState(false);
  const handleOk = useCallback(() => {
    (currentTitlesRef.current || []).forEach(title => {
      title?.owner?.close();
    });
    setVisible(false);
  }, []);
  const handleCancel = useCallback(() => {
    setVisible(false);
  }, []);

  useEffect(() => {
    // 浏览器维度的 dispose 监听
    const chromeDispose = windowService.onBeforeUnload(e => {
      // 路由判断
      const titles = viewService.getOpenTitles();
      const hasUnsaved = titles.some(title => title.saving);

      // 当存在未保存的项的时候，需要阻止
      if (hasUnsaved) {
        // 每次浏览器关闭之前都打开阻止关闭的弹窗
        // 兼容不同浏览器的行为
        e.preventDefault();
        e.stopPropagation();
        e.returnValue = '';
        return '';
      }
    });
    // 资源维度的 dispose 监听
    const resourceDisposable = modalService.onModalVisibleChange(opt => {
      const { type, options, visible: vis = true } = opt;
      if (type === ModalType.CLOSE_CONFIRM) {
        setVisible(Boolean(vis));
        currentTitlesRef.current = options;
      }
    });
    return () => {
      chromeDispose.dispose();
      resourceDisposable.dispose();
    };
  }, []);
  return (
    <Modal
      visible={visible}
      type="dialog"
      title={I18n.t('project_ide_unsaved_changes')}
      okText={I18n.t('project_ide_quit')}
      okButtonColor="red"
      cancelText={I18n.t('project_ide_cancel')}
      onOk={handleOk}
      onCancel={handleCancel}
      maskClosable={false}
    >
      <div className={styles.content}>
        {I18n.t('project_ide_unsaved_describe')}
      </div>
    </Modal>
  );
};
