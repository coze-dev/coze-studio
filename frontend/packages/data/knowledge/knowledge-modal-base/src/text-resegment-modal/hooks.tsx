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

import { useDataModalWithCoze } from '@coze-data/utils';
import { I18n } from '@coze-arch/i18n';
import { type ButtonColor } from '@coze-arch/coze-design/types';

import styles from './index.module.less';

export interface IResegmentModalProps {
  onOk: () => void;
}

export const useTextResegmentModal = ({ onOk }: IResegmentModalProps) => {
  const { modal, open, close } = useDataModalWithCoze({
    width: 320,
    title: I18n.t('datasets_segment_resegment'),
    className: styles['text-resegment-modal'],
    cancelText: I18n.t('Cancel'),
    okText: I18n.t('knowledge_optimize_007'),
    okButtonColor: 'yellow' as ButtonColor,
    okButtonProps: {
      type: 'warning',
    },
    onOk: () => {
      onOk();
    },
    onCancel: () => close(),
  });

  return {
    node: modal(
      <div className={styles['text-resegment-content']}>
        {I18n.t('kl2_004')}
      </div>,
    ),
    open,
    close,
  };
};
