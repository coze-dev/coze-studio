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
  type BaseType,
  KeyPathExpression,
  type CreateASTParams,
  type VariableFieldKeyRenameService,
  type BaseVariableField,
  type ASTNodeJSON,
  ASTKind,
  type KeyPathExpressionJSON,
} from '@flowgram-adapter/free-layout-editor';
import { Disposable } from '@flowgram-adapter/common';

import { getViewVariableTypeByAST } from '../utils/parse-ast';
import { getByNamePath } from '../utils/name-path';
import { checkRefCycle, getParentFields } from '../utils/expression';
import { createASTFromType } from '../utils/create-ast';
import { type WorkflowVariableField } from '../types';
import { ViewVariableType } from '../../typings';

export interface RefExpressionJSON extends KeyPathExpressionJSON {
  rawMeta?: {
    type?: ViewVariableType;
  };
}

/**
 * Business redefines how KeyPath is implemented
 */
export class CustomKeyPathExpression extends KeyPathExpression<RefExpressionJSON> {
  get renameService(): VariableFieldKeyRenameService {
    return this.opts.renameService;
  }

  _rawMeta?: RefExpressionJSON['rawMeta'];

  /**
   * Overloading the getRefFields method
   * @returns
   */
  getRefFields(): WorkflowVariableField[] {
    const ref = getByNamePath(this._keyPath, {
      variableEngine: this.scope.variableEngine,
      node: this.scope.meta?.node,
    });

    // When refreshing the reference, the circular reference is detected, and the variable is not referenced if there is a circular reference
    if (checkRefCycle(this, [ref])) {
      // Prompt for a circular reference
      console.warn(
        '[CustomKeyPathExpression] checkRefCycle: Reference Cycle Existed',
        getParentFields(this)
          .map(_field => _field.key)
          .reverse(),
      );
      return [];
    }

    return ref ? [ref] : [];
  }

  fromJSON(json: RefExpressionJSON): void {
    if (json.rawMeta?.type !== this._rawMeta?.type) {
      this._rawMeta = json.rawMeta;
      this.refreshReturnType();
      this.fireChange();
    }

    super.fromJSON(json);
  }

  // Generate new returnType nodes directly instead of directly reusing them
  // Make sure that different keypaths do not point to the same Field.
  _returnType: BaseType;

  get returnType() {
    return this._returnType;
  }

  getReturnTypeJSONByRef(
    _ref: BaseVariableField | undefined,
  ): ASTNodeJSON | undefined {
    return _ref?.type?.toJSON();
  }

  refreshReturnType() {
    const [ref] = this._refs;

    const updateTypeByRef = () => {
      if (this.prevRefTypeHash !== ref?.type?.hash) {
        this.prevRefTypeHash = ref?.type?.hash;
        this.updateChildNodeByKey(
          '_returnType',
          this.getReturnTypeJSONByRef(ref),
        );
      }
    };

    if (this._rawMeta?.type) {
      const shouldUseRawMeta =
        // 1. When no variable is referenced, use the type of rawMeta
        !ref ||
        // 2. Non-Object and Array < Object >, using the type of rawMeta
        !ViewVariableType.canDrilldown(this._rawMeta.type) ||
        // 3. If it is a drillable type, you need to determine whether the referenced variable type is the same as the type of rawMeta. If it is inconsistent, use the data of rawMeta
        getViewVariableTypeByAST(ref.type).type !== this._rawMeta.type;

      if (shouldUseRawMeta) {
        this.updateChildNodeByKey(
          '_returnType',
          createASTFromType(this._rawMeta.type),
        );
        return;
      }
    }

    updateTypeByRef();
  }

  toJSON(): ASTNodeJSON {
    return {
      kind: this.kind,
      keyPath: this._keyPath,
      rawMeta: this._rawMeta,
    };
  }

  protected prevRefTypeHash: string | undefined;

  constructor(
    params: CreateASTParams,
    opts: { renameService: VariableFieldKeyRenameService },
  ) {
    super(params, opts);
    // do nothing

    const subscription = this.refs$.subscribe(_type => {
      this.refreshReturnType();
    });

    this.toDispose.pushAll([
      Disposable.create(() => subscription.unsubscribe()),
      // When the current reference is renamed, refresh the reference
      this.renameService.onRename(({ before, after }) => {
        const field = this.refs?.[0];

        if (!field) {
          return;
        }

        const allFields = field.parentFields.reverse().concat(field);
        const changedIndex = allFields.indexOf(before);

        if (changedIndex >= 0) {
          this._keyPath[changedIndex] = after.key;
          this.refreshRefs();
        }
      }),
    ]);
  }
}

export const createRefExpression = (json: RefExpressionJSON) => ({
  kind: ASTKind.KeyPathExpression,
  ...json,
});
