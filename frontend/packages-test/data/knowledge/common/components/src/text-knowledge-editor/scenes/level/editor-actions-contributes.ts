import { UploadImageMenu } from '@/text-knowledge-editor/features/editor-actions/upload-image';
import {
  createEditorActionFeatureRegistry,
  type EditorActionRegistry,
} from '@/text-knowledge-editor/features/editor-actions/registry';
export const editorActionRegistry: EditorActionRegistry = (() => {
  const editorActionFeatureRegistry =
    createEditorActionFeatureRegistry('editor-actions');
  editorActionFeatureRegistry.registerSome([
    {
      type: 'upload-image',
      module: {
        Component: UploadImageMenu,
      },
    },
  ]);
  return editorActionFeatureRegistry;
})();
