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

/* eslint-disable @coze-arch/max-line-per-function */
import React, { type PropsWithChildren, useState } from 'react';

import { nanoid } from 'nanoid';
import { cloneDeep } from 'lodash-es';
import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { type TreeNodeData } from '@coze-arch/bot-semi/Tree';
import { Toast, Tree } from '@coze-arch/bot-semi';

import { findCustomTreeNodeDataResult, formatTreeData } from './utils/utils';
import { traverse } from './utils/traverse';
import { ParamTypeAlias } from './types';
import type { ParametersProps } from './types';
import ConfigContext from './context/config-context';
import Header from './components/header';
import {
  type TreeNodeCustomData,
  type ActiveMultiInfo,
} from './components/custom-tree-node/type';
import { ChangeMode } from './components/custom-tree-node/constants';
import CustomTreeNode from './components/custom-tree-node';

import styles from './parameters.module.less';

const getDefaultAppendValue = () => ({
  fieldRandomKey: nanoid(),
  type: ParamTypeAlias.String,
});

export function Parameters(props: PropsWithChildren<ParametersProps>) {
  const {
    value,
    readonly = false,
    withDescription = false,
    disabledTypes = [],
    className = '',
    style = {},
    errors = [],
    allowValueEmpty = true,
    onChange,
  } = props;
  // Monitor for changes in this value
  const isValueEmpty = !value || value.length === 0;
  const { data: formattedTreeData, hasObjectLike } = formatTreeData(
    cloneDeep(value) as TreeNodeCustomData[],
  );

  /**
   * The description of the parent node of which row is currently in a multi-row state (LLM node)
   * For rendering tree vertical lines, the next vertical line in multiple lines of text should be extended
   * If the param name has an error message, the vertical bar extends below the error message and the length changes
   */
  const [activeMultiInfo, setActiveMultiInfo] = useState<ActiveMultiInfo>({
    activeMultiKey: '',
  });

  // How to change this component
  const onValueChange = (freshValue?: Array<TreeNodeCustomData>) => {
    if (onChange) {
      freshValue = (freshValue || []).concat([]);
      // Clean up useless fields
      traverse<TreeNodeCustomData>(freshValue, node => {
        const { key, name, type, description, children } = node;
        // eslint-disable-next-line guard-for-in
        for (const prop in node) {
          delete node[prop];
        }
        node.key = key;
        node.name = name;
        node.type = type;
        node.description = description;

        if (children) {
          node.children = children;
        }
      });
      onChange(freshValue);
    }
  };

  // Tree node change method
  const onTreeNodeChange = (mode: ChangeMode, param: TreeNodeCustomData) => {
    // Clone one first, because the Tree will execute isEqual on treeData, cloning one must be false.
    const cloneDeepTreeData = cloneDeep(
      formattedTreeData,
    ) as Array<TreeNodeCustomData>;
    const findResult = findCustomTreeNodeDataResult(
      cloneDeepTreeData,
      param.field as string,
    );
    if (findResult) {
      switch (mode) {
        case ChangeMode.Append: {
          // You can't use parentData as a standard for adding, you need to add it under the current data.
          const { data } = findResult;
          const currentChildren = data.children || [];
          // @ts-expect-error Some values do not need to be specified at this time because format is executed during rerender
          data.children = currentChildren.concat({
            ...getDefaultAppendValue(),
            // Add field
            field: `${data.field}.children[${currentChildren.length}]`,
          });
          onValueChange(cloneDeepTreeData);
          break;
        }
        case ChangeMode.Update: {
          const targetArray = findResult.isRoot
            ? cloneDeepTreeData
            : findResult.parentData?.children;
          const index = targetArray?.findIndex(item => item.key === param.key);

          if (index !== undefined) {
            targetArray?.splice(index, 1, param);
            onValueChange(cloneDeepTreeData);
          }
          break;
        }
        case ChangeMode.Delete: {
          if (findResult.isRoot) {
            const freshValue = (cloneDeepTreeData || []).filter(
              item => item.key !== param.key,
            );
            onValueChange(freshValue);
          } else {
            const parentData = findResult.parentData as TreeNodeData;
            parentData.children = (parentData.children || []).filter(
              item => item.key !== param.key,
            );
            onValueChange(cloneDeepTreeData);
          }
          break;
        }
        case ChangeMode.DeleteChildren: {
          const { data } = findResult;
          data.children = [];
          onValueChange(cloneDeepTreeData);
          break;
        }
        default:
      }
    } else {
      Toast.error(I18n.t('workflow_detail_node_output_parsingfailed'));
    }
  };

  if (readonly && isValueEmpty) {
    return null;
  }

  return (
    <ConfigContext.Provider
      value={{
        errors,
        allowValueEmpty,
        withDescription,
        readonly,
        hasObjectLike,
      }}
    >
      <div className={`${styles.container} ${className}`} style={style}>
        <Header />
        <Tree
          expandAll={!readonly}
          style={readonly ? {} : { overflow: 'inherit' }}
          motion={false}
          className={classNames({
            [styles.content]: true,
            [styles.readonly]: readonly,
            [styles['content-fix-pop-container']]: !readonly,
          })}
          renderFullLabel={renderFullLabelProps => (
            <CustomTreeNode
              {...renderFullLabelProps}
              onChange={onTreeNodeChange}
              onActiveMultiInfoChange={setActiveMultiInfo}
              activeMultiInfo={activeMultiInfo}
              disabledTypes={disabledTypes}
            />
          )}
          treeData={formattedTreeData}
        />
      </div>
    </ConfigContext.Provider>
  );
}
