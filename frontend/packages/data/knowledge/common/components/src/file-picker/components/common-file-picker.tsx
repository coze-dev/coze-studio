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

import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';

import { Tree } from '@coze-arch/coze-design';
import type { TreeProps, RenderFullLabelProps } from '@coze-arch/bot-semi/Tree';
import { CommonE2e } from '@coze-data/e2e';

import { distinctFileNodes, levelMapTreeNodesToMap } from '../utils';
import {
  isFileNodeArray,
  type FileNode,
  type PickerRef,
  type TransSelectedFilesMiddleware,
  type FileId,
  type CalcCurrentSelectFilesMiddleware,
} from '../types';
import { useDefaultLabelRenderer } from '../hooks/useDefaultLabelRenderer';
import {
  DEFAULT_FILENODE_LEVEL_INDENT,
  DEFAULT_VIRTUAL_CONTAINER_HEIGHT,
  DEFAULT_VIRTUAL_ITEM_HEIGHT,
} from '../consts';

import styles from './common-file-picker.module.less';

export interface CommonFilePickerProps
  extends Omit<TreeProps, 'onChange' | 'onSelect'> {
  /** Tree data used for rendering */
  treeData: FileNode[];
  /** Provide a customized render tree node */
  customTreeDataRenderer?: (
    renderProps: RenderFullLabelProps,
  ) => React.ReactNode;

  /** Whether only leaf nodes can be selected, invalid if customRenderTreeData is passed in */
  onlySelectLeaf?: boolean;
  /** Whether to multi-select, if the custom customTreeDataRenderer must be passed in, the option will affect customTreeDataRenderer imported parameter */
  multiple?: boolean;

  /**
   * Whether to enable virtualization
   */
  enableVirtualize?: boolean;
  /** virtualization options */
  /** virtualized container height */
  virtualizeHeight?: number;
  /** Height of each item */
  virtualizeItemSize?: number;

  /** The content already selected by default can be used as initValue or as a substitute for value */
  defaultValue?: FileNode[] | FileId[];

  /** style rendering feature */
  normalLabelStyle?: React.CSSProperties;
  selectedLabelStyle?: React.CSSProperties;
  halfSelectedLabelStyle?: React.CSSProperties;

  /** Indent size, default size 25px If backgroundMode is position, it will react to left If it is padding, it will react to padding-left. */
  indentSize?: number;

  /** Tree component expansion icon */
  expandIcon?: React.ReactNode;

  /** onChange business layer can be passed through */
  onChange?: (args?: FileNode[]) => void;

  /** onSelect business layer can pass through */
  onSelect?: (key: string, selected: boolean, node: FileNode) => void;

  /** Used to convert selectedFiles, occurs in, sets the selected state, to submit to the upper component, between, note that there is a sequence of processing, the return of the previous middleware will be used as the input of the latter */
  transSelectedFilesMiddlewares?: TransSelectedFilesMiddleware[];

  /** The hook for setting the selection state occurs between clicking the check box and setting the selection state, and the processing is in sequence */
  selectFilesMiddlewares?: CalcCurrentSelectFilesMiddleware[];

  /** Disable select disable select */
  disableSelect?: boolean;

  /** checkRelation: Whether the selected state of the parent and child nodes is related */
  checkRelation?: 'related' | 'unRelated';

  /** Default expanded node key */
  defaultExpandKeys?: FileId[];
}

function diffChangeNodes(
  prevChangeNodes: FileNode[],
  changeNodes: FileNode[],
): [FileNode[], FileNode[], FileNode[]] {
  const addNodes: FileNode[] = [];
  const removeNodes: FileNode[] = [];
  const retainNodes: FileNode[] = [];
  const prevChangeKeysSet = new Set(prevChangeNodes.map(node => node.key));
  const changeKeysSet = new Set(changeNodes.map(node => node.key));

  for (const changeNode of prevChangeNodes) {
    if (!changeKeysSet.has(changeNode.key)) {
      removeNodes.push(changeNode);
    }
  }

  for (const changeNode of changeNodes) {
    if (prevChangeKeysSet.has(changeNode.key)) {
      retainNodes.push(changeNode);
    } else {
      addNodes.push(changeNode);
    }
  }

  return [addNodes, removeNodes, retainNodes];
}

function getFirstKeyOfDefaultValue(defaultValue?: FileId[] | FileNode[]) {
  if (!defaultValue || defaultValue.length === 0) {
    return '';
  }
  if (typeof defaultValue[0] === 'string') {
    return defaultValue[0];
  }
  return defaultValue[0].key;
}

function transDefaultValueToFileNodes(
  treeData: FileNode[],
  defaultValue?: FileId[] | FileNode[],
): FileNode[] {
  const treeDataMap = levelMapTreeNodesToMap(treeData);
  return (
    defaultValue?.map(element => {
      // Because onChangeWithObject is opened, the selected state here should be stored with object.
      if (typeof element === 'string') {
        return (
          treeDataMap.get(element) ?? {
            key: element,
          }
        );
      }
      return element;
    }) ?? []
  );
}

