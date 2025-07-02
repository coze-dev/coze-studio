import { Direction } from '../../types/selection';
import { compareNodePosition } from './compare-node-position';

export const getSelectionDirection = (selection: Selection): Direction => {
  // 确保有选区存在
  if (!selection || selection.isCollapsed) {
    return Direction.Unknown; // 没有选区或选区未展开
  }

  const { anchorNode } = selection;
  const { focusNode } = selection;

  // 确保 anchorNode 和 focusNode 都不为 null
  if (!anchorNode || !focusNode) {
    return Direction.Unknown; // 无法确定方向
  }

  const { anchorOffset } = selection;
  const { focusOffset } = selection;
  // 比较 anchor 和 focus 的位置
  if (anchorNode === focusNode) {
    // 如果 anchor 和 focus 在同一个节点，通过偏移量判断方向
    return anchorOffset <= focusOffset ? Direction.Forward : Direction.Backward;
  } else {
    // 如果不在同一个节点，使用 Document Position 来判断
    const position = compareNodePosition(anchorNode, focusNode);

    if (position === 'before') {
      return Direction.Forward;
    } else if (position === 'after') {
      return Direction.Backward;
    }
  }

  // 如果无法确定方向，返回 'unknown'
  return Direction.Unknown;
};
