import { useMemo } from 'react';

import { type EditorAPI as ExpressionEditorAPI } from '@flow-lang-sdk/editor/preset-expression';
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
