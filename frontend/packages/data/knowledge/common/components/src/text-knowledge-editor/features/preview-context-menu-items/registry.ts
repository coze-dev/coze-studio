import { FeatureRegistry } from '@coze-data/feature-register';

import { type PreviewContextMenuItemModule } from './module';

export type PreviewContextMenuItemFeatureType =
  | 'edit'
  | 'delete'
  | 'add-before'
  | 'add-after';

export type PreviewContextMenuItemRegistry = FeatureRegistry<
  PreviewContextMenuItemFeatureType,
  PreviewContextMenuItemModule
>;

export const createPreviewContextMenuItemFeatureRegistry = (
  name: string,
): PreviewContextMenuItemRegistry =>
  new FeatureRegistry<
    PreviewContextMenuItemFeatureType,
    PreviewContextMenuItemModule
  >({
    name,
  });
