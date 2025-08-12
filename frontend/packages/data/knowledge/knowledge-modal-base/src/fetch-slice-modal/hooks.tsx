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

import { useRequest } from 'ahooks';
import { useDataModalWithCoze } from '@coze-data/utils';
import { DataNamespace, dataReporter } from '@coze-data/reporter';
import { REPORT_EVENTS } from '@coze-arch/report-events';
import { I18n } from '@coze-arch/i18n';
import { type DocumentInfo } from '@coze-arch/bot-api/knowledge';
import { KnowledgeApi } from '@coze-arch/bot-api';

export interface IDeleteUnitModalProps {
  documentInfo: DocumentInfo;
  onfinish: () => void;
}

export const useFetchSliceModal = ({
  documentInfo,
  onfinish,
}: IDeleteUnitModalProps) => {
  const { loading, run } = useRequest(
    async () => {
      await KnowledgeApi.FetchWebUrl({
        document_ids: documentInfo.document_id
          ? [documentInfo.document_id]
          : [],
      });
    },
    {
      onSuccess: () => {
        // Toast.success(I18n.t('Update_success'));
        close();
        onfinish();
      },
      onError: error => {
        dataReporter.errorEvent(DataNamespace.KNOWLEDGE, {
          eventName: REPORT_EVENTS.KnowledgeFetchWebUrl,
          error,
        });
      },
      manual: true,
    },
  );
  const { modal, open, close } = useDataModalWithCoze({
    width: 320,
    title: I18n.t('knowledge_optimize_005'),
    cancelText: I18n.t('Cancel'),
    okText: I18n.t('knowledge_optimize_007'),
    okButtonColor: 'yellow',
    okButtonProps: {
      loading,
      type: 'warning',
    },
    onOk: () => {
      run();
    },
    onCancel: () => close(),
  });

  return {
    node: modal(
      <div className="coz-fg-secondary">
        {I18n.t('knowledge_optimize_006')}
      </div>,
    ),
    open,
    close,
  };
};
