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
/* eslint-disable @coze-arch/max-line-per-function */
import React, { useState } from 'react';

import type { RenderFullLabelProps } from '@coze-arch/bot-semi/Tree';
import { Checkbox, Radio, Spin, Typography } from '@coze-arch/bot-semi';

import { ReactComponent as Text } from '@/assets/text-file.svg';
import { ReactComponent as Sheet } from '@/assets/sheet-file.svg';
import { ReactComponent as Folder } from '@/assets/folder.svg';

import {
  TreeNodeType,
  type FileSelectCheckStatus,
  type FileNode,
} from '../types';

const noRealExpandClassName = 'no-real-expand';

const ActionComponent = (props: {
  checkStatus: Partial<FileSelectCheckStatus>;
  isLeaf: boolean;
  renderExpandIcon: React.ReactElement;
  onlySelectLeaf: boolean;
  multiple: boolean;
  disableSelect: boolean;
  unCheckable: boolean;
}) => {
  const {
    checkStatus,
    isLeaf,
    renderExpandIcon,
    onlySelectLeaf,
    multiple,
    disableSelect,
    unCheckable = false,
  } = props;
  const getSingalSelectAction = (className: string) => (
    <span
      role="radio"
      tabIndex={0}
      aria-checked={checkStatus.checked}
      className={`file-selector ${className}`}
    >
      <Radio checked={checkStatus.checked} disabled={disableSelect} />
    </span>
  );
  const getMultiSelectAction = (className: string) => (
    <span
      role="checkbox"
      tabIndex={0}
      aria-checked={checkStatus.checked}
      className={`file-selector ${className}`}
    >
      <Checkbox
        indeterminate={checkStatus.halfChecked}
        checked={checkStatus.checked}
        disabled={disableSelect}
      />
    </span>
  );
  const expandPlaceHolder = <span className="expand-placeholder"></span>;
  const selectActionPlaceHolder = (
    <span className="action-placeholder file-selector"></span>
  );

  // 当前整棵树是多选 并且 只能选中叶子结点
  if (multiple && onlySelectLeaf) {
    return isLeaf && !unCheckable ? (
      <>
        {expandPlaceHolder}
        {getMultiSelectAction(noRealExpandClassName)}
      </>
    ) : (
      <>
        {renderExpandIcon} {selectActionPlaceHolder}
      </>
    );
  }

  // 当前整棵树是多选 并且 能选中所有结点
  if (multiple && !onlySelectLeaf) {
    if (unCheckable) {
      return (
        <>
          {renderExpandIcon} {selectActionPlaceHolder}
        </>
      );
    }
    return (
      <>
        {isLeaf ? expandPlaceHolder : renderExpandIcon}
        {getMultiSelectAction(isLeaf ? noRealExpandClassName : '')}
      </>
    );
  }

  // 当前整棵树是单选 并且 只能选中叶子结点
  if (!multiple && onlySelectLeaf) {
    return isLeaf && !unCheckable ? (
      <>
        {expandPlaceHolder}
        {getSingalSelectAction(noRealExpandClassName)}
      </>
    ) : (
      <>
        {renderExpandIcon}
        {selectActionPlaceHolder}
      </>
    );
  }

  // 当前整棵树是单选 并且 能选中所有结点
  if (!multiple && !onlySelectLeaf) {
    if (unCheckable) {
      return (
        <>
          {renderExpandIcon}
          {selectActionPlaceHolder}
        </>
      );
    }
    return (
      <>
        {isLeaf ? expandPlaceHolder : renderExpandIcon}
        {getSingalSelectAction(isLeaf ? noRealExpandClassName : '')}
      </>
    );
  }
  return <></>;
};

const LabelContent = (props: {
  iconUrl?: string;
  label: React.ReactNode;
  type?: TreeNodeType;
  isLoading?: boolean;
  loadingInfo?: string;
}) => {
  const { iconUrl, label, type, isLoading, loadingInfo } = props;
  return (
    <>
      <span className="file-icon">
        {isLoading ? (
          <Spin spinning />
        ) : iconUrl ? (
          <img src={iconUrl} />
        ) : (
          {
            [TreeNodeType.FILE_TABLE]: <Sheet />,
            [TreeNodeType.FOLDER]: <Folder />,
            [TreeNodeType.FILE_TEXT]: <Text />,
          }[type ?? TreeNodeType.FILE_TEXT]
        )}
      </span>
      <span className="file-content">
        <Typography.Text
          ellipsis={{
            showTooltip: {
              type: 'tooltip',
              opts: {
                style: {
                  maxWidth: '800px',
                },
              },
            },
          }}
          className="file-name"
        >
          {label}
        </Typography.Text>
        {isLoading ? (
          <span className="file-loading-info">{loadingInfo}</span>
        ) : null}
      </span>
    </>
  );
};

/**
 * -----------------------------
 * 获取默认的文件树 label renderer 这层不感知平台信息
 * -----------------------------
 * @param {boolean} multiple 是否多选
 * @param {boolean} onlySelectLeaf 是否只能选中叶子结点
 * @param {{indentSize: 树组件缩进尺寸, expandIcon: 树组件可展开节点 展开图标, disableSelect: 选择的 disable 状态}} renderOption 渲染相关的自定义选项
 * @returns label render 函数
 */
