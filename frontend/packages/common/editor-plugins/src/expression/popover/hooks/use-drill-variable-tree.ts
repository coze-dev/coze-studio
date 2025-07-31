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

import { ExpressionEditorParserBuiltin } from '../../core/parser';
import {
  ExpressionEditorTreeHelper,
  type ExpressionEditorTreeNode,
} from '../../core';
import { type CompletionContext } from './types';

function useDrillVariableTree(
  editor: ExpressionEditorAPI | undefined,
  variableTree: ExpressionEditorTreeNode[],
  context: CompletionContext | undefined,
): ExpressionEditorTreeNode[] {
  return useMemo(() => {
    if (!editor || !context) {
      return [];
    }

    const segments = ExpressionEditorParserBuiltin.toSegments(
      context.textBefore,
    );

    if (!segments) {
      return [];
    }

    const prunedVariableTree = ExpressionEditorTreeHelper.pruning({
      tree: variableTree,
      segments,
    });

    return prunedVariableTree;
  }, [editor, variableTree, context]);
}

export { useDrillVariableTree };
