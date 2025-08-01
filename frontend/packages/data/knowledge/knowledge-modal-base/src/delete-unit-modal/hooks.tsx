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

import classNames from 'classnames';
import { useRequest } from 'ahooks';
import { useDataModalWithCoze } from '@coze-data/utils';
import { DataNamespace, dataReporter } from '@coze-data/reporter';
import { REPORT_EVENTS } from '@coze-arch/report-events';
import { I18n } from '@coze-arch/i18n';
import { type ButtonColor } from '@coze-arch/coze-design/types';
import { Toast } from '@coze-arch/coze-design';
import { CustomError } from '@coze-arch/bot-error';
import { KnowledgeApi } from '@coze-arch/bot-api';

import { DATA_REFACTOR_CLASS_NAME } from '../constant';

export interface IDeleteUnitModalProps {
  docId?: string;
  onDel?: () => void;
}

export const useDeleteUnitModal = ({ docId, onDel }: IDeleteUnitModalProps) => {
  const { run, loading } = useRequest(
    () => {
      if (!docId) {
        throw new CustomError(
          REPORT_EVENTS.KnowledgeDeleteDocument,
          `${REPORT_EVENTS.KnowledgeDeleteDocument}: missing doc_id`,
        );
      }
      return KnowledgeApi.DeleteDocument({
        document_ids: [docId],
      });
    },
    {
      onSuccess: () => {
        close?.();
        onDel?.();
      },
      onError: error => {
        dataReporter.errorEvent(DataNamespace.KNOWLEDGE, {
          eventName: REPORT_EVENTS.KnowledgeDeleteDocument,
          error,
        });
        Toast.error({
          content: 'update fail',
          showClose: false,
        });
      },
      manual: true,
    },
  );

  const { modal, open, close } = useDataModalWithCoze({
    width: 320,
    title: I18n.t('kl2_007'),
    cancelText: I18n.t('Cancel'),
    okText: I18n.t('Delete'),
    showCloseIcon: false,
    okButtonColor: 'red' as ButtonColor,
    okButtonProps: {
      loading,
      type: 'danger',
    },
    onOk: () => {
      run();
    },
    onCancel: () => close(),
  });

  return {
    node: modal(
      <div className={classNames('coz-fg-secondary', DATA_REFACTOR_CLASS_NAME)}>
        {I18n.t('dataset_detail_table_deleteModel_description')}
      </div>,
    ),
    delete: open,
    close,
  };
};
