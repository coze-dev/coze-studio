import { ErrorBoundary } from 'react-error-boundary';
import { type FC } from 'react';

import {
  Field,
  type FieldRenderProps,
  FlowNodeFormData,
  Form,
  type FormModelV2,
} from '@flowgram-adapter/free-layout-editor';
import {
  useNodeRender,
  type WorkflowNodeEntity,
} from '@flowgram-adapter/free-layout-editor';

import { useSize, useModel, useOverflow } from '../hooks';
import { CommentEditorFormField } from '../constant';
import { CommentToolbarContainer } from './toolbar-container';
import { CommentEditor } from './editor';
import { ContentDragArea } from './content-drag-area';
import { CommentContainer } from './container';
import { BorderArea } from './border-area';
import { BlankArea } from './blank-area';

export const CommentRender: FC<{
  node: WorkflowNodeEntity;
}> = props => {
  const { node } = props;
  const model = useModel();

  const { selected: focused, selectNode, nodeRef } = useNodeRender();

  const formModel = node.getData(FlowNodeFormData).getFormModel<FormModelV2>();
  const formControl = formModel?.formControl;

  const { width, height, onResize } = useSize();
  const { overflow, updateOverflow } = useOverflow({ model, height });

  return (
    <div
      className="workflow-comment w-auto h-auto min-w-[120px] min-h-[80px]"
      style={{
        width,
        height,
      }}
      ref={nodeRef}
      data-node-selected={String(focused)}
      onMouseEnter={updateOverflow}
      onMouseDown={e => {
        setTimeout(() => {
          // 防止 selectNode 拦截事件，导致 slate 编辑器无法聚焦
          selectNode(e);
          // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- delay
        }, 20);
      }}
    >
      <ErrorBoundary
        fallback={
          <p className="text-red-500">ERROR: Workflow Comment Form Error</p>
        }
      >
        <Form control={formControl}>
          <>
            {/* 背景 */}
            <CommentContainer focused={focused} style={{ height }}>
              <ErrorBoundary
                fallback={
                  <p className="text-red-500">
                    ERROR: Workflow Comment Render Failed
                  </p>
                }
              >
                <Field name={CommentEditorFormField.Note}>
                  {({ field }: FieldRenderProps<string>) => (
                    <>
                      {/** 编辑器 */}
                      <CommentEditor
                        model={model}
                        value={field.value}
                        onChange={field.onChange}
                      />
                      {/* 空白区域 */}
                      <BlankArea model={model} />
                      {/* 内容拖拽区域（点击后隐藏） */}
                      <ContentDragArea
                        model={model}
                        focused={focused}
                        overflow={overflow}
                      />
                      {/* 工具栏 */}
                      <CommentToolbarContainer
                        model={model}
                        containerRef={nodeRef}
                      />
                    </>
                  )}
                </Field>
              </ErrorBoundary>
            </CommentContainer>
            {/* 边框 */}
            <BorderArea model={model} overflow={overflow} onResize={onResize} />
          </>
        </Form>
      </ErrorBoundary>
    </div>
  );
};
