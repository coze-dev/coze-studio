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

import React, { type ReactNode, useCallback, useMemo, useState } from 'react';

import classnames from 'classnames';
import { Divider, List } from '@coze-arch/coze-design';
import type { TreeNodeData } from '@coze-arch/bot-semi/Tree';

import { sortTreeDataByGroup } from './utils';
import type { ITreeNodeData, SelectType } from './types';
import { CompositeSelectOption } from './composite-select-option';

import styles from './composite-select.module.less';

interface Props {
  treeData?: ITreeNodeData[];
  onOptionHover?: (option: TreeNodeData) => void;
  onSelect?: (data?: TreeNodeData, type?: SelectType) => void;
  getOptionPopupContainer?: () => HTMLElement;
  activeOption?: string | number | undefined;
  emptyContent?: ReactNode;
  extraOption?: ReactNode;
  value?: string[];
  controlledActive?: boolean;
}

const CompositeSelectTreePanel = React.forwardRef(
  (
    {
      treeData,
      onOptionHover,
      onSelect,
      getOptionPopupContainer,
      activeOption,
      emptyContent,
      extraOption,
      value,
      controlledActive = true,
    }: Props,
    treeRef,
  ) => {
    const treeDataSortByGroup = useMemo(
      () => sortTreeDataByGroup(treeData),
      [treeData],
    );

    const handleOptionHover = useCallback(
      (option: TreeNodeData) => {
        onOptionHover?.(option);
      },
      [onOptionHover],
    );

    const [isHoverOption, setIsHoverOption] = useState(false);

    const treeListWrapperMaxHeight = useMemo(
      () =>
        treeDataSortByGroup?.find(item => item.groupId) ? '262px' : '252px',
      [treeDataSortByGroup],
    );

    const isNodeVariable = value?.length === 1;

    const renderContent = () => {
      if (!extraOption) {
        return treeDataSortByGroup?.length ? (
          <List>
            {treeDataSortByGroup?.map((item, index) => (
              <>
                {treeDataSortByGroup[index - 1] &&
                treeDataSortByGroup[index - 1].groupId !== item.groupId ? (
                  <Divider style={{ width: 'calc(100% - 8px)' }} margin={4} />
                ) : null}
                <List.Item className="!p-0 !border-none">
                  <CompositeSelectOption
                    ref={treeRef}
                    data={item}
                    active={
                      isHoverOption
                        ? item.value === activeOption
                        : item.value === activeOption && controlledActive
                    }
                    onMouseOver={() => {
                      handleOptionHover(item);
                      setIsHoverOption(true);
                    }}
                    onSelect={onSelect}
                    getPopupContainer={getOptionPopupContainer}
                  />
                </List.Item>
              </>
            ))}
          </List>
        ) : (
          <div className="px-6 py-3 coz-fg-secondary text-center">
            {emptyContent}
          </div>
        );
      }

      return (
        <>
          {extraOption}

          <List>
            {treeDataSortByGroup?.map((item, index) => (
              <>
                {treeDataSortByGroup[index - 1] &&
                treeDataSortByGroup[index - 1].groupId !== item.groupId ? (
                  <Divider style={{ width: 'calc(100% - 8px)' }} margin={4} />
                ) : null}
                <List.Item className="!p-0 !border-none">
                  <CompositeSelectOption
                    data={item}
                    active={
                      isHoverOption
                        ? item.value === activeOption
                        : item.value === activeOption && controlledActive
                    }
                    selected={isNodeVariable && item.value === value?.[0]}
                    onMouseOver={() => {
                      handleOptionHover(item);
                      setIsHoverOption(true);
                    }}
                    onSelect={onSelect}
                    getPopupContainer={getOptionPopupContainer}
                  />
                </List.Item>
              </>
            ))}
          </List>
        </>
      );
    };

    return (
      <div
        className={classnames('w-full', styles['node-list-wrapper'])}
        style={{
          maxHeight: treeListWrapperMaxHeight,
        }}
      >
        {/* The Search component of coze-design will cause an error in the popover positioning. Please note for the time being. */}
        {/* <Search className="mb-1" value={query} onChange={setQuery} /> */}
        {renderContent()}
      </div>
    );
  },
);

export default CompositeSelectTreePanel;
