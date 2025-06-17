import { FeatureRegistry } from '@coze-data/feature-register';

import { type HoverEditBarActionModule } from './module';

export type HoverEditBarActionFeatureType =
  | 'edit'
  | 'delete'
  | 'add-before'
  | 'add-after';

export type HoverEditBarActionRegistry = FeatureRegistry<
  HoverEditBarActionFeatureType,
  HoverEditBarActionModule
>;

export const createHoverEditBarActionFeatureRegistry = (
  name: string,
): HoverEditBarActionRegistry =>
  new FeatureRegistry<HoverEditBarActionFeatureType, HoverEditBarActionModule>({
    name,
  });
