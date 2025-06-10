import { type KnowledgeIDENavBarProps } from '@coze-data/knowledge-ide-base/components/knowledge-nav-bar';

import { type BaseKnowledgeIDEProps } from '../base/types';

export interface BizAgentKnowledgeIDEProps extends BaseKnowledgeIDEProps {
  navBarProps?: Partial<KnowledgeIDENavBarProps>;
}
