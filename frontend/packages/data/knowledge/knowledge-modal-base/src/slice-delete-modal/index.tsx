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

export interface IDeleteModalProps {
  onDel: () => void | Promise<void>;
}

export const useSliceDeleteModal = ({ onDel }: IDeleteModalProps) => {
  const { modal, open, close } = useDataModalWithCoze({
    title: I18n.t('delete_title'),
    cancelText: I18n.t('Cancel'),
    okText: I18n.t('Delete'),
    showCloseIcon: false,
    okButtonColor: 'red' as ButtonColor,
    okButtonProps: {
      type: 'danger',
    },
    onOk: async () => {
      await onDel?.();
      close?.();
    },
    onCancel: () => close(),
  });

  return {
    node: modal(
      <div className={'coz-fg-secondary'}>{I18n.t('delete_desc')}</div>,
    ),
    delete: open,
    close,
  };
};
