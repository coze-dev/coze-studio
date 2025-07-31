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

import { ExpressionEditorParserBuiltin } from '../core/parser';
import {
  ExpressionEditorSegmentType,
  ExpressionEditorTreeHelper,
  type ExpressionEditorTreeNode,
} from '../core';

function validateExpression(source: string, tree: ExpressionEditorTreeNode[]) {
  const segments = ExpressionEditorParserBuiltin.toSegments(source);

  if (!segments) {
    return false;
  }

  if (
    segments[segments.length - 1].type === ExpressionEditorSegmentType.EndEmpty
  ) {
    return false;
  }

  // 2. segments mix variable tree, match tree branch
  const treeBranch = ExpressionEditorTreeHelper.matchTreeBranch({
    tree,
    segments,
  });
  if (!treeBranch) {
    return false;
  }

  // 3. if full segments path could match one tree branch, the pattern is valid
  return true;
}

export { validateExpression };
