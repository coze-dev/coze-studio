import { useShallow } from 'zustand/react/shallow';
import { useKnowledgeStore } from '@coze-data/knowledge-stores';

import { NavBarActionButton } from '@/features/nav-bar-action-button';
import { BizAgentIdeImportKnowledgeSourceButton } from '@/features/import-knowledge-source-button/biz-agent-ide';
import { KnowledgeModalNavBar as KnowledgeModalNavBarComponent } from '@/components/knowledge-modal-nav-bar';

import { type KnowledgeIDENavBarProps } from '../module';
import { useBeforeKnowledgeIDEClose } from './hooks/use-case/use-before-knowledgeide-close';

export type BizAgentIdeKnowledgeIDENavBarProps = KnowledgeIDENavBarProps;

export const BizAgentIdeKnowledgeIDENavBar = (
  props: BizAgentIdeKnowledgeIDENavBarProps,
) => {
  const { onBack, importKnowledgeSourceButton } = props;
  const { dataSetDetail, documentList } = useKnowledgeStore(
    useShallow(state => ({
      dataSetDetail: state.dataSetDetail,
      documentList: state.documentList,
    })),
  );
  const handleBotIdeBack = useBeforeKnowledgeIDEClose({
    onBack,
  });
  return (
    <KnowledgeModalNavBarComponent
      title={dataSetDetail?.name as string}
      onBack={onBack}
      datasetDetail={dataSetDetail}
      docInfo={documentList?.[0]}
      actionButtons={
        <NavBarActionButton
          key={dataSetDetail?.dataset_id}
          dataSetDetail={dataSetDetail}
        />
      }
      importKnowledgeSourceButton={
        importKnowledgeSourceButton ?? (
          <BizAgentIdeImportKnowledgeSourceButton />
        )
      }
      beforeBack={handleBotIdeBack}
    />
  );
};
