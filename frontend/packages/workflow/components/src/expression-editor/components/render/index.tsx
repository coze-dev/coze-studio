/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
 * It should only contain editor logic, business-independent
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
          // eslint-disable-next-line @typescript-eslint/require-await -- prevent blocking slate rendering
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
