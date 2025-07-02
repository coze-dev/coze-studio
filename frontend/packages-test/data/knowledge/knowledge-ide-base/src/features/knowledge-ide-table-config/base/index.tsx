import { useKnowledgeStore } from '@coze-data/knowledge-stores';
import { type DocumentInfo } from '@coze-arch/bot-api/knowledge';

import { useReloadKnowledgeIDE } from '@/hooks/use-case/use-reload-knowledge-ide';

import { type TableConfigMenuRegistry } from '../../knowledge-ide-table-config-menus';
import { KnowledgeConfigMenu as KnowledgeConfigMenuComponent } from '../../../components/knowledge-config-menu';

export interface TableConfigButtonProps {
  knowledgeTableConfigMenuContributes?: TableConfigMenuRegistry;
  onChangeDocList?: (docList: DocumentInfo[]) => void;
}

export const TableConfigButton = (props: TableConfigButtonProps) => {
  const { knowledgeTableConfigMenuContributes, onChangeDocList } = props;
  const documentList = useKnowledgeStore(state => state.documentList);
  const documentInfo = documentList?.[0];
  const canEdit = useKnowledgeStore(state => state.canEdit);
  const { reload } = useReloadKnowledgeIDE();

  if (!knowledgeTableConfigMenuContributes) {
    return null;
  }

  return (
    <KnowledgeConfigMenuComponent>
      {canEdit
        ? knowledgeTableConfigMenuContributes
            ?.entries()
            .map(([key, { Component }]) => (
              <Component
                key={key}
                documentInfo={documentInfo}
                onChangeDocList={onChangeDocList}
                reload={reload}
              />
            ))
        : null}
    </KnowledgeConfigMenuComponent>
  );
};
