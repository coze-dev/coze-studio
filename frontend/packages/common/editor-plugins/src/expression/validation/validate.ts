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
