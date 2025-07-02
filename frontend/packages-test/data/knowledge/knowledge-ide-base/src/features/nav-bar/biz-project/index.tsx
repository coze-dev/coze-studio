import { type KnowledgeIDENavBarProps } from '../module';
import { BaseKnowledgeIDENavBar } from '../base';

export type BizProjectKnowledgeIDENavBarProps = KnowledgeIDENavBarProps;

export const BizProjectKnowledgeIDENavBar = (
  props: BizProjectKnowledgeIDENavBarProps,
) => <BaseKnowledgeIDENavBar {...props} hideBackButton />;
