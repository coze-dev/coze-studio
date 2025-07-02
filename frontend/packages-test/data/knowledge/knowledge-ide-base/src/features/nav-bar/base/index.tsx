import { useShallow } from 'zustand/react/shallow';
import { useKnowledgeStore } from '@coze-data/knowledge-stores';

import { ImportKnowledgeSourceButton } from '@/features/import-knowledge-source-button/base';
import { KnowledgeIDENavBar as KnowledgeIDENavBarComponent } from '@/components/knowledge-nav-bar';

import { type KnowledgeIDENavBarProps } from '../module';

export const BaseKnowledgeIDENavBar = (props: KnowledgeIDENavBarProps) => {
  const { progressMap, hideBackButton, importKnowledgeSourceButton } = props;
  const { setDataSetDetail } = useKnowledgeStore(
    useShallow(state => ({
      setDataSetDetail: state.setDataSetDetail,
    })),
  );
  return (
    <KnowledgeIDENavBarComponent
      {...props}
      importKnowledgeSourceButton={
        importKnowledgeSourceButton ?? <ImportKnowledgeSourceButton />
      }
      onChangeDataset={setDataSetDetail}
      progressMap={progressMap}
      hideBackButton={hideBackButton}
    />
  );
};
