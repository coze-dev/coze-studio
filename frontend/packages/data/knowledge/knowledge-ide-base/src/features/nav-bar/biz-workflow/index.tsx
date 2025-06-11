import { useShallow } from 'zustand/react/shallow';
import { useKnowledgeStore } from '@coze-data/knowledge-stores';

import { KnowledgeModalNavBar as KnowledgeModalNavBarComponent } from '@/components/knowledge-modal-nav-bar';

import { type KnowledgeIDENavBarProps } from '../module';

export type BizWorkflowKnowledgeIDENavBarProps = KnowledgeIDENavBarProps;

export const BizWorkflowKnowledgeIDENavBar = (
  props: BizWorkflowKnowledgeIDENavBarProps,
) => {
  const { onBack, actionButtons } = props;
  const { dataSetDetail, documentList } = useKnowledgeStore(
    useShallow(state => ({
      dataSetDetail: state.dataSetDetail,
      documentList: state.documentList,
    })),
  );
  return (
    <KnowledgeModalNavBarComponent
      title={dataSetDetail?.name as string}
      onBack={onBack}
      datasetDetail={dataSetDetail}
      docInfo={documentList?.[0]}
      actionButtons={actionButtons}
    />
  );
};
