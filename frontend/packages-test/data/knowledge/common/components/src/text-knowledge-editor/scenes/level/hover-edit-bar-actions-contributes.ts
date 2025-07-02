import {
  createHoverEditBarActionFeatureRegistry,
  type HoverEditBarActionRegistry,
} from '@/text-knowledge-editor/features/hover-edit-bar-actions/registry';
import { EditAction } from '@/text-knowledge-editor/features/hover-edit-bar-actions/edit-action';
import { DeleteAction } from '@/text-knowledge-editor/features/hover-edit-bar-actions/delete-action';
export const hoverEditBarActionsContributes: HoverEditBarActionRegistry =
  (() => {
    const hoverEditBarActionFeatureRegistry =
      createHoverEditBarActionFeatureRegistry('hover-edit-bar-actions');
    hoverEditBarActionFeatureRegistry.registerSome([
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
    return hoverEditBarActionFeatureRegistry;
  })();
