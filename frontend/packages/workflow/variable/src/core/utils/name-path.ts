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

  // 节点的依赖作用域中是否存在 nodeId 的 private
  if (nodeDepScopes?.find(_scope => _scope.id === `${nodeId}_private`)) {
    return variableEngine.globalVariableTable.getByKeyPath([
      `${nodeId}.locals`,
      ...subPath,
    ]);
  }

  // 节点的依赖作用域是否存在 nodeId 的 public
  if (nodeDepScopes?.find(_scope => _scope.id === `${nodeId}`)) {
    return variableEngine.globalVariableTable.getByKeyPath([
      `${nodeId}.outputs`,
      ...subPath,
    ]);
  }

  // 如果业务验证是否在作用域内，不在作用域内直接返回结果
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
