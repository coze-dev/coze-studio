import { KnowledgeIDEBaseLayout } from '@coze-data/knowledge-ide-base/layout/base';
import { BaseKnowledgeIDENavBar } from '@coze-data/knowledge-ide-base/features/nav-bar/base';
import {
  KnowledgeIDERegistryContext,
  type KnowledgeIDERegistry,
} from '@coze-data/knowledge-ide-base/context/knowledge-ide-registry-context';
import {
  type PreviewTextContentProps,
  TextPreview,
} from '@coze-data/knowledge-ide-base/components/preview-text';

import { type BaseKnowledgeIDEProps } from '../types';
import { importKnowledgeSourceMenuContributes } from './import-knowledge-source-menu-contributes';

export interface BaseKnowledgeTextIDEProps extends BaseKnowledgeIDEProps {
  contentProps?: Partial<PreviewTextContentProps>;
}

const registryContextValue: KnowledgeIDERegistry = {
  importKnowledgeMenuSourceFeatureRegistry:
    importKnowledgeSourceMenuContributes,
};

export const BaseKnowledgeTextIDE = (props: BaseKnowledgeTextIDEProps) => (
  <KnowledgeIDERegistryContext.Provider value={registryContextValue}>
    <KnowledgeIDEBaseLayout
      renderNavBar={({ statusInfo }) => (
        <BaseKnowledgeIDENavBar
          progressMap={statusInfo.progressMap}
          {...props.navBarProps}
        />
      )}
      renderContent={({ dataActions, statusInfo }) => (
        <TextPreview
          progressMap={statusInfo.progressMap}
          reload={dataActions.refreshData}
          onChangeDocList={dataActions.updateDocumentList}
          linkOriginUrlButton={props.contentProps?.linkOriginUrlButton}
          fetchSliceButton={props.contentProps?.fetchSliceButton}
        />
      )}
      {...props.layoutProps}
    />
  </KnowledgeIDERegistryContext.Provider>
);
