import { type ProgressMap } from '@/types';

export interface KnowledgeIDENavBarProps {
  progressMap: ProgressMap;
  hideBackButton?: boolean;
  textConfigButton?: React.ReactNode;
  tableConfigButton?: React.ReactNode;
  importKnowledgeSourceButton?: React.ReactNode;
  actionButtons?: React.ReactNode;
  onBack?: () => void;
}
