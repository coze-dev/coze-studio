import {
  ImageLocalModule,
} from '@coze-data/knowledge-ide-base/features/import-knowledge-sources/menu/image-local';
import {
  createImportKnowledgeMenuSourceFeatureRegistry,
  type ImportKnowledgeMenuSourceRegistry,
} from '@coze-data/knowledge-ide-base/features/import-knowledge-sources/menu';

export const importKnowledgeSourceMenuContributes: ImportKnowledgeMenuSourceRegistry =
  (() => {
    const importKnowledgeMenuSourceFeatureRegistry =
      createImportKnowledgeMenuSourceFeatureRegistry(
        'import-knowledge-source-image-menu',
      );
    importKnowledgeMenuSourceFeatureRegistry.register({
      type: 'image-local',
      module: ImageLocalModule,
    });
    return importKnowledgeMenuSourceFeatureRegistry;
  })();
