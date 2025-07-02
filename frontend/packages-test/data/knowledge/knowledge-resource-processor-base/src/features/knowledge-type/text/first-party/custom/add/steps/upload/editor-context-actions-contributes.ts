import { UploadImageMenu } from '@coze-data/knowledge-common-components/text-knowledge-editor/features/editor-actions/upload-image';
import {
  createEditorActionFeatureRegistry,
  type EditorActionRegistry,
} from '@coze-data/knowledge-common-components/text-knowledge-editor/features/editor-actions';
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
