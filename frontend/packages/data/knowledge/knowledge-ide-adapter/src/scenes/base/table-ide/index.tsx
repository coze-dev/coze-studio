import { KnowledgeIDEBaseLayout } from '@coze-data/knowledge-ide-base/layout/base';
import {
  TableKnowledgeWorkspace,
  type TableKnowledgeWorkspaceProps,
} from '@coze-data/knowledge-ide-base/features/table-knowledge-workspace';
import { BaseKnowledgeIDENavBar } from '@coze-data/knowledge-ide-base/features/nav-bar/base';
import { KnowledgeIDETableConfig } from '@coze-data/knowledge-ide-base/features/knowledge-ide-table-config';
import {
  KnowledgeIDERegistryContext,
  type KnowledgeIDERegistry,
} from '@coze-data/knowledge-ide-base/context/knowledge-ide-registry-context';

import { type BaseKnowledgeIDEProps } from '../types';
import { importKnowledgeSourceMenuContributes } from './import-knowledge-source-menu-contributes';

export interface BaseKnowledgeTableIDEProps extends BaseKnowledgeIDEProps {
  contentProps?: Partial<TableKnowledgeWorkspaceProps>;
}

const registryContextValue: KnowledgeIDERegistry = {
  importKnowledgeMenuSourceFeatureRegistry:
    importKnowledgeSourceMenuContributes,
};

export const BaseKnowledgeTableIDE = (props: BaseKnowledgeTableIDEProps) => (
  <KnowledgeIDERegistryContext.Provider value={registryContextValue}>
    <KnowledgeIDEBaseLayout
      renderNavBar={({ statusInfo, dataActions }) => (
        <BaseKnowledgeIDENavBar
          progressMap={statusInfo.progressMap}
          tableConfigButton={
            <KnowledgeIDETableConfig
              onChangeDocList={dataActions.updateDocumentList}
            />
          }
          {...props.navBarProps}
        />
      )}
      renderContent={({ dataActions, statusInfo }) => (
        <TableKnowledgeWorkspace
          progressMap={statusInfo.progressMap}
          reload={dataActions.refreshData}
          onChangeDocList={dataActions.updateDocumentList}
          isDocumentLoading={statusInfo.isDocumentLoading}
          {...props.contentProps}
        />
      )}
      {...props.layoutProps}
    />
  </KnowledgeIDERegistryContext.Provider>
);
