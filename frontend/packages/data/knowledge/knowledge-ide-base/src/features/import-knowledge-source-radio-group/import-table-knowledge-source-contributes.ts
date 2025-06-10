import { TableLocalModule } from '@coze-data/knowledge-ide-base/features/import-knowledge-sources/radio/table-local';
import {
  createImportKnowledgeSourceRadioFeatureRegistry,
  type ImportKnowledgeRadioSourceFeatureRegistry,
} from '@coze-data/knowledge-ide-base/features/import-knowledge-sources/radio';
import { TableCustomModule } from '@coze-data/knowledge-ide-base/features/import-knowledge-sources/radio';

export const importTableKnowledgeSourceRadioGroupContributes: ImportKnowledgeRadioSourceFeatureRegistry =
  (() => {
    const importKnowledgeRadioSourceFeatureRegistry =
      createImportKnowledgeSourceRadioFeatureRegistry(
        'import-knowledge-source-table-radio-group',
      );
    importKnowledgeRadioSourceFeatureRegistry.registerSome([
      {
        type: 'table-local',
        module: TableLocalModule,
      },
      {
        type: 'table-custom',
        module: TableCustomModule,
      },
    ]);
    return importKnowledgeRadioSourceFeatureRegistry;
  })();
