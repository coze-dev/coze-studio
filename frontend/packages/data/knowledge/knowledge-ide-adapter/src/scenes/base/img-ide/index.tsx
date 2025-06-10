import { KnowledgeIDEBaseLayout } from '@coze-data/knowledge-ide-base/layout/base';
import { BaseKnowledgeIDENavBar } from '@coze-data/knowledge-ide-base/features/nav-bar/base';
import { KnowledgeIDERegistryContext } from '@coze-data/knowledge-ide-base/context/knowledge-ide-registry-context';
import {
  ImagePreview,
  type ImagePreviewProps,
} from '@coze-data/knowledge-ide-base/components/preview-image';

import { type BaseKnowledgeIDEProps } from '../types';
import { importKnowledgeSourceMenuContributes } from './import-knowledge-source-menu-contributes';

export interface BaseKnowledgeImgIDEProps extends BaseKnowledgeIDEProps {
  contentProps?: Partial<ImagePreviewProps>;
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
        <ImagePreview
          progressMap={statusInfo.progressMap}
          {...props.contentProps}
        />
      )}
      {...props.layoutProps}
    />
  </KnowledgeIDERegistryContext.Provider>
);
