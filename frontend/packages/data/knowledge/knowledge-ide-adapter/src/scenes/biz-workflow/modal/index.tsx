import { type IKnowledgeParams } from '@coze-data/knowledge-stores';
import { useKnowledgeIDEFullScreenModal as useKnowledgeIDEFullScreenModalBase } from '@coze-data/knowledge-ide-base/layout/base/modal';
import { type KnowledgeModalNavBarProps } from '@coze-data/knowledge-ide-base/components/knowledge-modal-nav-bar';

import { BizWorkflowKnowledgeIDE } from '../index';

export const useBizWorkflowKnowledgeIDEFullScreenModal = (props: {
  keepDocTitle?: boolean;
  navBarProps?: Partial<KnowledgeModalNavBarProps>;
  biz: IKnowledgeParams['biz'];
}) =>
  useKnowledgeIDEFullScreenModalBase({
    ...props,
    renderKnowledgeIDE: ({ onClose }) => (
      <BizWorkflowKnowledgeIDE
        {...props}
        navBarProps={{
          ...props.navBarProps,
          onBack: onClose,
        }}
      />
    ),
  });
