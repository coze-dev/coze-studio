import {
  TableLocalModule,
  TableCustomModule,
} from '@coze-data/knowledge-ide-base/features/import-knowledge-sources/menu';
import {
  createImportKnowledgeMenuSourceFeatureRegistry,
  type ImportKnowledgeMenuSourceRegistry,
} from '@coze-data/knowledge-ide-base/features/import-knowledge-sources/menu';

export const importKnowledgeSourceMenuContributes: ImportKnowledgeMenuSourceRegistry =
  (() => {
    const importKnowledgeMenuSourceFeatureRegistry =
      createImportKnowledgeMenuSourceFeatureRegistry(
        'import-knowledge-source-table-menu',
      );
    importKnowledgeMenuSourceFeatureRegistry.registerSome([
      {
        type: 'table-local',
        module: TableLocalModule,
      },
      {
        type: 'table-custom',
        module: TableCustomModule,
      },
    ]);
    return importKnowledgeMenuSourceFeatureRegistry;
  })();
