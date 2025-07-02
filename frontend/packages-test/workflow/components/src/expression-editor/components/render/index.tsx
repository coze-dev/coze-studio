import React, { type CompositionEventHandler } from 'react';

import { Slate, Editable } from 'slate-react';
import classNames from 'classnames';

import { ExpressionEditorLeaf } from '../leaf';
import { type ExpressionEditorLine } from '../../type';
import { type ExpressionEditorModel } from '../../model';

import styles from './index.module.less';

interface ExpressionEditorRenderProps {
  model: ExpressionEditorModel;
  className?: string;
  placeholder?: string;
  readonly?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  dataTestID?: string;
}

/**
 * 应当只包含编辑器逻辑，业务无关
 */
export const ExpressionEditorRender: React.FC<
  ExpressionEditorRenderProps
> = props => {
  const {
    model,
    className,
    placeholder,
    onFocus,
    onBlur,
    readonly = false,
    dataTestID,
  } = props;

  return (
    <div className={className}>
      <Slate
        editor={model.editor}
        initialValue={model.lines}
        onChange={value => {
          // eslint-disable-next-line @typescript-eslint/require-await -- 防止阻塞 slate 渲染
          const asyncOnChange = async () => {
            const lines = value as ExpressionEditorLine[];
            model.change(lines);
            model.select(lines);
          };
          asyncOnChange();
        }}
      >
        <Editable
          data-testid={dataTestID}
          className={classNames(
            styles.slateEditable,
            'flow-canvas-not-draggable',
          )}
          data-flow-editor-selectable="false"
          readOnly={readonly}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          renderLeaf={ExpressionEditorLeaf}
          decorate={model.decorate}
          onKeyDown={e => model.keydown(e)}
          onCompositionStart={e =>
            model.compositionStart(
              e as unknown as CompositionEventHandler<HTMLDivElement>,
            )
          }
        />
      </Slate>
    </div>
  );
};
