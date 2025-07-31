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

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import {
  ModalService,
  ModalType,
  useIDEService,
} from '@coze-project-ide/framework';
import { I18n } from '@coze-arch/i18n';
import { IconCozWarningCircleFillPalette } from '@coze-arch/coze-design/icons';
import { Modal } from '@coze-arch/coze-design';
import { ResourceCopyScene } from '@coze-arch/bot-api/plugin_develop';

import { LoopContent } from './loop-content';

import styles from './styles.module.less';

export const ResourceModal = () => {
  const [visible, setVisible] = useState(false);
  const [scene, setScene] = useState<ResourceCopyScene | undefined>(undefined);
  const [error, setError] = useState<boolean | string>(false);
  const [resourceName, setResourceName] = useState('');

  const modalService = useIDEService<ModalService>(ModalService);

  const handleCancel = useCallback(() => {
    modalService.onCloseResourceModal();
  }, []);

  const handleOk = useCallback(() => {
    if (error) {
      modalService.retry();
    }
  }, [error]);

  const title = useMemo(() => {
    switch (scene) {
      case ResourceCopyScene.CopyResourceFromLibrary:
        return I18n.t(
          'resource_process_modal_title_import_resource_from_library',
        );
      case ResourceCopyScene.MoveResourceToLibrary:
        return I18n.t('resource_process_modal_title_move_resource_to_library');
      case ResourceCopyScene.CopyResourceToLibrary:
        return I18n.t('resource_process_modal_title_copy_resource_to_library');
      case ResourceCopyScene.CopyProjectResource:
        return I18n.t('workflow_add_list_copy');
      default:
        return '';
    }
  }, [scene]);

  const errorContent = useMemo(() => {
    if (typeof error === 'string' && error !== 'no_task_id') {
      return error;
    }
    switch (scene) {
      case ResourceCopyScene.CopyResourceFromLibrary:
        return I18n.t('resource_toast_copy_to_project_fail');
      case ResourceCopyScene.MoveResourceToLibrary:
        return I18n.t('resource_toast_move_to_library_fail');
      case ResourceCopyScene.CopyResourceToLibrary:
        return I18n.t('resource_toast_copy_to_library_fail');
      case ResourceCopyScene.CopyProjectResource:
        return I18n.t('project_toast_copy_failed');
      default:
        return '';
    }
  }, [scene, error]);

  const content = useMemo(() => {
    if (error) {
      return (
        <div className={styles['error-container']}>
          <IconCozWarningCircleFillPalette
            className="coz-fg-hglt-red"
            fontSize={22}
          />
          {errorContent}
        </div>
      );
    }
    return <LoopContent scene={scene} resourceName={resourceName} />;
  }, [error, errorContent, resourceName, scene]);

  const okText = useMemo(() => {
    // Retry is not supported in the open-source environment.
    if (IS_OPEN_SOURCE) {
      return '';
    }
    if (typeof error === 'string') {
      return '';
    } else if (error) {
      return I18n.t('resource_process_modal_retry_button');
    }
    return '';
  }, [error]);

  useEffect(() => {
    const resourceDisposable = modalService.onModalVisibleChange(
      ({
        type,
        visible: vis = true,
        scene: _scene,
        resourceName: _resourceName,
      }) => {
        if (type === ModalType.RESOURCE) {
          setVisible(Boolean(vis));
          setScene(_scene);
          setResourceName(_resourceName || '');
          setError(false);
        }
      },
    );
    const resourceErrorDisposable = modalService.onError(isError => {
      setError(isError);
    });
    return () => {
      resourceDisposable.dispose();
      resourceErrorDisposable.dispose();
    };
  }, []);

  const cancelText = useMemo(() => {
    // Cancel logic changes in the open-source environment.
    if (IS_OPEN_SOURCE) {
      return error ? I18n.t('resource_process_modal_cancel_button') : undefined;
    }
    return I18n.t('resource_process_modal_cancel_button');
  }, [error]);

  return (
    <Modal
      visible={visible}
      width={384}
      type="dialog"
      title={title}
      okText={okText}
      onOk={handleOk}
      cancelText={cancelText}
      onCancel={handleCancel}
      maskClosable={false}
    >
      <div className={styles.content}>{content}</div>
    </Modal>
  );
};
