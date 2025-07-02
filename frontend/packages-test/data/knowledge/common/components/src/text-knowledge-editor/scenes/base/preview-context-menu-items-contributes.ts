import {
  createPreviewContextMenuItemFeatureRegistry,
  type PreviewContextMenuItemRegistry,
} from '@/text-knowledge-editor/features/preview-context-menu-items/registry';
import { EditAction } from '@/text-knowledge-editor/features/preview-context-menu-items/edit-action';
import { DeleteAction } from '@/text-knowledge-editor/features/preview-context-menu-items/delete-action';
import { AddBeforeAction } from '@/text-knowledge-editor/features/preview-context-menu-items/add-before-action';
import { AddAfterAction } from '@/text-knowledge-editor/features/preview-context-menu-items/add-after-action';
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
        type: 'add-before',
        module: {
          Component: AddBeforeAction,
        },
      },
      {
        type: 'add-after',
        module: {
          Component: AddAfterAction,
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
