import { type FC } from 'react';

import classNames from 'classnames';
import {
  useNodeRender,
  usePlayground,
} from '@flowgram-adapter/free-layout-editor';

import { type CommentEditorModel } from '../model';

interface IDragArea {
  className?: string;
  model: CommentEditorModel;
  stopEvent?: boolean;
}

export const DragArea: FC<IDragArea> = props => {
  const { className = '', model, stopEvent = true } = props;

  const playground = usePlayground();

  const {
    startDrag: onStartDrag,
    onFocus,
    onBlur,
    selectNode,
  } = useNodeRender();

  return (
    <div
      className={classNames(
        'workflow-comment-drag-area',
        'absolute flex items-center justify-center cursor-move',
        className,
      )}
      data-flow-editor-selectable="false"
      draggable={true}
      onMouseDown={e => {
        if (stopEvent) {
          e.preventDefault();
          e.stopPropagation();
        }
        model.setFocus(false);
        onStartDrag(e);
        selectNode(e);
        playground.node.focus(); // 防止节点无法被删除
      }}
      onFocus={onFocus}
      onBlur={onBlur}
    />
  );
};
