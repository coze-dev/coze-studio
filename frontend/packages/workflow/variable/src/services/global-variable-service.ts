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
import { isArray } from 'lodash-es';
import { inject, injectable, postConstruct, preDestroy } from 'inversify';
import {
  ASTFactory,
  type ASTNodeJSON,
  type PropertyJSON,
  type Scope,
  VariableEngine,
} from '@flowgram-adapter/free-layout-editor';
import { DisposableCollection, Emitter } from '@flowgram-adapter/common';
import {
  VariableChannel,
  VariableConnector,
  type Variable as GlobalVariableType,
} from '@coze-arch/bot-api/memory';
import { MemoryApi } from '@coze-arch/bot-api';

import { safeJSONParse } from '../utils/json';
import {
  GlobalVariableKey,
  allGlobalVariableKeys,
  GLOBAL_VARIABLE_SCOPE_ID,
} from '../constants';

type FetchGlobalVariablesType = Partial<
  Record<GlobalVariableKey, PropertyJSON[]>
>;

interface GlobalVariableTreeNode {
  name?: string;
  type?: string;
  schema?: GlobalVariableTreeNode;
  readonly?: boolean;
}

export interface State {
  type?: 'project' | 'bot';
  id?: string;
}

@injectable()
export class GlobalVariableService {
  @inject(VariableEngine) variableEngine: VariableEngine;

  protected onLoadedEmitter = new Emitter<void>();
  protected onBeforeLoadEmitter = new Emitter<void>();

  protected toDispose = new DisposableCollection();

  protected globalScope: Scope;

  protected connectorTypeMapping = {
    bot: VariableConnector.Bot,
    project: VariableConnector.Project,
  };

  protected variableChannelMapping = {
    [GlobalVariableKey.System]: VariableChannel.System,
    [GlobalVariableKey.User]: VariableChannel.Custom,
    [GlobalVariableKey.App]: VariableChannel.APP,
  };

  onLoaded = this.onLoadedEmitter.event;

  onBeforeLoad = this.onBeforeLoadEmitter.event;

  protected _state: State = {};

  get state(): State {
    return this._state;
  }

  /**
   * Pull the latest variable data
   */
  protected async fetchGlobalVariableMetas(
    connectorType: 'project' | 'bot',
    connectorId?: string,
  ): Promise<FetchGlobalVariablesType> {
    try {
      const res = await MemoryApi.GetMemoryVariableMeta({
        ConnectorID: connectorId,
        ConnectorType: this.connectorTypeMapping[connectorType],
      });

      return {
        [GlobalVariableKey.System]: this.parseGlobalVariableList(
          res?.VariableMap?.[VariableChannel.System],
        ),
        [GlobalVariableKey.App]: this.parseGlobalVariableList(
          res?.VariableMap?.[VariableChannel.APP],
        ),
        [GlobalVariableKey.User]: this.parseGlobalVariableList(
          res?.VariableMap?.[VariableChannel.Custom],
        ),
      };
    } catch (err) {
      console.error(err);

      return Promise.resolve({});
    }
  }

  _latestFetchId = 0;

  /**
   * trigger refresh event
   */
  async loadGlobalVariables(
    connectorType: 'project' | 'bot',
    connectorId?: string,
  ) {
    if (!connectorId) {
      return;
    }

    const fetchId = ++this._latestFetchId;

    this._state = Object.assign(this._state, {
      type: connectorType,
      id: connectorId,
    });

    this.onBeforeLoadEmitter.fire();

    const res = await this.fetchGlobalVariableMetas(connectorType, connectorId);

    // If there is a new request, the result will be discarded directly.
    if (fetchId !== this._latestFetchId) {
      return;
    }

    // Sync the latest variable data to AST
    allGlobalVariableKeys.forEach(_key => {
      if (!res[_key]?.length) {
        this.globalScope.ast.remove(_key);
        return;
      }

      this.globalScope.ast.set(
        _key,
        ASTFactory.createVariableDeclaration({
          key: _key,
          type: ASTFactory.createObject({
            properties: (res[_key] || []).filter(Boolean),
          }),
        }),
      );
    });

    this.onLoadedEmitter.fire();
  }

  @postConstruct()
  init() {
    this.globalScope = this.variableEngine.createScope(
      GLOBAL_VARIABLE_SCOPE_ID,
    );
  }

  protected parseGlobalVariableList(
    vList?: GlobalVariableType[],
  ): PropertyJSON[] {
    if (!vList?.length) {
      return [];
    }

    return vList.map(_v =>
      this.createASTPropertyFromGlobalVariableSchema({
        name: _v.Keyword,
        readonly: _v.IsReadOnly,
        ...safeJSONParse(_v.Schema),
      }),
    );
  }

  protected createASTPropertyFromGlobalVariableSchema(
    globalVariable: GlobalVariableTreeNode,
  ): PropertyJSON {
    const { name, readonly, type, schema } = globalVariable;

    return ASTFactory.createProperty({
      key: name || '',
      meta: { readonly },
      type: this.createASTTypeFromGlobalVariableType(type || '', schema),
    });
  }

  protected createASTTypeFromGlobalVariableType(
    type: string,
    schema?: GlobalVariableTreeNode,
  ): ASTNodeJSON | undefined {
    // Reference Agreement:
    switch (type) {
      case 'string':
        return ASTFactory.createString();
      case 'boolean':
        return ASTFactory.createBoolean();
      case 'integer':
        return ASTFactory.createInteger();
      case 'float':
      case 'number': // Number is historical data, standard is float
        return ASTFactory.createNumber();

      case 'object':
        return ASTFactory.createObject({
          properties: isArray(schema)
            ? schema.map(_schema =>
                this.createASTPropertyFromGlobalVariableSchema(_schema),
              )
            : [],
        });

      case 'list':
        return ASTFactory.createArray({
          items: this.createASTTypeFromGlobalVariableType(
            schema?.type || '',
            schema?.schema,
          ),
        });

      default:
        return;
    }
  }

  @preDestroy()
  dispose() {
    this.toDispose.dispose();
    this.onLoadedEmitter.dispose();
  }
}
