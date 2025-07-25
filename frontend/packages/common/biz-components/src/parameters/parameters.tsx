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
  // 监听该值的变化
  const isValueEmpty = !value || value.length === 0;
  const { data: formattedTreeData, hasObjectLike } = formatTreeData(
    cloneDeep(value) as TreeNodeCustomData[],
  );

  /**
   * 表示当前哪一行的父亲节点的 description 处于多行状态(LLM节点)
   * 用于渲染树形竖线，处于多行文本的下一行竖线应该延长
   * 若 param name 有错误信息，竖线从错误信息下方延展，长度有所变化
   */
  const [activeMultiInfo, setActiveMultiInfo] = useState<ActiveMultiInfo>({
    activeMultiKey: '',
  });

  // 该组件的 change 方法
  const onValueChange = (freshValue?: Array<TreeNodeCustomData>) => {
    if (onChange) {
      freshValue = (freshValue || []).concat([]);
      // 清理掉无用字段
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

  // 树节点的 change 方法
  const onTreeNodeChange = (mode: ChangeMode, param: TreeNodeCustomData) => {
    // 先clone一份，因为Tree内部会对treeData执行isEqual，克隆一份一定是false
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
          // 新增不可以用 parentData 做标准，要在当前 data 下新增
          const { data } = findResult;
          const currentChildren = data.children || [];
          // @ts-expect-error 有些值不需要此时指定，因为在 rerender 的时候会执行 format
          data.children = currentChildren.concat({
            ...getDefaultAppendValue(),
            // 增加 field
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
