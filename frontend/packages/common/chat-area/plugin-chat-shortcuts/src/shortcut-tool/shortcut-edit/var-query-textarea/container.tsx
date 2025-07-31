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

import {
  type CSSProperties,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import cs from 'classnames';
import {
  ExpressionEditorEvent,
  ExpressionEditorRender,
  type ExpressionEditorTreeNode,
} from '@coze-workflow/sdk';
import { type PopoverProps } from '@coze-arch/bot-semi/Popover';

import { VarExpressionEditorSuggestion } from './suggestion';
import { VarExpressionEditorModel } from './model';

import styles from './index.module.less';

export interface ExpressionEditorContainerProps {
  value: string;
  getPopupContainer?: PopoverProps['getPopupContainer'];
  variableTree: ExpressionEditorTreeNode[];
  onChange?: (value: string) => void;
  placeholder?: string;
  readonly?: boolean;
  style?: CSSProperties;
  className?: string;
}

export interface ExpressionEditorContainerRef {
  model: VarExpressionEditorModel;
}

const ExpressionEditorContainer = forwardRef<
  ExpressionEditorContainerRef,
  ExpressionEditorContainerProps
>((props, ref) => {
  const {
    variableTree,
    placeholder,
    onChange,
    readonly = false,
    style,
    className,
    getPopupContainer,
  } = props;

  const [focus, _setFocus] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const formValue: string = props.value || '';
  const [model] = useState<VarExpressionEditorModel>(
    () => new VarExpressionEditorModel(formValue),
  );

  useImperativeHandle(ref, () => ({ model }));

  useEffect(() => model.setVariableTree(variableTree), [variableTree]);
  useEffect(() => model.setFocus(focus), [focus]);

  // Synchronize form value changes
  useEffect(() => {
    if (model.value === formValue) {
      // No synchronization required
      return;
    }
    model.setValue(formValue);
  }, [formValue]);

  useEffect(() => {
    const disposer = model.on<ExpressionEditorEvent.Change>(
      ExpressionEditorEvent.Change,
      (params: { value: string }) => onChange?.(params.value),
    );
    return () => {
      disposer();
    };
  }, []);

  if (!model?.variableTree) {
    return null;
  }

  return (
    <div
      className={cs(className, styles.container)}
      style={style}
      ref={containerRef}
    >
      <ExpressionEditorRender
        model={model}
        className={styles.editorRender}
        readonly={readonly}
        placeholder={placeholder}
      />
      {readonly ? null : (
        <VarExpressionEditorSuggestion
          model={model}
          containerRef={containerRef}
          getPopupContainer={getPopupContainer}
        />
      )}
    </div>
  );
});

export default ExpressionEditorContainer;
