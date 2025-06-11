import ruleComposer from 'eslint-rule-composer';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import reactPlugin from 'eslint-plugin-react';

const originRule = reactPlugin.rules['jsx-no-leaked-render'];

// 扩展react/jsx-no-leaked-render。增加判断 「&&」 表达式左边为 boolean 、 null 、 undefined TS类型，则不报错。
export const tsxNoLeakedRender = ruleComposer.filterReports(
  originRule,
  problem => {
    const { parent } = problem.node;
    // 如果表达式是用于jsx属性，则不需要修复。 如 <Comp prop={ { foo: 1 } && obj } />
    if (
      parent?.type === AST_NODE_TYPES.JSXExpressionContainer &&
      parent?.parent?.type === AST_NODE_TYPES.JSXAttribute
    ) {
      return false;
    }

    return true;
  },
);
