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
import { last } from 'lodash-es';
import { ASTKind, type ASTNode } from '@flowgram-adapter/free-layout-editor';
import { FlowNodeFormData } from '@flowgram-adapter/free-layout-editor';
import { type FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import {
  DisposableCollection,
  type Disposable,
} from '@flowgram-adapter/common';
import {
  type ViewVariableType,
  type VariableMetaDTO,
  type ViewVariableMeta,
  VARIABLE_TYPE_ALIAS_MAP,
  ValueExpressionDTO,
} from '@coze-workflow/base/types';

import { variableUtils } from '../legacy/variable-utils';
import { type GlobalVariableKey, isGlobalVariableKey } from '../constants';
import { WORKFLOW_VARIABLE_SOURCE, GLOBAL_VAR_ALIAS_MAP } from '../constants';
import { type WorkflowVariableFacadeService } from './workflow-variable-facade-service';
import {
  getViewVariableByField,
  getViewVariableTypeByAST,
  getViewVariableTWithUniqKey,
} from './utils/parse-ast';
import { getNamePathByField } from './utils/name-path';
import { type RenameInfo, type WorkflowVariableField } from './types';

export class WorkflowVariableFacade {
  protected _fieldVersion: number;
  protected _variableMeta: ViewVariableMeta | undefined;
  protected _keyPath: string[];

  constructor(
    public readonly field: WorkflowVariableField,
    protected readonly _facadeService: WorkflowVariableFacadeService,
  ) {
    // do nothing
  }

  // Get the variableMeta structure
  get viewMeta(): ViewVariableMeta | undefined {
    if (this._fieldVersion !== this.field.version) {
      this._variableMeta = getViewVariableByField(this.field);
    }

    return this._variableMeta;
  }

  get viewMetaWithUniqKey(): ViewVariableMeta | undefined {
    return getViewVariableTWithUniqKey(this.viewMeta, this.field.parent?.key);
  }

  get viewType(): ViewVariableType | undefined {
    return getViewVariableTypeByAST(this.field.type)?.type;
  }

  get renderType(): JSX.Element | string | undefined {
    if (!this.viewType) {
      return 'Unknown';
    }
    return VARIABLE_TYPE_ALIAS_MAP[this.viewType];
  }

  get key(): string {
    return this.field.key;
  }

  get children(): WorkflowVariableFacade[] {
    const { childFields } = getViewVariableTypeByAST(this.field.type);

    return (childFields || []).map(_field =>
      this._facadeService.getVariableFacadeByField(_field),
    );
  }

  get parentVariables(): WorkflowVariableFacade[] {
    const { parentFields } = this.field;
    return parentFields
      .reverse()
      .map(_field => this._facadeService.getVariableFacadeByField(_field));
  }

  get dtoMeta(): VariableMetaDTO | undefined {
    return this.viewMeta
      ? variableUtils.viewMetaToDTOMeta(this.viewMeta)
      : undefined;
  }

  get expressionPath(): {
    source: string;
    keyPath: string[];
  } {
    return {
      source: this.globalVariableKey ?? WORKFLOW_VARIABLE_SOURCE,
      keyPath: this.keyPath,
    };
  }

  get groupInfo(): {
    label: string;
    key: string;
    icon: string;
  } {
    if (this.globalVariableKey) {
      return {
        key: this.globalVariableKey,
        label: GLOBAL_VAR_ALIAS_MAP[this.globalVariableKey],
        // Global variable icon no url
        icon: '',
      };
    }

    const DEFAULT_NODE_META_PATH = '/nodeMeta';
    const formData = this.node?.getData<FlowNodeFormData>(FlowNodeFormData);
    const nodeMeta = formData.formModel.getFormItemValueByPath<{
      title: string;
      icon: string;
      description: string;
      subTitle?: string;
    }>(DEFAULT_NODE_META_PATH);

    return {
      key: this.node?.id ?? '',
      label: nodeMeta?.title ?? '',
      icon: nodeMeta?.icon ?? '',
    };
  }

  get refExpressionDTO(): ValueExpressionDTO {
    const { dtoMeta } = this;

    if (!dtoMeta) {
      return ValueExpressionDTO.createEmpty();
    }

    return {
      type: dtoMeta.type,
      schema: dtoMeta.schema,
      assistType: dtoMeta.assistType,
      value: {
        type: 'ref',
        content: {
          source: 'block-output',
          blockID: this.keyPath[0] || '',
          name: this.keyPath.slice(1).join('.'),
        },
      },
    };
  }

  // The node where the current variable is located
  get node(): FlowNodeEntity {
    return this.field.scope.meta?.node;
  }

  get globalVariableKey(): GlobalVariableKey | undefined {
    const lastField = last(this.field.parentFields);

    if (lastField?.key && isGlobalVariableKey(lastField?.key)) {
      return lastField?.key as GlobalVariableKey;
    }

    return;
  }

  // Get the keyPath path
  get keyPath(): string[] {
    if (!this._keyPath) {
      this._keyPath = getNamePathByField(this.field);
    }
    return this._keyPath;
  }

  // Whether the corresponding node can access it
  canAccessByNode(nodeId: string) {
    return !!this.field.scope.coverScopes.find(_scope => _scope.id === nodeId);
  }

  /**
   * @Deprecated Variable Destruction Partial Bad Case
   * - After the global variable is destroyed due to the switch Project, the variable reference will be set empty, resulting in the invalidation of the variable reference
   *
   * Listen variable removal
   */
  onDispose(cb?: () => void): Disposable {
    const toDispose = new DisposableCollection();

    // Delete the callback only once
    let cbCalled = false;
    const cbOnce = () => {
      if (!cbCalled) {
        cbCalled = true;
        cb?.();
      }
    };

    const allASTs: ASTNode[] = [this.field];
    let curr = this.field.parent;
    while (curr) {
      allASTs.push(curr);
      curr = curr.parent;
    }

    toDispose.pushAll([
      // Traverse All Dispose Cases Except Rename
      this._facadeService.fieldRenameService.onDisposeInList(_disposeField => {
        if (allASTs.includes(_disposeField)) {
          cbOnce();
        }
      }),
      this.field.scope.event.on('DisposeAST', ({ ast }) => {
        if (
          ast &&
          // TODO Object deletion may also be caused by Rename and needs to be re-judged.
          [ASTKind.VariableDeclarationList].includes(ast?.kind as ASTKind) &&
          allASTs.includes(ast)
        ) {
          cbOnce();
        }
      }),
    ]);

    return toDispose;
  }

  onRename(cb?: (params: RenameInfo) => void): Disposable {
    const allFields = this.field.parentFields.reverse().concat(this.field);

    return this._facadeService.fieldRenameService.onRename(
      ({ before, after }) => {
        const changedIndex = allFields.indexOf(before);

        if (changedIndex >= 0) {
          const nextKeyPath = [...this.keyPath];
          nextKeyPath[changedIndex] = after.key;

          const _info = {
            prevKeyPath: this._keyPath,
            nextKeyPath,
            modifyIndex: changedIndex,
            modifyKey: after.key,
          };

          cb?.(_info);
        }
      },
    );
  }

  onTypeChange(cb?: (facade: WorkflowVariableFacade) => void): Disposable {
    return this.field.subscribe(() => cb?.(this), {
      // onTypeChange is only triggered when the type of the current level changes
      selector: field => {
        const { type } = getViewVariableTypeByAST(field.type);
        return type;
      },
    });
  }

  onDataChange(cb?: (facade: WorkflowVariableFacade) => void): Disposable {
    return this.field.subscribe(() => cb?.(this));
  }
}
