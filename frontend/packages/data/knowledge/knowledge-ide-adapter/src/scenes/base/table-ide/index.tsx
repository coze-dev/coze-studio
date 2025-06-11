import { KnowledgeIDEBaseLayout } from '@coze-data/knowledge-ide-base/layout/base';
import { BaseKnowledgeIDENavBar } from '@coze-data/knowledge-ide-base/features/nav-bar/base';
import {
  KnowledgeIDERegistryContext,
  type KnowledgeIDERegistry,
} from '@coze-data/knowledge-ide-base/context/knowledge-ide-registry-context';
import { type PreviewTextContentProps } from '@coze-data/knowledge-ide-base/components/preview-text';
import { TablePreview } from '@coze-data/knowledge-ide-base/components/preview-table';

import { type BaseKnowledgeIDEProps } from '../types';
import { importKnowledgeSourceMenuContributes } from './import-knowledge-source-menu-contributes';

export interface BaseKnowledgeTableIDEProps extends BaseKnowledgeIDEProps {
  contentProps?: Partial<PreviewTextContentProps>;
}

const registryContextValue: KnowledgeIDERegistry = {
  importKnowledgeMenuSourceFeatureRegistry:
    importKnowledgeSourceMenuContributes,
};

export const BaseKnowledgeTableIDE = (props: BaseKnowledgeTableIDEProps) => (
  <KnowledgeIDERegistryContext.Provider value={registryContextValue}>
    <KnowledgeIDEBaseLayout
      renderNavBar={({ statusInfo }) => (
        <BaseKnowledgeIDENavBar
          progressMap={statusInfo.progressMap}
          {...props.navBarProps}
        />
      )}
      renderContent={({ dataActions, statusInfo }) => (
        <TablePreview
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
