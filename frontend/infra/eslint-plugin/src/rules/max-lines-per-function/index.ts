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
 * 为什么需要这个判断，对于下面这种函数
 * ```
 * var obj1 = {
 *  set
 *  foo
 *  ( val: any ) {
 *    this.foo = val;
 *    }
 * }
 *```
 * 如果不采用下面这个判断，函数判断将得到3，实际应该为5.  类似的还有
 * ```
 * //如果不采用下面这个判断，函数判断将得到3，实际应该为8
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
 * Q：为什么不直接用 node.id.value获取函数名称 ?
 * A：这种方式对于 传统的函数写法没问题，但是对于
 *  const tips = {
 *     fun: () => {}
 *    };
 *   或者
 *   const fun2 = () => {}
 *  方式书写函数得到的名称为null，所以采取下面这种方式获取，
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
    //TODO： CallExpression 场景较为复杂，目前应该没有完全覆盖
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

      // 针对函数声明，函数表达式，箭头函数，函数定义四种类型
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
