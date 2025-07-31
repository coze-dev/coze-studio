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

/* eslint-disable  @typescript-eslint/naming-convention */
import React, { useCallback, useRef } from 'react';

import { useEditor } from '@coze-editor/editor/react';
import type { EditorAPI } from '@coze-editor/editor/preset-prompt';
import type { TreeNodeData } from '@coze-arch/bot-semi/Tree';
import { Tree } from '@coze-arch/bot-semi';

import styles from '../style.module.less';
import { useDeepEqualMemo } from '../../../expression/shared';
import {
  applyNode,
  getOptionInfoFromDOM,
  selectNodeByIndex,
} from '../../../expression/popover/shared';
import type { CompletionContext } from '../../../expression/popover/hooks/types';
import {
  useDrillVariableTree,
  useFilteredVariableTree,
  useKeyboard,
  useOptionsOperations,
  useSelectedValue,
  useTreeRefresh,
  useTreeSearch,
} from '../../../expression/popover/hooks';
import type { ExpressionEditorTreeNode } from '../../../expression/core';

interface Props {
  variableTree: ExpressionEditorTreeNode[];
  enableKeyboard: boolean;
  completionContext?: CompletionContext;
}

export default function useVariablesTree({
  variableTree: variableTreeFromProps,
  enableKeyboard,
  completionContext,
}: Props) {
  const editor = useEditor<EditorAPI>();
  const variableTree = useDeepEqualMemo(variableTreeFromProps);
  const treeRef = useRef<Tree | null>(null);
  const treeContainerRef = useRef<HTMLDivElement | null>(null);

  const drilledVariableTree = useDrillVariableTree(
    editor,
    variableTree,
    completionContext,
  );

  const selected = useSelectedValue(completionContext?.text, variableTree);

  // Replace content in {{}} based on user selection
  const handleSelect = useCallback(
    (_: string, __: boolean, node: TreeNodeData) => {
      if (!editor || !completionContext) {
        return;
      }

      applyNode(editor, node as ExpressionEditorTreeNode, completionContext);

      editor.$view.focus();
    },
    [editor, completionContext],
  );

  const filteredVariableTree = useFilteredVariableTree(
    completionContext,
    drilledVariableTree,
  );

  const treeRefreshKey = useTreeRefresh(filteredVariableTree);
  useTreeSearch(treeRefreshKey, treeRef, completionContext, () => {
    const optionsInfo = getOptionInfoFromDOM(treeContainerRef.current);
    if (!optionsInfo) {
      return;
    }
    const { elements } = optionsInfo;
    selectNodeByIndex(elements, 0);
  });

  const { prev, next, apply } = useOptionsOperations(
    editor,
    completionContext,
    treeContainerRef,
    treeRef,
  );

  // Press the up and down keys to switch the recommended items, and press Enter to fill in.
  useKeyboard(enableKeyboard, {
    ArrowUp: prev,
    ArrowDown: next,
    Enter: () => {
      apply();
      editor.$view.focus();
    },
  });

  const variablesTreePanel = (
    <div
      className={styles['library-variable-insert-tree']}
      ref={treeContainerRef}
    >
      <Tree
        ref={treeRef}
        showFilteredOnly
        filterTreeNode
        onChangeWithObject
        treeData={drilledVariableTree}
        searchRender={false}
        value={selected}
        onSelect={handleSelect}
      />
    </div>
  );

  return {
    variablesTreePanel,
  };
}
