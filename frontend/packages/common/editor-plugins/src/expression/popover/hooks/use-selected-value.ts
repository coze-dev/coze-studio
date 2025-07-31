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

import { ExpressionEditorParserBuiltin } from '../../core/parser';
import {
  ExpressionEditorTreeHelper,
  type ExpressionEditorTreeNode,
} from '../../core';

function useSelectedValue(
  interpolationText: string | undefined,
  variableTree: ExpressionEditorTreeNode[],
) {
  return useMemo(() => {
    if (!interpolationText) {
      return;
    }

    const segments =
      ExpressionEditorParserBuiltin.toSegments(interpolationText);

    if (!segments) {
      return;
    }

    const treeBrach = ExpressionEditorTreeHelper.matchTreeBranch({
      tree: variableTree,
      segments,
    });

    if (!treeBrach) {
      return;
    }

    return treeBrach[treeBrach.length - 1];
  }, [interpolationText, variableTree]);
}

export { useSelectedValue };
