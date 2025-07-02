import { FlowNodeTransformData } from '@flowgram-adapter/free-layout-editor';
import { type SelectionService } from '@flowgram-adapter/free-layout-editor';
import {
  WorkflowNodeEntity,
  type WorkflowSelectService,
} from '@flowgram-adapter/free-layout-editor';
import { Rectangle } from '@flowgram-adapter/common';

const BOUNDS_PADDING = 2;
export function getSelectionBounds(
  selectionService: SelectionService | WorkflowSelectService,
  ignoreOneSelect?: boolean, // 忽略单选
): Rectangle {
  const selectedNodes = selectionService.selection.filter(
    node => node instanceof WorkflowNodeEntity,
  );

  // 选中单个的时候不显示
  return selectedNodes.length > (ignoreOneSelect ? 1 : 0)
    ? Rectangle.enlarge(
        selectedNodes.map(n => n.getData(FlowNodeTransformData)!.bounds),
      ).pad(BOUNDS_PADDING)
    : Rectangle.EMPTY;
}
