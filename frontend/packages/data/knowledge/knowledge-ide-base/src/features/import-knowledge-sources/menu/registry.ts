import { FeatureRegistry } from '@coze-data/feature-register';

import { type ImportKnowledgeMenuSourceModule } from './module';

export type ImportKnowledgeMenuSourceFeatureType =
  | 'text-local'
  | 'text-custom'
  | 'table-custom'
  | 'table-local'
  | 'image-local'
  | 'image-custom';

export type ImportKnowledgeMenuSourceRegistry = FeatureRegistry<
  ImportKnowledgeMenuSourceFeatureType,
  ImportKnowledgeMenuSourceModule
>;

export const createImportKnowledgeMenuSourceFeatureRegistry = (
  name: string,
): ImportKnowledgeMenuSourceRegistry =>
  new FeatureRegistry<
    ImportKnowledgeMenuSourceFeatureType,
    ImportKnowledgeMenuSourceModule
  >({
    name,
  });
