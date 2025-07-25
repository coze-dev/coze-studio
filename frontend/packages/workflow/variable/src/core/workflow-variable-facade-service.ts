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
 * 引擎内部接口，针对 Coze Workflow 封装变量外观接口
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
    // 变量引用 rename, 确保节点 UI 不渲染时也 rename 变量引用
    this.fieldRenameService.onRename(({ before, after }) => {
      // 覆盖的节点
      const coverNodes: FlowNodeEntity[] = uniq(
        before.scope.coverScopes.map(_scope => _scope.meta?.node),
      );
      // 所有覆盖节点表单中引用的变量更新
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
                // rename 触发当前节点表单 onChange
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
   * 根据变量的 AST 查找其 Facade
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

    // 新建该变量对应的 Facade
    const facade = new WorkflowVariableFacade(field, this);

    // 被删除的节点，清空其缓存
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
   * 根据 keyPath 找到变量的外观
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
   * @deprecated 变量销毁存在部分 Bad Case
   * - 全局变量因切换 Project 销毁后，变量引用会被置空，导致变量引用失效
   *
   * 监听变量删除
   */
  listenKeyPathDispose(
    keyPath?: string[],
    cb?: () => void,
    ctx?: GetKeyPathCtx,
  ) {
    const facade = this.getVariableFacadeByKeyPath(keyPath, ctx);

    if (facade) {
      // 所有在 keyPath 链路上的 Field
      return facade.onDispose(cb);
    }

    return Disposable.create(() => null);
  }

  // 监听类型变化
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

  // 监听任意变量变化
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

  // 根据 Scope 获取 Scope 上所有的 VariableFacade
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
