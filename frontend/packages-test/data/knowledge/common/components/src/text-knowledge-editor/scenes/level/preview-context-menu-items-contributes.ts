import {
  createPreviewContextMenuItemFeatureRegistry,
  type PreviewContextMenuItemRegistry,
} from '@/text-knowledge-editor/features/preview-context-menu-items/registry';
import { EditAction } from '@/text-knowledge-editor/features/preview-context-menu-items/edit-action';
import { DeleteAction } from '@/text-knowledge-editor/features/preview-context-menu-items/delete-action';
export const previewContextMenuItemsContributes: PreviewContextMenuItemRegistry =
  (() => {
    const previewContextMenuItemFeatureRegistry =
      createPreviewContextMenuItemFeatureRegistry('preview-context-menu-items');
    previewContextMenuItemFeatureRegistry.registerSome([
      {
        type: 'edit',
        module: {
          Component: EditAction,
        },
      },
      {
        type: 'delete',
        module: {
          Component: DeleteAction,
        },
      },
    ]);
    return previewContextMenuItemFeatureRegistry;
  })();
