import {
  ASTFactory,
  type ASTNodeJSON,
  type BaseVariableField,
} from '@flowgram-adapter/free-layout-editor';

import {
  CustomKeyPathExpression,
  type RefExpressionJSON,
} from './custom-key-path-expression';

/**
 * 遍历表达式，对列表进行遍历，获取遍历后的变量类型
 */
export class WrapArrayExpression extends CustomKeyPathExpression {
  static kind = 'WrapArrayExpression';

  getReturnTypeJSONByRef(
    _ref: BaseVariableField | undefined,
  ): ASTNodeJSON | undefined {
    return ASTFactory.createArray({
      items: _ref?.type?.toJSON(),
    });
  }

  toJSON() {
    return {
      kind: this.kind,
      keyPath: this._keyPath,
      rawMeta: this._rawMeta,
    };
  }
}

export const createWrapArrayExpression = ({
  keyPath,
  rawMeta,
}: RefExpressionJSON) => ({
  kind: WrapArrayExpression.kind,
  keyPath,
  rawMeta,
});
