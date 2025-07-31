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

import React, { useState, useRef } from 'react';

import { I18n } from '@coze-arch/i18n';
import { Modal } from '@coze-arch/coze-design';

import { useGlobalState, useDependencyEntity } from '@/hooks';

import styles from './index.module.less';

export const WorkflowRefreshModal = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [isLoading, setLoading] = useState(false);
  const workflowState = useGlobalState();
  const dependencyEntity = useDependencyEntity();

  const handleOk = () => {
    setLoading(true);
    dependencyEntity.refreshFunc?.();
    workflowState.updateConfig({
      savingError: false,
    });
    workflowState.getProjectApi()?.setWidgetUIState('normal');
    dependencyEntity.setRefreshModalVisible(false);
    setLoading(false);
  };

  return (
    <div ref={ref}>
      <Modal
        icon={null}
        title={I18n.t('pop_up_title_data_conflict', {}, '刷新重试')}
        okText={I18n.t('pop_up_button_refresh', {}, '刷新')}
        width={320}
        visible={dependencyEntity.refreshModalVisible}
        hasCancel={false}
        closable={false}
        onOk={handleOk}
        className={styles['refresh-modal-content']}
        closeOnEsc={false}
        confirmLoading={isLoading}
        getPopupContainer={() => ref?.current || document.body}
      >
        {I18n.t(
          'pop_up_description_data_conflict',
          {},
          '很抱歉，你所编辑的内容已经被其他用户修改过了。请刷新页面获取最新内容后再进行操作。',
        )}
      </Modal>
    </div>
  );
};
