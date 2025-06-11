import type { UnitType } from '@coze-data/knowledge-resource-processor-core';

export interface ImportKnowledgeMenuSourceModuleProps {
  onClick: (item: UnitType) => void;
}

export interface ImportKnowledgeMenuSourceModule {
  Component: React.ComponentType<ImportKnowledgeMenuSourceModuleProps>;
}
