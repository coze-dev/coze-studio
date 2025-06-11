import { type KnowledgeIDENavBarProps } from '../module';
import { BaseKnowledgeIDENavBar } from '../base';

export type BizLibraryKnowledgeIDENavBarProps = KnowledgeIDENavBarProps;

export const BizLibraryKnowledgeIDENavBar = (
  props: BizLibraryKnowledgeIDENavBarProps,
) => <BaseKnowledgeIDENavBar {...props} />;