function transDefaultValueToRenderNode(defaultValue?: FileId[] | FileNode[]) {
  return (
    defaultValue?.map(element => {
      // Because onChangeWithObject is opened, the selected state here should be stored with object.
      if (typeof element === 'string') {
        return {
          key: element,
        };
      }
      return element;
    }) ?? []
  );
}

/**
 * ------------------
 * common file picker
 * Select file for data upload
 * ------------------
 * useImperativeHandle:
 * Search: Provides tree search capability
 * ------------------
 * props: FilePickerProps
 * ------------------
 */
export const CommonFilePicker = React.forwardRef(
  (props: CommonFilePickerProps, ref: React.ForwardedRef<PickerRef>) => {
    const {
      treeData,
      customTreeDataRenderer,
      onlySelectLeaf,
      multiple,
      virtualizeHeight,
      virtualizeItemSize,
      indentSize,
      expandIcon,
      onChange,
      transSelectedFilesMiddlewares,
      defaultValue,
      selectFilesMiddlewares = [],
      disableSelect = false,
      checkRelation = 'related',
      defaultExpandKeys = [],
      enableVirtualize = true,
    } = props;

    const treeRef = useRef<Tree>(null);
    // Use controlled mode
    const [selectValue, setSelectValue] = useState<FileNode[]>(
      transDefaultValueToRenderNode(defaultValue),
    );
    const [expandedKeys, setExpandedKeys] =
      useState<string[]>(defaultExpandKeys);

    const prevChangeNodes = useRef<FileNode[]>([]);

    useEffect(() => {
      const defaultFileNodes = transDefaultValueToFileNodes(
        treeData,
        defaultValue,
      );
      setSelectValue(transDefaultValueToRenderNode(defaultValue));
      prevChangeNodes.current = defaultFileNodes;
    }, [defaultValue]);

    const renderTreeData = useDefaultLabelRenderer(
      !!multiple,
      !!onlySelectLeaf,
      {
        indentSize: indentSize ?? DEFAULT_FILENODE_LEVEL_INDENT,
        expandIcon,
        disableSelect,
        defaultSingleSelectKey: !multiple
          ? getFirstKeyOfDefaultValue(defaultValue)
          : '',
      },
    );
    useImperativeHandle(ref, () => ({
      search: treeRef.current?.search,
    }));

    return (
      <div className={styles['common-file-picker-wrapper']}>
        <Tree
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          {...(props as any)}
          data-testid={CommonE2e.CommonFilePicker}
          checkRelation={checkRelation}
          value={selectValue}
          treeData={treeData}
          ref={treeRef}
          renderFullLabel={
            customTreeDataRenderer ??
            (renderTreeData as (
              renderProps: RenderFullLabelProps,
            ) => React.ReactNode)
          }
          multiple={multiple}
          virtualize={
            enableVirtualize
              ? {
                  height: virtualizeHeight ?? DEFAULT_VIRTUAL_CONTAINER_HEIGHT,
                  itemSize: virtualizeItemSize ?? DEFAULT_VIRTUAL_ITEM_HEIGHT,
                }
              : undefined
          }
          expandedKeys={expandedKeys}
          onExpand={(currentExpandedKeys, current) => {
            setExpandedKeys(currentExpandedKeys);
          }}
          onChangeWithObject
          onChange={changeNodes => {
            let transedChangeNodes: FileNode[];
            if (multiple) {
              if (
                !changeNodes ||
                !Array.isArray(changeNodes) ||
                !isFileNodeArray(changeNodes)
              ) {
                return;
              }
              transedChangeNodes = changeNodes;
            } else {
              if (!changeNodes) {
                return;
              }
              transedChangeNodes = [changeNodes as unknown as FileNode];
            }

            // Calculate diff
            const [addNodes, removeNodes, retainNodes] = diffChangeNodes(
              prevChangeNodes.current,
              transedChangeNodes as FileNode[],
            );

            // The middleware here is more used in scenarios where the selected state is customized, such as wanting to unselect all sub-nodes but keep the parent node selected
            transedChangeNodes = distinctFileNodes(
              selectFilesMiddlewares.reduce(
                (selectedElements, middleware) =>
                  middleware(
                    selectedElements,
                    addNodes,
                    removeNodes,
                    retainNodes,
                  ),
                transedChangeNodes,
              ),
            );
            prevChangeNodes.current = transedChangeNodes;

            setSelectValue(
              transedChangeNodes.map(transedNode => ({
                key: transedNode.key,
              })),
            );
            // Although the parent node with children is returned here, because they are all snapshots of the backend interface
            // What data to report to the business party?
            // The middleware here is mainly used in scenarios where the selected data is reported to the upper component, such as checkRelation'related 'mode, where only the data of the parent node is returned, but the parent component wants all the data
            // Warning: If you can't get the unrequested sub-node when using loadData here (in other words, the last layer of data you get is not necessarily a leaf node), the same is true here. After selecting it, it is only a parent node, and it cannot be guaranteed to be in a snapshot.
            if (transSelectedFilesMiddlewares) {
              transedChangeNodes = transSelectedFilesMiddlewares.reduce(
                (selectedElements, middleware) => middleware(selectedElements),
                transedChangeNodes,
              );
            }
            onChange?.(transedChangeNodes);
          }}
        />
      </div>
    );
  },
);
