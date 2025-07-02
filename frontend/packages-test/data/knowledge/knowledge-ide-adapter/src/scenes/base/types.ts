import { type KnowledgeIDEBaseLayoutProps } from '@coze-data/knowledge-ide-base/layout';
import { type KnowledgeIDENavBarProps } from '@coze-data/knowledge-ide-base/components/knowledge-nav-bar';

export interface BaseKnowledgeIDEProps {
  navBarProps?: Partial<KnowledgeIDENavBarProps>;
  layoutProps?: Partial<KnowledgeIDEBaseLayoutProps>;
}
