import {
  createHoverEditBarActionFeatureRegistry,
  type HoverEditBarActionRegistry,
} from '@/text-knowledge-editor/features/hover-edit-bar-actions/registry';
import { EditAction } from '@/text-knowledge-editor/features/hover-edit-bar-actions/edit-action';
import { DeleteAction } from '@/text-knowledge-editor/features/hover-edit-bar-actions/delete-action';
import { AddBeforeAction } from '@/text-knowledge-editor/features/hover-edit-bar-actions/add-before-action';
import { AddAfterAction } from '@/text-knowledge-editor/features/hover-edit-bar-actions/add-after-action';
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
    return hoverEditBarActionFeatureRegistry;
  })();