export function useDefaultLabelRenderer(
  multiple: boolean,
  onlySelectLeaf: boolean,
  renderOption: {
    indentSize: number;
    expandIcon?: React.ReactNode;
    disableSelect?: boolean;
    defaultSingleSelectKey?: string;
  },
) {
  const [singleSelectedKey, setSingleSelectKey] = useState(
    renderOption.defaultSingleSelectKey ?? '',
  );

  const getExpandIcon = (
    labelDefaultIcon: React.ReactElement,
    customIcon?: React.ReactNode,
  ) => {
    if (!customIcon) {
      return labelDefaultIcon;
    }
    const {
      props: { onClick, className, role },
    } = labelDefaultIcon;
    return (
      <span
        role={role}
        className={`${className} semi-tree-option-expand-icon`}
        onClick={onClick}
      >
        {customIcon}
      </span>
    );
  };

  const getFileContentClassName = (isChecked: boolean) =>
    `w-full file-node-row-content flex items-center ${
      isChecked ? 'file-node-selected' : 'fileNodeNormal'
    }`;

  /**
   * 在整行点击的处理函数 不是点击 checkbox 或者 radio 或者 expandIcon 的处理函数
   * @param isLeaf: 是否是叶子结点
   * @param onExpand: 展开行 处理函数
   * @param onCheck: 选中状态的 toggle
   **/
  const getItemAction = (params: {
    isLeaf: boolean;
    onExpand: (e: React.MouseEvent<Element, MouseEvent>) => void;
    onCheck: (e: React.MouseEvent<Element, MouseEvent>) => void;
    unCheckable: boolean;
  }) => {
    const { onExpand, onCheck, isLeaf, unCheckable } = params;
    return function (e: React.MouseEvent<Element, MouseEvent>) {
      // 如果只能选中叶子结点 那么无论 多选 / 单选 父节点只能展开，叶子结点可以选中
      // 反之 父节点子节点 都是选中 无论多选单选，想要展开就点击 expand icon
      if (onlySelectLeaf) {
        if (!isLeaf) {
          onExpand(e);
        } else {
          if (!unCheckable) {
            onCheck(e);
          }
        }
      } else {
        if (!unCheckable) {
          onCheck(e);
        }
      }
    };
  };

  const labelRenderer = (
    renderProps: RenderFullLabelProps & {
      data: FileNode;
    },
  ) => {
    const {
      data,
      className,
      level,
      onCheck,
      onExpand,
      onClick,
      checkStatus,
      style,
      expandIcon,
    } = renderProps;
    const { indentSize, disableSelect } = renderOption;
    const {
      label,
      key,
      type,
      isLoading,
      loadingInfo,
      render,
      readonly,
      unCheckable = false,
    } = data;
    // 单选选中选项的 key
    const singleSelectCheckStatus = singleSelectedKey === key;
    const rowCheckStatus = multiple
      ? checkStatus
      : {
          checked: singleSelectCheckStatus,
        };
    // 只要 data isLeaf 不是空 永远先看 data.isLeaf
    const isLeaf = data?.isLeaf ?? !(data.children && data.children.length);
    const checkItem = multiple
      ? (e: React.MouseEvent<Element, MouseEvent>) => {
          if (disableSelect) {
            e.stopPropagation();
            return;
          }
          onCheck(e);
        }
      : (e: React.MouseEvent<Element, MouseEvent>) => {
          if (disableSelect) {
            e.stopPropagation();
            return;
          }
          onClick(e);
          setSingleSelectKey(key);
        };
    const indent = indentSize * level;
    const rowStyle = {
      ...style,
      paddingLeft: indent,
    };
    const renderExpandIcon = getExpandIcon(
      expandIcon as React.ReactElement,
      renderOption.expandIcon,
    );
    return (
      <li
        style={{
          ...rowStyle,
        }}
        className={`${className} ${
          checkStatus.checked ? 'semi-tree-option-selected' : ''
        } ${disableSelect ? 'semi-tree-option-disable' : ''} ${
          readonly ? 'semi-tree-option-readonly' : ''
        }`}
        role="treeitem"
        onClick={
          readonly
            ? undefined
            : getItemAction({
                isLeaf,
                onExpand,
                onCheck: checkItem,
                unCheckable,
              })
        }
      >
        <div className={getFileContentClassName(rowCheckStatus.checked)}>
          {render ? (
            render()
          ) : (
            <>
              <ActionComponent
                checkStatus={rowCheckStatus}
                isLeaf={isLeaf}
                renderExpandIcon={renderExpandIcon}
                onlySelectLeaf={onlySelectLeaf}
                multiple={multiple}
                disableSelect={!!disableSelect}
                unCheckable={unCheckable}
              />
              <LabelContent
                iconUrl={data.icon}
                label={label}
                type={type}
                isLoading={isLoading}
                loadingInfo={loadingInfo}
              />
            </>
          )}
        </div>
      </li>
    );
  };

  return labelRenderer;
}
