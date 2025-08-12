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

import { useMemo } from 'react';

import { type EditorAPI as ExpressionEditorAPI } from '@coze-editor/editor/preset-expression';
import { type Tree } from '@coze-arch/bot-semi';

import { applyNode, getOptionInfoFromDOM, selectNodeByIndex } from '../shared';
import { useLatest } from '../../shared';
import { type ExpressionEditorTreeNode } from '../../core';
import { type CompletionContext } from './types';

// eslint-disable-next-line max-params
function useOptionsOperations(
  editor: ExpressionEditorAPI | undefined,
  context: CompletionContext | undefined,
  treeContainerRef: React.MutableRefObject<HTMLDivElement | null>,
  treeRef: React.MutableRefObject<Tree | null>,
) {
  const editorRef = useLatest(editor);
  const contextRef = useLatest(context);

  return useMemo(() => {
    function prev() {
      const optionsInfo = getOptionInfoFromDOM(treeContainerRef.current);
      if (!optionsInfo) {
        return;
      }

      const { elements, selectedIndex } = optionsInfo;

      if (elements.length === 1) {
        return;
      }

      const newIndex =
        selectedIndex - 1 < 0 ? elements.length - 1 : selectedIndex - 1;
      selectNodeByIndex(elements, newIndex);
    }

    function next() {
      const optionsInfo = getOptionInfoFromDOM(treeContainerRef.current);
      if (!optionsInfo) {
        return;
      }

      const { elements, selectedIndex } = optionsInfo;

      const newIndex =
        selectedIndex + 1 >= elements.length ? 0 : selectedIndex + 1;
      selectNodeByIndex(elements, newIndex);
    }

    function apply() {
      if (!contextRef.current) {
        return;
      }

      const optionsInfo = getOptionInfoFromDOM(treeContainerRef.current);
      if (!optionsInfo) {
        return;
      }

      const { selectedElement } = optionsInfo;

      const selectedDataKey = selectedElement?.getAttribute('data-key');

      if (!selectedDataKey) {
        return;
      }

      const variableTreeNode =
        treeRef.current?.state?.keyEntities?.[selectedDataKey]?.data;
      if (!variableTreeNode) {
        return;
      }

      applyNode(
        editorRef.current,
        variableTreeNode as ExpressionEditorTreeNode,
        contextRef.current,
      );
    }

    return {
      prev,
      next,
      apply,
    };
  }, []);
}

export { useOptionsOperations };
