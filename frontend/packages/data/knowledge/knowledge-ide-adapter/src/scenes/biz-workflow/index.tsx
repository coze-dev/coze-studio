import { BizWorkflowKnowledgeIDENavBar } from '@coze-data/knowledge-ide-base/features/nav-bar/biz-workflow';

import { BaseKnowledgeIDE, type BaseKnowledgeIDEProps } from '../base';

export type BizWorkflowKnowledgeIDEProps = BaseKnowledgeIDEProps;
export const BizWorkflowKnowledgeIDE = (
  props: BizWorkflowKnowledgeIDEProps,
) => (
  <BaseKnowledgeIDE
    {...props}
    layoutProps={{
      renderNavBar: ({ statusInfo }) => (
        <BizWorkflowKnowledgeIDENavBar
          progressMap={statusInfo.progressMap}
          {...props.navBarProps}
        />
      ),
    }}
  />
);
