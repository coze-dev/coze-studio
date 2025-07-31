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

import React, { startTransition, useEffect } from 'react';

import { VariableEngine } from '@flowgram-adapter/free-layout-editor';
import { FlowNodeFormData } from '@flowgram-adapter/free-layout-editor';
import { useRefresh, useService } from '@flowgram-adapter/free-layout-editor';
import { Tag, Tree } from '@douyinfe/semi-ui';
import { ViewVariableType } from '@coze-workflow/base/types';

import { getViewVariableTypeByAST } from '../../core/utils/parse-ast';
import { type WorkflowVariableField } from '../../core/types';
import { isGlobalVariableKey } from '../../constants';

const getRootFieldTitle = (field: WorkflowVariableField) => {
  if (isGlobalVariableKey(field.key)) {
    return 'Global';
  }

  return field.scope.meta?.node
    ?.getData(FlowNodeFormData)
    ?.formModel?.getFormItemValueByPath('/nodeMeta')?.title;
};

const getTreeDataByField = (field: WorkflowVariableField, path = '/') => {
  const { type, childFields } = getViewVariableTypeByAST(field.type);

  const currTreeKey = `${path}${field.key}/`;

  const isRoot = path === '/';

  const tag = isRoot
    ? getRootFieldTitle(field)
    : type && ViewVariableType.getLabel(type);

  return {
    key: currTreeKey,
    label: (
      <>
        {field.key}
        <Tag
          style={{ marginLeft: 5 }}
          size="small"
          color={isRoot ? 'violet' : 'light-blue'}
        >
          {tag}
        </Tag>
      </>
    ),
    children: childFields?.map(_child =>
      getTreeDataByField(_child, currTreeKey),
    ),
  };
};

export const VariableDebugPanel = (): JSX.Element => {
  const variableEngine: VariableEngine = useService(VariableEngine);

  const refresh = useRefresh();
  const { variables } = variableEngine.globalVariableTable;
  const treeData = variables.map(_v => getTreeDataByField(_v));

  useEffect(() => {
    const subscription = variableEngine.globalEvent$.subscribe(_v => {
      startTransition(() => {
        refresh();
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div style={{ minWidth: 350, maxHeight: 500, overflowY: 'auto' }}>
      <p>Debug panel for variable, only visible in BOE. </p>
      <Tree showLine={true} treeData={treeData} autoExpandParent />
    </div>
  );
};
