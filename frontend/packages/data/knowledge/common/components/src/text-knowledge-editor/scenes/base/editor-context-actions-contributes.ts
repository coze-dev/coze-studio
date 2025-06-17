import { UploadImageMenu } from '@/text-knowledge-editor/features/editor-actions/upload-image';
import {
  createEditorActionFeatureRegistry,
  type EditorActionRegistry,
} from '@/text-knowledge-editor/features/editor-actions/registry';
export const editorContextActionRegistry: EditorActionRegistry = (() => {
  const editorContextActionFeatureRegistry = createEditorActionFeatureRegistry(
    'editor-context-actions',
  );
  editorContextActionFeatureRegistry.registerSome([
    {
      type: 'upload-image',
      module: {
        Component: UploadImageMenu,
      },
    },
  ]);
  return editorContextActionFeatureRegistry;
})();
