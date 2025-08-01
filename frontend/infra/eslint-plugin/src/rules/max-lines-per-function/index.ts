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

import { Rule } from 'eslint';

const getStaticStringValue = node => {
  switch (node.type) {
    case 'Literal':
      return String(node.value);
    case 'TemplateLiteral':
      if (node.expressions.length === 0 && node.quasis.length === 1) {
        return node.quasis[0].value.cooked;
      }
      break;
    default:
      break;
  }

  return null;
};

/**
 *
 * @param node
 * @returns
 * Why is this judgment necessary for a function such as
 * ```
 * var obj1 = {
 *  set
 *  foo
 *  ( val: any ) {
 *    this.foo = val;
 *    }
 * }
 *```
 * If you don't use the following judgment, the function judgment will get 3, which should actually be 5. Similarly, there are
 * ```
 * //If the following judgment is not used, the function judgment will get 3, which should actually be 8ing judgment, the function judgment will get 3, which should actually be 8.
 * class A {
        static
        [
            foo +
                bar
        ]
        (a) {
            return a
        }
    }
 * ```
 */
const isEmbedded = node => {
  if (!node.parent) {
    return false;
  }
  if (node !== node.parent.value) {
    return false;
  }
  if (node.parent.type === 'MethodDefinition') {
    return true;
  }
  if (node.parent.type === 'Property') {
    return (
      node.parent.method === true ||
      node.parent.kind === 'get' ||
      node.parent.kind === 'set'
    );
  }
  return false;
};

/**
 *
 * @param node
 * @returns function name
 * Q: Why not get the function name directly with node.id?
 * A: This method is fine for traditional function writing, but for
 *  const tips = {
 *     fun: () => {}
 *    };
 *   or
 *   const fun2 = () => {}
 *  The name of the function written in the following way is null, so it is obtained in the following way.
 *
 */

const getFunctionNameWithKind = node => {
  const { parent } = node;
  const tokens: string[] = [];

  if (
    parent.type === 'MethodDefinition' ||
    parent.type === 'PropertyDefinition'
  ) {
    //  https://github.com/tc39/proposal-static-class-features
    if (parent.static) {
      tokens.push('static');
    }
    if (!parent.computed && parent.key.type === 'PrivateIdentifier') {
      tokens.push('private');
    }
  }
  if (node.async) {
    tokens.push('async');
  }
  if (node.generator) {
    tokens.push('generator');
  }

  checkParentType(node, parent, tokens);
  return tokens.join(' ');
};

const checkParentType = (node, parent, tokens) => {
  if (parent.type === 'Property' || parent.type === 'MethodDefinition') {
    if (parent.kind === 'constructor') {
      tokens.push('constructor');
      return;
    }
    if (parent.kind === 'get') {
      tokens.push('getter');
    } else if (parent.kind === 'set') {
      tokens.push('setter');
    } else {
      tokens.push('method');
    }
  } else if (parent.type === 'PropertyDefinition') {
    tokens.push('method');
  } else {
    if (node.type === 'ArrowFunctionExpression') {
      tokens.push('Arrow');
    }
    // VariableDeclarator
    tokens.push('function');
  }

  getParentNodeName(node, parent, tokens);
};

const getParentNodeName = (node, parent, tokens) => {
  if (
    parent.type === 'Property' ||
    parent.type === 'MethodDefinition' ||
    parent.type === 'PropertyDefinition' ||
    parent.type === 'CallExpression' ||
    parent.type === 'VariableDeclarator'
  ) {
    if (!parent.computed && parent?.key?.type === 'PrivateIdentifier') {
      tokens.push(`#${parent.key.name}`);
    } else {
      const name = getStaticPropertyName(parent);

      if (name !== null) {
        tokens.push(`'${name}'`);
      } else if (node.id) {
        tokens.push(`'${node.id.name}'`);
      }
    }
  } else if (node.id) {
    tokens.push(`'${node.id.name}'`);
  }
};

const getStaticPropertyName = node => {
  let prop;

  switch (node?.type) {
    case 'ChainExpression':
      return getStaticPropertyName(node.expression);

    case 'Property':
    case 'PropertyDefinition':
    case 'MethodDefinition':
      prop = node.key;
      break;

    case 'MemberExpression':
      prop = node.property;
      break;
    case 'VariableDeclarator':
      prop = node.id;
      break;
    //TODO: The CallExpression scenario is more complex and should not be fully covered at present
    case 'CallExpression':
      prop = node.callee;
      break;

    // no default
  }

  if (prop) {
    if (prop.type === 'Identifier' && !node.computed) {
      return prop.name;
    }

    return getStaticStringValue(prop);
  }
  return null;
};

export const maxLinePerFunctionRule: Rule.RuleModule = {
  meta: {
    docs: {
      description: 'Enforce a maximum number of lines of code in a function',
      recommended: false,
    },
    schema: [
      {
        type: 'object',
        properties: {
          max: {
            type: 'integer',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      exceed:
        '{{name}} has too many lines ({{lineCount}}). Maximum is {{maxLines}}.',
    },
  },

  create(context) {
    const options = context.options[0] || {};
    const maxLines = options.max || 150;

    function checkFunctionLength(funcNode) {
      const node = isEmbedded(funcNode) ? funcNode.parent : funcNode;

      // Four types of function declarations, function expressions, arrow functions, and function definitions
      if (
        node.type === 'FunctionDeclaration' ||
        node.type === 'FunctionExpression' ||
        node.type === 'ArrowFunctionExpression' ||
        node.type === 'MethodDefinition' ||
        node.type === 'Property'
      ) {
        const lineCount = node.loc.end.line - node.loc.start.line + 1;

        const name = getFunctionNameWithKind(node.value || node);
        if (lineCount > maxLines) {
          context.report({
            node,
            messageId: 'exceed',
            data: {
              name,
              lineCount: lineCount.toString(),
              maxLines: maxLines.toString(),
            },
          });
        }
      }
    }

    return {
      FunctionDeclaration: checkFunctionLength,
      FunctionExpression: checkFunctionLength,
      ArrowFunctionExpression: checkFunctionLength,
    };
  },
};
