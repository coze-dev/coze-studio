import { BizAgentIdeKnowledgeIDENavBar } from '@coze-data/knowledge-ide-base/features/nav-bar/biz-agent-ide';

import { BaseKnowledgeIDE, type BaseKnowledgeIDEProps } from '../base';

export type BizAgentKnowledgeIDEProps = BaseKnowledgeIDEProps;
export const BizAgentKnowledgeIDE = (props: BizAgentKnowledgeIDEProps) => (
  <BaseKnowledgeIDE
    {...props}
    layoutProps={{
      renderNavBar: ({ statusInfo }) => (
        <BizAgentIdeKnowledgeIDENavBar
          progressMap={statusInfo.progressMap}
          {...props.navBarProps}
        />
      ),
    }}
  />
);
