import { createContext, useContext } from 'react';

import { type ImportKnowledgeMenuSourceRegistry } from '@/features/import-knowledge-sources/menu/registry';

export interface KnowledgeIDERegistry {
  importKnowledgeMenuSourceFeatureRegistry?: ImportKnowledgeMenuSourceRegistry;
}

export const KnowledgeIDERegistryContext = createContext<KnowledgeIDERegistry>({
  importKnowledgeMenuSourceFeatureRegistry: undefined,
});

export const useKnowledgeIDERegistry = () =>
  useContext(KnowledgeIDERegistryContext);
