import { useRequest } from 'ahooks';
import { REPORT_EVENTS } from '@coze-arch/report-events';
import { I18n } from '@coze-arch/i18n';
import { KnowledgeApi } from '@coze-arch/bot-api';
import { useDataModalWithCoze } from '@coze-data/utils';
import { DataNamespace, dataReporter } from '@coze-data/reporter';

import {
  useBatchCheckboxDoc,
  type IBatchCheckboxDocProps,
} from '../batch-checkbox-doc';

import styles from './index.module.less';

export type TBatchFetchModalProps = IBatchCheckboxDocProps & {
  onfinish: () => void;
};

export const useBatchFetchModal = (props: TBatchFetchModalProps) => {
  const { documentList, onfinish } = props;
  const { node, checkedList, initCheckedList } = useBatchCheckboxDoc({
    documentList,
    disabled: true,
  });

  const { loading, run } = useRequest(
    async () => {
      await KnowledgeApi.FetchWebUrl({
        document_ids: checkedList,
      });
    },
    {
      onSuccess: () => {
        // Toast.success(I18n.t('Update_success'));
        close();
        onfinish();
        initCheckedList();
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
    title: I18n.t('knowledge_optimize_008'),
    centered: true,
    cancelText: I18n.t('Cancel'),
    okText: I18n.t('knowledge_optimize_007'),
    okButtonProps: {
      disabled: !checkedList.length,
      loading,
    },
    onOk: () => {
      run();
    },
    onCancel: () => {
      close();
      initCheckedList();
    },
  });
  return {
    node: modal(
      <div className={styles['batch-fetch']}>
        <div className={styles['batch-fetch-title']}>
          {I18n.t('knowledge_optimize_009')}
        </div>
        <div className={styles['batch-fetch-content']}>{node}</div>
      </div>,
    ),
    open,
    close,
  };
};
