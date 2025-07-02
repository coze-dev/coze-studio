import { KnowledgeIDEBaseLayout } from '@coze-data/knowledge-ide-base/layout/base';
import { BaseKnowledgeIDENavBar } from '@coze-data/knowledge-ide-base/features/nav-bar/base';
import {
  ImageKnowledgeWorkspace,
  type ImageKnowledgeWorkspaceProps,
} from '@coze-data/knowledge-ide-base/features/image-knowledge-workspace';
import { KnowledgeIDERegistryContext } from '@coze-data/knowledge-ide-base/context/knowledge-ide-registry-context';

import { type BaseKnowledgeIDEProps } from '../types';
import { importKnowledgeSourceMenuContributes } from './import-knowledge-source-menu-contributes';

export interface BaseKnowledgeImgIDEProps extends BaseKnowledgeIDEProps {
  contentProps?: Partial<ImageKnowledgeWorkspaceProps>;
}

const registryContextValue = {
  importKnowledgeMenuSourceFeatureRegistry:
    importKnowledgeSourceMenuContributes,
};

export const BaseKnowledgeImgIDE = (props: BaseKnowledgeImgIDEProps) => (
  <KnowledgeIDERegistryContext.Provider value={registryContextValue}>
    <KnowledgeIDEBaseLayout
      renderNavBar={({ statusInfo }) => (
        <BaseKnowledgeIDENavBar
          progressMap={statusInfo.progressMap}
          {...props.navBarProps}
        />
      )}
      renderContent={({ statusInfo }) => (
        <ImageKnowledgeWorkspace
          progressMap={statusInfo.progressMap}
          {...props.contentProps}
        />
      )}
      {...props.layoutProps}
    />
  </KnowledgeIDERegistryContext.Provider>
);
