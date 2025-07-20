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
 
import { useCallback, useEffect, useMemo, useRef } from 'react';

import { Renderer as SDKRenderer } from '@coze-editor/editor/react';
import expression, {
  type EditorAPI as ExpressionEditorAPI,
} from '@coze-editor/editor/preset-expression';

import { type ExpressionEditorTreeNode } from '@/expression-editor';

import { useDeepEqualMemo, useLatest } from '../shared';
import { useInputRules, useExtensions } from './hooks';

interface RendererProps {
  value?: string;
  className?: string;
  readonly?: boolean;
  placeholder?: string;
  dataTestID?: string;
  variableTree: ExpressionEditorTreeNode[];
  onChange?: (value: string) => void;
}

function Renderer({
  value,
  variableTree,
  className,
  readonly,
  placeholder,
  dataTestID,
  onChange,
}: RendererProps) {
  const apiRef = useRef<ExpressionEditorAPI | null>(null);
  const variableTreeRef = useLatest<ExpressionEditorTreeNode[] | undefined>(
    variableTree,
  );
  const changedVariableTree = useDeepEqualMemo(variableTree);
  const inputRules = useInputRules(apiRef);
  const extensions = useExtensions(variableTreeRef);
  const contentAttributes = useMemo(
    () => ({
      class: `${className ?? ''} flow-canvas-not-draggable`,
      'data-testid': dataTestID ?? '',
      'data-flow-editor-selectable': 'false',
    }),
    [className, dataTestID],
  );

  const handleChange = useCallback(
    (e: { value: string }) => {
      if (typeof onChange === 'function') {
        onChange(e.value);
      }
    },
    [onChange],
  );

  // Note: changedVariableTree 这里只用来进行性能优化
  // useVariableTree 的触发时机仍然存在问题，缩放画布也会频繁触发 variableTree 的变更
  useEffect(() => {
    const editor = apiRef.current;

    if (!editor) {
      return;
    }

    editor.updateWholeDecorations();
  }, [changedVariableTree]);

  function handleFocus() {
    const editor = apiRef.current;

    if (!editor) {
      return;
    }

    editor.updateWholeDecorations();
  }

  // 值受控
  useEffect(() => {
    const editor = apiRef.current;

    if (!editor) {
      return;
    }

    if (typeof value === 'string' && value !== editor.getValue()) {
      editor.setValue(value);
    }
  }, [value]);

  return (
    <SDKRenderer
      plugins={expression}
      defaultValue={value ?? ''}
      options={{
        fontSize: 14,
        inputRules,
        readOnly: readonly,
        placeholder,
        contentAttributes,
      }}
      onFocus={handleFocus}
      onChange={handleChange}
      extensions={extensions}
      didMount={api => (apiRef.current = api)}
    />
  );
}

export { Renderer };
