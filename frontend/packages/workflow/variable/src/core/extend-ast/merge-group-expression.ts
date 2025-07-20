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
 
/* eslint-disable @typescript-eslint/naming-convention */
import {
  ASTKind,
  type ASTNodeJSON,
  BaseExpression,
  type BaseType,
  type BaseVariableField,
  postConstructAST,
} from '@flowgram-adapter/free-layout-editor';

export enum MergeStrategy {
  FirstNotEmpty = 'FirstNotEmpty',
}

export interface MergeGroupExpressionJSON {
  mergeStrategy?: MergeStrategy;
  expressions?: ASTNodeJSON[];
}

export class MergeGroupExpression extends BaseExpression {
  static kind = 'MergeGroupExpression';

  protected _mergeStrategy: MergeStrategy = MergeStrategy.FirstNotEmpty;

  protected _expressions: BaseExpression[] = [];

  protected _returnType: BaseType | undefined;

  protected _error: string | false = false;

  get error(): string | false {
    return this._error;
  }

  get returnType(): BaseType | undefined {
    return this._returnType;
  }

  getRefFields(): (BaseVariableField | undefined)[] {
    return [];
  }

  fromJSON(json: MergeGroupExpressionJSON): void {
    const {
      // 默认使用“首个非空”策略
      mergeStrategy = MergeStrategy.FirstNotEmpty,
      expressions = [],
    } = json || {};

    if (mergeStrategy !== this._mergeStrategy) {
      this._mergeStrategy = mergeStrategy;
      this.fireChange();
    }

    // 超出长度的 expressions 需要被销毁
    this._expressions.slice(expressions.length).forEach(_item => {
      _item.dispose();
      this.fireChange();
    });

    // 剩余 expressions 的处理
    this._expressions = expressions.map((_item, idx) => {
      const prevItem = this._expressions[idx];

      if (prevItem?.kind !== _item.kind) {
        prevItem?.dispose();
        this.fireChange();
        return this.createChildNode(_item);
      }

      prevItem.fromJSON(_item);
      return prevItem;
    });
  }

  // 获取聚合变量的类型
  protected syncReturnType(): ASTNodeJSON | undefined {
    if (this._mergeStrategy === MergeStrategy.FirstNotEmpty) {
      const nextTypeJSON = this._expressions[0]?.returnType?.toJSON();

      if (!nextTypeJSON?.kind) {
        return;
      }

      const nextWeakTypeJSON = this.getWeakTypeJSON(nextTypeJSON);

      for (const _expr of this._expressions.slice(1)) {
        const _returnType = _expr.returnType;

        // 该引用没有类型，则聚合类型为首个变量类型不下钻
        if (!_returnType) {
          return nextWeakTypeJSON;
        }

        // 该引用和第一个变量没有强一致，则聚合类型为首个变量类型不下钻
        if (!_returnType.isTypeEqual(nextTypeJSON)) {
          return nextWeakTypeJSON;
        }
      }

      return nextTypeJSON;
    }

    return;
  }

  getWeakTypeJSON(fullType?: ASTNodeJSON | undefined) {
    if (fullType?.kind === ASTKind.Object) {
      // Object 不下钻
      return { kind: ASTKind.Object, weak: true };
    }
    if (fullType?.kind === ASTKind.Array) {
      return { ...fullType, items: this.getWeakTypeJSON(fullType.items) };
    }
    return fullType;
  }

  @postConstructAST()
  init() {
    this.toDispose.pushAll([
      this.subscribe(
        () => {
          this.updateChildNodeByKey('_returnType', this.syncReturnType());
        },
        {
          triggerOnInit: true,
          selector: curr => [
            curr._mergeStrategy,
            // 表达式 hash 是否发生变更
            ...curr._expressions.map(_expr => _expr.hash),
          ],
        },
      ),
    ]);
  }

  toJSON() {
    return {
      kind: this.kind,
      mergeStrategy: this._mergeStrategy,
      expressions: this._expressions.map(_expr => _expr.toJSON()),
    };
  }
}

export const createMergeGroupExpression = (json: MergeGroupExpressionJSON) => ({
  kind: MergeGroupExpression.kind,
  ...json,
});
