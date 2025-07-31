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

/* eslint-disable complexity */
/* eslint-disable security/detect-object-injection */
import { uniq } from 'lodash-es';
import {
  FlowNodeVariableData,
  type VariableEngine,
} from '@flowgram-adapter/free-layout-editor';

import { type GetKeyPathCtx, type WorkflowVariableField } from '../types';
import { isGlobalVariableKey } from '../../constants';

export function getByNamePath(
  namePath: string[],
  {
    variableEngine,
    node,
    checkScope,
  }: { variableEngine: VariableEngine } & GetKeyPathCtx,
): WorkflowVariableField | undefined {
  const nodeId = namePath[0];

  if (isGlobalVariableKey(nodeId)) {
    return variableEngine.globalVariableTable.getByKeyPath(namePath);
  }

  const subPath = namePath.slice(1);

  const nodeDepScopes = uniq([
    ...(node?.getData(FlowNodeVariableData)?.public?.depScopes || []),
    ...(node?.getData(FlowNodeVariableData)?.private?.depScopes || []),
  ]);

  // Is there a private nodeId in the node's dependency scope?
  if (nodeDepScopes?.find(_scope => _scope.id === `${nodeId}_private`)) {
    return variableEngine.globalVariableTable.getByKeyPath([
      `${nodeId}.locals`,
      ...subPath,
    ]);
  }

  // Does the node's dependency scope have a public nodeId?
  if (nodeDepScopes?.find(_scope => _scope.id === `${nodeId}`)) {
    return variableEngine.globalVariableTable.getByKeyPath([
      `${nodeId}.outputs`,
      ...subPath,
    ]);
  }

  // If the business verification is in scope, return the result directly if it is not in scope
  if (checkScope) {
    return;
  }

  return (
    variableEngine.globalVariableTable.getByKeyPath([
      `${nodeId}.outputs`,
      ...subPath,
    ]) ||
    variableEngine.globalVariableTable.getByKeyPath([
      `${nodeId}.locals`,
      ...subPath,
    ])
  );
}

export function getNamePathByField(field: WorkflowVariableField) {
  return field.parentFields
    .reverse()
    .map((_field, idx) => {
      if (idx === 0) {
        return _field.key.split('.')[0];
      }
      return _field.key;
    })
    .concat([field.key]);
}

export function matchPath(target: string[], source: string[]) {
  return target.every((_path, idx) => _path === source[idx]);
}
