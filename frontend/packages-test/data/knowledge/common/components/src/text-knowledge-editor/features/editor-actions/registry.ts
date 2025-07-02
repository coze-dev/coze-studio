import { FeatureRegistry } from '@coze-data/feature-register';

import { type EditorActionModule } from './module';

export type EditorActionFeatureType = 'upload-image';

export type EditorActionRegistry = FeatureRegistry<
  EditorActionFeatureType,
  EditorActionModule
>;

export const createEditorActionFeatureRegistry = (
  name: string,
): EditorActionRegistry =>
  new FeatureRegistry<EditorActionFeatureType, EditorActionModule>({
    name,
  });
