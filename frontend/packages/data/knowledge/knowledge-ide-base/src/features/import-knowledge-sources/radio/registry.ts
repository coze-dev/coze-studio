import { FeatureRegistry } from '@coze-data/feature-register';

import { TextLocalModule } from './text-local';
import { type ImportKnowledgeRadioSourceModule } from './module';

export type ImportKnowledgeRadioSourceFeatureType =
  | 'text-local'
  | 'text-custom'
  | 'table-custom'
  | 'table-local'
  | 'image-local'
  | 'image-custom';

export type ImportKnowledgeRadioSourceFeatureRegistry = FeatureRegistry<
  ImportKnowledgeRadioSourceFeatureType,
  ImportKnowledgeRadioSourceModule
>;

export const createImportKnowledgeSourceRadioFeatureRegistry = (
  name: string,
): ImportKnowledgeRadioSourceFeatureRegistry =>
  new FeatureRegistry<
    ImportKnowledgeRadioSourceFeatureType,
    ImportKnowledgeRadioSourceModule
  >({
    name,
    defaultFeature: {
      type: 'text-local',
      module: TextLocalModule,
    },
  });
