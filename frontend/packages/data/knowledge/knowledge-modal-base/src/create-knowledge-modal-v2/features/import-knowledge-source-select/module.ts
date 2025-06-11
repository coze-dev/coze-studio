import { type UnitType } from '@coze-data/knowledge-resource-processor-core';
import { type FormatType } from '@coze-arch/bot-api/knowledge';

export interface ImportKnowledgeSourceSelectModuleProps {
  formatType: FormatType;
  initValue?: UnitType;
  onChange: (val: UnitType) => void;
}

export type ImportKnowledgeSourceSelectModule =
  React.ComponentType<ImportKnowledgeSourceSelectModuleProps>;
