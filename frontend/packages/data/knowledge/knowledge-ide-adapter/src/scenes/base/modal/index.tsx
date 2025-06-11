import { type IKnowledgeParams } from '@coze-data/knowledge-stores';
import { useKnowledgeIDEFullScreenModal as useKnowledgeIDEFullScreenModalBase } from '@coze-data/knowledge-ide-base/layout/base/modal';
import { type KnowledgeIDENavBarProps } from '@coze-data/knowledge-ide-base/components/knowledge-nav-bar';

import { BaseKnowledgeIDE } from '../index';

export const useBaseKnowledgeIDEFullScreenModal = (props: {
  keepDocTitle?: boolean;
  navBarProps?: Partial<KnowledgeIDENavBarProps>;
  biz: IKnowledgeParams['biz'];
  spaceId: string;
}) =>
  useKnowledgeIDEFullScreenModalBase({
    ...props,
    renderKnowledgeIDE: ({ onClose }) => (
      <BaseKnowledgeIDE
        {...props}
        navBarProps={{
          ...props.navBarProps,
          onBack: onClose,
        }}
      />
    ),
  });
