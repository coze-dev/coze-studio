import { type ProgressMap } from '@/types';

export interface KnowledgeIDENavBarProps {
  // TODO: hzf看看progressMap是否可以内部hooks消化
  progressMap: ProgressMap;
  hideBackButton?: boolean;
  textConfigButton?: React.ReactNode;
  tableConfigButton?: React.ReactNode;
  importKnowledgeSourceButton?: React.ReactNode;
  actionButtons?: React.ReactNode;
  onBack?: () => void;
}
