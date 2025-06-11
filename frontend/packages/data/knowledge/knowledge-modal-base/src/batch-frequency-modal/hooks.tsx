import { useMemo, useState } from 'react';

import { useRequest } from 'ahooks';
import {
  getUpdateIntervalOptions,
  isFeishuOrLarkDocumentSource,
  useDataModalWithCoze,
} from '@coze-data/utils';
import { DataNamespace, dataReporter } from '@coze-data/reporter';
import { KnowledgeE2e } from '@coze-data/e2e';
import { REPORT_EVENTS } from '@coze-arch/report-events';
import { I18n } from '@coze-arch/i18n';
import { DocumentSource, UpdateType } from '@coze-arch/bot-api/knowledge';
import { KnowledgeApi } from '@coze-arch/bot-api';
import { Select, Toast } from '@coze/coze-design';

import {
  useBatchCheckboxDoc,
  type IBatchCheckboxDocProps,
} from '../batch-checkbox-doc';

import styles from './index.module.less';

export type TBatchFrequencyModalProps = IBatchCheckboxDocProps & {
  onfinish: () => void;
};

export const useBatchFrequencyModal = (props: TBatchFrequencyModalProps) => {
  const { documentList, onfinish } = props;
  const [updateInterval, setUpdateInterval] = useState<number>(0);

  const documents = useMemo(
    () =>
      documentList?.filter(
        item =>
          [
            DocumentSource.Web,
            DocumentSource.FrontCrawl,
            // DocumentSource.ThirdParty,
          ].includes(item?.source_type as DocumentSource) ||
          isFeishuOrLarkDocumentSource(item?.source_type),
      ),
    [documentList],
  );

  const { node, checkedList, initCheckedList } = useBatchCheckboxDoc({
    documentList: documents,
    showTag: true,
  });

  const { loading, run } = useRequest(
    async () => {
      await KnowledgeApi.BatchUpdateDocument({
        document_ids: checkedList,
        update_rule: {
          update_type: updateInterval ? UpdateType.Cover : UpdateType.NoUpdate,
          update_interval: updateInterval,
        },
      });
    },
    {
      onSuccess: () => {
        Toast.success(I18n.t('Update_success'));
        close();
        onfinish();
        initModalData();
      },
      onError: error => {
        dataReporter.errorEvent(DataNamespace.KNOWLEDGE, {
          eventName: REPORT_EVENTS.KnowledgeBatchUpdateDocument,
          error,
        });
      },
      manual: true,
    },
  );
  const initModalData = () => {
    setUpdateInterval(0);
    initCheckedList();
  };

  const { modal, open, close } = useDataModalWithCoze({
    className: styles['batch-update-frequency-modal'],
    title: I18n.t('knowledge_optimize_014'),
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
      initModalData();
    },
  });
  return {
    node: modal(
      <div className={styles['batch-update-frequency']}>
        <div className={styles['batch-update-frequency-title']}>
          {I18n.t('knowledge_optimize_015')}
        </div>
        <div className={styles['batch-update-frequency-content']}>
          <div className={styles['batch-update-frequency-content-select']}>
            <div
              className={styles['batch-update-frequency-content-select-label']}
            >
              {I18n.t('datasets_frequencyModal_frequency')}
              <span className={styles['frequency-label-required']}>*</span>
            </div>
            <Select
              data-testid={KnowledgeE2e.SegmentDetailBatchFrequencyModalSelect}
              style={{ width: '100%' }}
              value={updateInterval}
              onChange={v => setUpdateInterval(v as number)}
              placeholder={I18n.t('datasets_frequencyModal_frequency')}
              optionList={getUpdateIntervalOptions()}
            ></Select>
          </div>
          {node}
        </div>
      </div>,
    ),
    open,
    close,
  };
};
