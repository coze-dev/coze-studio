import {
  createImportKnowledgeSourceRadioFeatureRegistry,
  type ImportKnowledgeRadioSourceFeatureRegistry,
} from '@coze-data/knowledge-ide-base/features/import-knowledge-sources/radio';
import {
  TextCustomModule,
  TextLocalModule,
} from '@coze-data/knowledge-ide-base/features/import-knowledge-sources/radio';

export const importTextKnowledgeSourceRadioGroupContributes: ImportKnowledgeRadioSourceFeatureRegistry =
  (() => {
    const importKnowledgeRadioSourceFeatureRegistry =
      createImportKnowledgeSourceRadioFeatureRegistry(
        'import-knowledge-source-text-radio-group',
      );
    importKnowledgeRadioSourceFeatureRegistry.registerSome([
      {
        type: 'text-local',
        module: TextLocalModule,
      },
      {
        type: 'text-custom',
        module: TextCustomModule,
      },
    ]);
    return importKnowledgeRadioSourceFeatureRegistry;
  })();
