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

import { uniq } from 'lodash-es';
import { inject, injectable, postConstruct } from 'inversify';
import {
  type Scope,
  VariableEngine,
  VariableFieldKeyRenameService,
  type ObjectType,
} from '@flowgram-adapter/free-layout-editor';
import { FlowNodeFormData } from '@flowgram-adapter/free-layout-editor';
import { type FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import { Disposable, DisposableCollection } from '@flowgram-adapter/common';
import { type ViewVariableMeta } from '@coze-workflow/base/types';

import { WorkflowVariableFacade } from './workflow-variable-facade';
import { traverseUpdateRefExpressionByRename } from './utils/traverse-refs';
import { getByNamePath } from './utils/name-path';
import { type GetKeyPathCtx, type WorkflowVariableField } from './types';

/**
 * Engine internal interface, wrapping variable appearance interface for Coze Workflow
 */
@injectable()
export class WorkflowVariableFacadeService {
  protected readonly cache: WeakMap<
    WorkflowVariableField,
    WorkflowVariableFacade
  > = new WeakMap();

  @inject(VariableEngine) public variableEngine: VariableEngine;
  @inject(VariableFieldKeyRenameService)
  public fieldRenameService: VariableFieldKeyRenameService;

  @postConstruct()
  init() {
    // Variable reference rename, ensure that the node UI is not rendered when the variable reference is also renamed
    this.fieldRenameService.onRename(({ before, after }) => {
      // covered nodes
      const coverNodes: FlowNodeEntity[] = uniq(
        before.scope.coverScopes.map(_scope => _scope.meta?.node),
      );
      // All variables referenced in the override node form are updated
      coverNodes.forEach(_node => {
        const formData = _node.getData(FlowNodeFormData);
        const fullData = formData.formModel.getFormItemValueByPath('/');
        if (fullData) {
          traverseUpdateRefExpressionByRename(
            fullData,
            {
              before,
              after,
            },
            {
              onDataRenamed: () => {
                // Rename triggers the current node form onChange
                formData.fireChange();
              },
              node: _node,
            },
          );
        }
      });
    });
  }

  /**
   * Find the Facade of a Variable by Its AST
   * @param field
   * @returns
   */
  getVariableFacadeByField(
    field: WorkflowVariableField,
  ): WorkflowVariableFacade {
    const cache = this.cache.get(field);
    if (cache) {
      return cache;
    }

    // Create a new facade corresponding to this variable.
    const facade = new WorkflowVariableFacade(field, this);

    // Deleted node, clear its cache
    field.toDispose.push(
      Disposable.create(() => {
        this.cache.delete(field);
      }),
    );

    this.cache.set(field, facade);
    return facade;
  }

  protected getVariableFieldByKeyPath(
    keyPath?: string[],
    ctx?: GetKeyPathCtx,
  ): WorkflowVariableField | undefined {
    if (!keyPath) {
      return;
    }

    return getByNamePath(keyPath, {
      ...(ctx || {}),
      variableEngine: this.variableEngine,
    });
  }

  /**
   * Find the appearance of a variable according to keyPath
   * @param keyPath
   * @returns
   */
  getVariableFacadeByKeyPath(
    keyPath?: string[],
    ctx?: GetKeyPathCtx,
  ): WorkflowVariableFacade | undefined {
    if (!keyPath) {
      return;
    }

    const field = this.getVariableFieldByKeyPath(keyPath, ctx);
    if (field) {
      return this.getVariableFacadeByField(field);
    }
  }

  /**
   * @Deprecated Variable Destruction Partial Bad Case
   * - After the global variable is destroyed due to the switch Project, the variable reference will be set empty, resulting in the invalidation of the variable reference
   *
   * Listen variable removal
   */
  listenKeyPathDispose(
    keyPath?: string[],
    cb?: () => void,
    ctx?: GetKeyPathCtx,
  ) {
    const facade = this.getVariableFacadeByKeyPath(keyPath, ctx);

    if (facade) {
      // All Fields on the keyPath Link
      return facade.onDispose(cb);
    }

    return Disposable.create(() => null);
  }

  // Monitor type change
  listenKeyPathTypeChange(
    keyPath?: string[],
    cb?: (v?: ViewVariableMeta | null) => void,
    ctx?: GetKeyPathCtx,
  ) {
    const facade = this.getVariableFacadeByKeyPath(keyPath, ctx);

    if (facade) {
      const toDispose = new DisposableCollection();
      toDispose.pushAll([
        facade.onTypeChange(() => cb?.(facade.viewMeta)),
        facade.onDispose(() => cb?.()),
      ]);
      return toDispose;
    }

    return Disposable.create(() => null);
  }

  // Monitor arbitrary variable changes
  listenKeyPathVarChange(
    keyPath?: string[],
    cb?: (v?: ViewVariableMeta | null) => void,
    ctx?: GetKeyPathCtx,
  ) {
    const facade = this.getVariableFacadeByKeyPath(keyPath, ctx);

    if (facade) {
      const toDispose = new DisposableCollection();
      toDispose.pushAll([
        facade.onDataChange(() => cb?.(facade.viewMeta)),
        facade.onDispose(() => cb?.()),
      ]);
      return toDispose;
    }

    return Disposable.create(() => null);
  }

  // Get all VariableFacades on Scope by Scope
  getVariableFacadesByScope(scope: Scope): WorkflowVariableFacade[] {
    return scope.output.variables
      .map(_variable => {
        const properties = (_variable.type as ObjectType)?.properties || [];
        return properties.map(_property =>
          this.getVariableFacadeByField(_property),
        );
      })
      .flat();
  }
}
