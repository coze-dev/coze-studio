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
