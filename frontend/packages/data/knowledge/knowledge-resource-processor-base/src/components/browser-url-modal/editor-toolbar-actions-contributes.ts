import { UploadImageButton } from '@coze-data/knowledge-common-components/text-knowledge-editor/features/editor-actions/upload-image';
import {
  createEditorActionFeatureRegistry,
  type EditorActionRegistry,
} from '@coze-data/knowledge-common-components/text-knowledge-editor/features/editor-actions';
export const editorToolbarActionRegistry: EditorActionRegistry = (() => {
  const editorToolbarActionFeatureRegistry = createEditorActionFeatureRegistry(
    'editor-toolbar-actions',
  );
  editorToolbarActionFeatureRegistry.registerSome([
    {
      type: 'upload-image',
      module: {
        Component: UploadImageButton,
      },
    },
  ]);
  return editorToolbarActionFeatureRegistry;
})();
