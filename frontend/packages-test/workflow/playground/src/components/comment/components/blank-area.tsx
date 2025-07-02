import type { FC } from 'react';

import {
  useNodeRender,
  usePlayground,
} from '@flowgram-adapter/free-layout-editor';

import type { CommentEditorModel } from '../model';
import { DragArea } from './drag-area';

interface IBlankArea {
  model: CommentEditorModel;
}

export const BlankArea: FC<IBlankArea> = props => {
  const { model } = props;
  const playground = usePlayground();
  const { selectNode } = useNodeRender();

  return (
    <div
      className="workflow-comment-blank-area h-full w-full"
      onMouseDown={e => {
        e.preventDefault();
        e.stopPropagation();
        model.setFocus(false);
        selectNode(e);
        playground.node.focus(); // 防止节点无法被删除
      }}
      onClick={e => {
        model.setFocus(true);
        model.selectEnd();
      }}
    >
      <DragArea
        className="relative h-full w-full"
        model={model}
        stopEvent={false}
      />
    </div>
  );
};
