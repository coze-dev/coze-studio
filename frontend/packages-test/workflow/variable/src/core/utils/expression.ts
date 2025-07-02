import { intersection } from 'lodash-es';
import {
  type ASTNode,
  type BaseVariableField,
  type BaseExpression,
  ASTNodeFlags,
} from '@flowgram-adapter/free-layout-editor';

// 获取所有的子 AST 节点
export function getAllChildren(ast: ASTNode): ASTNode[] {
  return [
    ...ast.children,
    ...ast.children.map(_child => getAllChildren(_child)).flat(),
  ];
}

// 获取父 Fields
export function getParentFields(ast: ASTNode): BaseVariableField[] {
  let curr = ast.parent;
  const res: BaseVariableField[] = [];

  while (curr) {
    if (curr.flags & ASTNodeFlags.VariableField) {
      res.push(curr as BaseVariableField);
    }
    curr = curr.parent;
  }

  return res;
}

// 获取所有子 AST 引用的变量
export function getAllRefs(ast: ASTNode): BaseVariableField[] {
  return getAllChildren(ast)
    .filter(_child => _child.flags & ASTNodeFlags.Expression)
    .map(_child => (_child as BaseExpression).refs)
    .flat()
    .filter(Boolean) as BaseVariableField[];
}

/**
 * 检测是否成环
 * @param curr 当前表达式
 * @param refNode 引用的变量节点
 * @returns 是否成环
 */
export function checkRefCycle(
  curr: BaseExpression,
  refNodes: (BaseVariableField | undefined)[],
): boolean {
  // 作用域没有成环，则不可能成环
  if (
    intersection(
      curr.scope.coverScopes,
      refNodes.map(_ref => _ref?.scope).filter(Boolean),
    ).length === 0
  ) {
    return false;
  }

  // BFS 遍历
  const visited = new Set<BaseVariableField>();
  const queue = [...refNodes];

  while (queue.length) {
    const currNode = queue.shift();
    if (!currNode) {
      continue;
    }
    visited.add(currNode);

    for (const ref of getAllRefs(currNode).filter(_ref => !visited.has(_ref))) {
      queue.push(ref);
    }
  }

  // 引用的变量中，包含表达式的父变量，则成环
  return intersection(Array.from(visited), getParentFields(curr)).length > 0;
}
