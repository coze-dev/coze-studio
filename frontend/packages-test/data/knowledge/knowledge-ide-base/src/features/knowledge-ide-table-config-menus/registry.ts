import { FeatureRegistry } from '@coze-data/feature-register';

import { type TableConfigMenuModule } from './module';

export type TableConfigMenuFeatureType =
  | 'configuration-table-structure'
  | 'update-frequency'
  | 'fetch-slice'
  | 'view-source';

export type TableConfigMenuRegistry = FeatureRegistry<
  TableConfigMenuFeatureType,
  TableConfigMenuModule
>;

export const createTableConfigMenuRegistry = (
  name: string,
): TableConfigMenuRegistry =>
  new FeatureRegistry<TableConfigMenuFeatureType, TableConfigMenuModule>({
    name,
  });
