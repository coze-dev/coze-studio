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
import type {
  TreeProps,
  RenderFullLabelProps,
} from '@coze-arch/bot-semi/Tree';
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
  /** 渲染使用的树数据 */
  treeData: FileNode[];
  /** 提供一个定制化的 render tree node */
  customTreeDataRenderer?: (
    renderProps: RenderFullLabelProps,
  ) => React.ReactNode;

  /** 是否只能选中叶子结点 如果传入 customRenderTreeData 则失效 */
  onlySelectLeaf?: boolean;
  /** 是否多选 如果自定义 customTreeDataRenderer 一定要传入, 选项会影响 customTreeDataRenderer 的入参 */
  multiple?: boolean;

  /**
   * 是否开启虚拟化
   */
  enableVirtualize?: boolean;
  /** 虚拟化选项 */
  /** 虚拟化容器高度 */
  virtualizeHeight?: number;
  /** 每个 item 高度 */
  virtualizeItemSize?: number;

  /** 默认已经选中的内容 可以作为 initValue 使用，也可以作为 value 的代替者使用 */
  defaultValue?: FileNode[] | FileId[];

  /** 样式渲染特性 */
  normalLabelStyle?: React.CSSProperties;
  selectedLabelStyle?: React.CSSProperties;
  halfSelectedLabelStyle?: React.CSSProperties;

  /** 缩进大小 默认大小 25px 如果 backgroundMode 为 position 将会反应为 left 如果为 padding 将会反应成 padding-left */
  indentSize?: number;

  /** 树组件展开的 icon */
  expandIcon?: React.ReactNode;

  /** onChange 业务层可以透传 */
  onChange?: (args?: FileNode[]) => void;

  /** onSelect 业务层可以透传 */
  onSelect?: (key: string, selected: boolean, node: FileNode) => void;

  /** 用来转换 selectedFiles, 发生在 设置选中态 到 提交给上层组件 之间 注意 处理有先后顺序，前一个中间件的返回将作为后一个的输入 */
  transSelectedFilesMiddlewares?: TransSelectedFilesMiddleware[];

  /** 设置选择态的钩子 发生在 点击选中框 到 设置选择态 之间 处理有先后顺序 */
  selectFilesMiddlewares?: CalcCurrentSelectFilesMiddleware[];

  /** disable select 禁止选择 */
  disableSelect?: boolean;

  /** checkRelation: 父子节点选中态是否关联 */
  checkRelation?: 'related' | 'unRelated';

  /** 默认展开的节点 key */
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
      // 因为开了 onChangeWithObject 所以这里选中态要用 object 存储
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
      // 因为开了 onChangeWithObject 所以这里选中态要用 object 存储
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
 * 用于数据上传选择文件
 * ------------------
 * useImperativeHandle:
 * search: 提供树搜索能力
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
    // 使用受控模式
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

            // 计算 diff
            const [addNodes, removeNodes, retainNodes] = diffChangeNodes(
              prevChangeNodes.current,
              transedChangeNodes as FileNode[],
            );

            // 这里的中间件更多用在定制化选中态的场景 比如想要反选所有子节点但是保持父亲节点选中
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
            // 虽然这里返回的是父节点带 children 但是因为都是后端一次接口的快照
            // 具体上报什么数据交给业务方
            // 这里的中间件主要用在定制化上报给上层组件的选中数据的场景，比如 checkRelation 'related' 模式下 上面返回的只有父亲节点的数据，但是父组件想要所有数据
            // 警告：这里如果使用 loadData 时拿不到没请求的子节点（换句话说拿到的最后一层的数据不一定是叶子结点, 同样的在这里选中之后交回给后端的其实也只是一个父节点 不能保证在一个快照里
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
