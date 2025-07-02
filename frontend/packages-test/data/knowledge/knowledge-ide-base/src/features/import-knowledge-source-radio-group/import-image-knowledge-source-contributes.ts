import { ImageLocalModule } from '@/features/import-knowledge-sources/radio/image-local';
import {
  createImportKnowledgeSourceRadioFeatureRegistry,
  type ImportKnowledgeRadioSourceFeatureRegistry,
} from '@/features/import-knowledge-sources/radio';

export const importImageKnowledgeSourceRadioGroupContributes: ImportKnowledgeRadioSourceFeatureRegistry =
  (() => {
    const importKnowledgeRadioSourceFeatureRegistry =
      createImportKnowledgeSourceRadioFeatureRegistry(
        'import-knowledge-source-image-radio-group',
      );
    importKnowledgeRadioSourceFeatureRegistry.registerSome([
      {
        type: 'image-local',
        module: ImageLocalModule,
      },
    ]);
    return importKnowledgeRadioSourceFeatureRegistry;
  })();
