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

import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  type ReactNode,
  type CSSProperties,
} from 'react';

import classNames from 'classnames';
import { useNodeTestId } from '@coze-workflow/base';
import { Tree } from '@coze-arch/coze-design';
import { type TreeNodeData, type TreeProps } from '@coze-arch/bot-semi/Tree';

import { renderLabelWithItem } from './utils';
import { ExpandIcon } from './expand-icon';
import { useTreeVariableSelectorContext } from './context';

import styles from './node-variable-tree.module.less';

interface NodeVariableTreeProps {
  dataSource?: TreeNodeData[];
  onSelect?: (data?: TreeNodeData) => void;
  className?: string;
  outerTopSlot?: ReactNode;
  innerTreeStyle?: CSSProperties;
  emptyContent?: ReactNode;
}

export const NodeVariableTree = React.forwardRef(
  (props: NodeVariableTreeProps, ref) => {
    const {
      value,
      query,
      forArrayItem,
      testId = '',
    } = useTreeVariableSelectorContext();
    const {
      dataSource = [],
      onSelect,
      className,
      outerTopSlot,
      innerTreeStyle = {},
      emptyContent,
    } = props;
    const { concatTestId } = useNodeTestId();

    const treeContainerRef = useRef(null);

    const treeRef = useRef<Tree>(null);

    useImperativeHandle(ref, () => ({
      treeContainerRef: treeContainerRef?.current,
      treeRef: treeRef?.current,
    }));

    useEffect(() => {
      treeRef.current?.search(query ?? '');
    }, [query, treeRef.current]);

    const handleSelect: TreeProps['onSelect'] = (
      selectedKey,
      selected,
      selectedNode,
    ) => {
      onSelect?.(selectedNode);
    };

    return (
      <div
        ref={treeContainerRef}
        className={classNames(
          className,
          styles['node-variable-tree-wrapper'],
          'overflow-auto',
        )}
      >
        {outerTopSlot}
        <Tree
          ref={treeRef}
          filterTreeNode
          showFilteredOnly
          blockNode={false}
          searchRender={false}
          className={styles['node-variable-tree']}
          defaultValue={{
            key: value?.join('-'),
            value: value?.join('-'),
          }}
          defaultExpandAll
          treeData={dataSource}
          style={{
            minWidth: 240,
            ...innerTreeStyle,
          }}
          emptyContent={emptyContent}
          onChangeWithObject
          onSelect={handleSelect}
          renderFullLabel={({
            className: labelClassName,
            onExpand,
            data,
            onCheck,
            expandStatus,
          }) => {
            const isLeaf = !(data.children && data.children.length);
            return (
              <li
                className={classNames(labelClassName, '!mb-0.5')}
                role="treeitem"
                onClick={onCheck}
                data-key={data.key}
              >
                {isLeaf ? (
                  <span className="semi-tree-option-empty-icon"></span>
                ) : (
                  <ExpandIcon onClick={onExpand} />
                )}
                <span className="text-xs pr-1 variable-tree-node-label">
                  {renderLabelWithItem(
                    data,
                    forArrayItem,
                    query,
                    concatTestId(testId, data?.path),
                  )}
                </span>
              </li>
            );
          }}
        />
      </div>
    );
  },
);
