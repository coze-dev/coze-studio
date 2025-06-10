import { TextLocalModule } from '@coze-data/knowledge-ide-base/features/import-knowledge-sources/menu/text-local';
import { TextCustomModule } from '@coze-data/knowledge-ide-base/features/import-knowledge-sources/menu/text-custom';
import {
  createImportKnowledgeMenuSourceFeatureRegistry,
  type ImportKnowledgeMenuSourceRegistry,
} from '@coze-data/knowledge-ide-base/features/import-knowledge-sources/menu';
export const importKnowledgeSourceMenuContributes: ImportKnowledgeMenuSourceRegistry =
  (() => {
    const importKnowledgeMenuSourceFeatureRegistry =
      createImportKnowledgeMenuSourceFeatureRegistry(
        'import-knowledge-source-text-menu',
      );
    importKnowledgeMenuSourceFeatureRegistry.registerSome([
      {
        type: 'text-local',
        module: TextLocalModule,
      },
      {
        type: 'text-custom',
        module: TextCustomModule,
      },
    ]);
    return importKnowledgeMenuSourceFeatureRegistry;
  })();
