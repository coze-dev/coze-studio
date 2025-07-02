import { useEffect } from 'react';

import { PencilBrush, type Canvas } from 'fabric';

import { createControls } from '../utils/create-controls';
import { defaultProps, createCommonObjectOptions } from '../utils';
import { Mode } from '../typings';

export const useFreePencil = ({ canvas }: { canvas?: Canvas }) => {
  const enterFreePencil = () => {
    if (!canvas) {
      return;
    }
    // 启用自由绘图模式
    canvas.isDrawingMode = true;

    // 设置 PencilBrush 为当前的画笔
    canvas.freeDrawingBrush = new PencilBrush(canvas);

    // 设置画笔的一些属性
    canvas.freeDrawingBrush.color = defaultProps[Mode.PENCIL].stroke as string; // 画笔颜色
    canvas.freeDrawingBrush.width = defaultProps[Mode.PENCIL]
      .strokeWidth as number; // 画笔宽度

    // 你也可以设置其他属性，比如 opacity (不透明度)
    // canvas.freeDrawingBrush.opacity = 0.6;
  };

  useEffect(() => {
    if (!canvas) {
      return;
    }
    const disposer = canvas.on('path:created', function (event) {
      const { path } = event;
      const commonOptions = createCommonObjectOptions(Mode.PENCIL);
      path.set({ ...commonOptions, ...defaultProps[Mode.PENCIL] });

      createControls[Mode.PENCIL]?.({
        element: path,
      });

      // 得触发一次 object:added ，以触发 onSave，否则 schema 里并不会包含 commonOptions
      canvas.fire('object:modified');
    });

    return () => {
      disposer();
    };
  }, [canvas]);

  const exitFreePencil = () => {
    if (!canvas) {
      return;
    }
    // 禁用自由绘图模式
    canvas.isDrawingMode = false;
  };

  return {
    enterFreePencil,
    exitFreePencil,
  };
};
