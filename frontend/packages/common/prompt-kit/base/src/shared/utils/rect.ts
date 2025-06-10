import { type EditorAPI } from '@flow-lang-sdk/editor/preset-prompt';

export const getSelectionBoundary = (editor: EditorAPI) => {
  const rects = editor.getMainSelectionRects();

  if (rects.length === 0) {
    return { left: 0, top: 0, width: 0, height: 0 };
  }

  // 初始化最大矩形
  let maxLeft = Infinity;
  let maxTop = Infinity;
  let maxRight = -Infinity;
  let maxBottom = -Infinity;

  // 遍历所有矩形，计算包围盒的边界
  rects.forEach(rect => {
    maxLeft = Math.min(maxLeft, rect.left);
    maxTop = Math.min(maxTop, rect.top);
    maxRight = Math.max(maxRight, rect.left + (rect.width ?? 0));
    maxBottom = Math.max(maxBottom, rect.top + (rect.height ?? 0));
  });

  // 计算最终的宽度和高度
  const width = maxRight - maxLeft;
  const height = maxBottom - maxTop;

  // 获取编辑器的滚动位置
  const { scrollLeft } = editor.$view.scrollDOM;
  const { scrollTop } = editor.$view.scrollDOM;

  // 获取编辑器容器的位置
  const editorRect = editor.$view.dom.getBoundingClientRect();

  // 计算相对于视口的绝对位置
  const absoluteLeft = editorRect.left + maxLeft - scrollLeft;
  const absoluteTop = editorRect.top + maxTop - scrollTop;
  const absoluteBottom = editorRect.top + maxBottom - scrollTop;

  return {
    left: absoluteLeft,
    top: absoluteTop,
    bottom: absoluteBottom,
    width,
    height,
  };
};
