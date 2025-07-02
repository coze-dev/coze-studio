import { BizProjectKnowledgeIDENavBar } from '@coze-data/knowledge-ide-base/features/nav-bar/biz-project';

import { BaseKnowledgeIDE, type BaseKnowledgeIDEProps } from '../base';

export type BizProjectKnowledgeIDEProps = BaseKnowledgeIDEProps;
export const BizProjectKnowledgeIDE = (props: BizProjectKnowledgeIDEProps) => (
  <BaseKnowledgeIDE
    {...props}
    layoutProps={{
      className: 'coz-bg-max border border-solid coz-stroke-primary',
      renderNavBar: ({ statusInfo }) => (
        <BizProjectKnowledgeIDENavBar
          progressMap={statusInfo.progressMap}
          {...props.navBarProps}
        />
      ),
    }}
  />
);
