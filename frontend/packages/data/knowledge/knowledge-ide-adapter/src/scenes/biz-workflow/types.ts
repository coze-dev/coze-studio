import { type KnowledgeModalNavBarProps } from '@coze-data/knowledge-ide-base/components/knowledge-modal-nav-bar';

import { type BaseKnowledgeIDEProps } from '../base/types';

export interface BizWorkflowKnowledgeIDEProps extends BaseKnowledgeIDEProps {
  navBarProps?: Partial<KnowledgeModalNavBarProps>;
}
