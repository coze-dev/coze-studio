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
import React, { useCallback, useRef } from 'react';

import isNumber from 'lodash-es/isNumber';
import classNames from 'classnames';
import { type RenderFullLabelProps } from '@coze-arch/bot-semi/Tree';

import { PARAM_TYPE_ALIAS_MAP, type ParamTypeAlias } from '../../types';
import useConfig from '../../hooks/use-config';
import NodeContext from '../../context/node-context';
import { type TreeNodeCustomData, type ActiveMultiInfo } from './type';
import { ChangeMode, ObjectLikeTypes, DescriptionLine } from './constants';
import ParamType from './components/param-type';
import ParamOperator from './components/param-operator';
import ParamName from './components/param-name';
import ParamDescription from './components/param-description';
import LevelLine from './components/line-component';

import styles from './index.module.less';

export interface CustomTreeNodeProps extends RenderFullLabelProps {
  onChange: (mode: ChangeMode, param: TreeNodeCustomData) => void;
  // Description 组件变换为多行时，其下面第一个 child 需被记录
  onActiveMultiInfoChange?: (info: ActiveMultiInfo) => void;
  activeMultiInfo?: ActiveMultiInfo;
  // 不支持使用的类型
  disabledTypes?: ParamTypeAlias[];
}

const LEVEL_LINE_STEP_WIDTH = 15;

export default function CustomTreeNode(props: CustomTreeNodeProps) {
  const {
    data,
    onExpand,
    expandIcon,
    className,
    level,
    onChange,
    onActiveMultiInfoChange,
    activeMultiInfo,
    disabledTypes = [],
  } = props;
  const { allowValueEmpty, readonly, hasObjectLike, withDescription } =
    useConfig();
  // 当前值
  const value = data as TreeNodeCustomData;
  const isTopLevel = level === 0;
  const isOnlyOneData = value.isSingle && isTopLevel;
  const IndentationWidth = level * LEVEL_LINE_STEP_WIDTH;
  const paramNameWidth = 181;

  const treeNodeRef = useRef<HTMLDivElement>(null);

  const disableDelete = Boolean(
    !allowValueEmpty && isOnlyOneData && isTopLevel,
  );
  // 删除时
  const onDelete = () => {
    onChange(ChangeMode.Delete, value);
  };
  // 新增子项时
  const onAppend = () => {
    onChange(ChangeMode.Append, value);
  };
  // 类型切换时
  const onSelectChange = (
    val?: string | number | Array<unknown> | Record<string, unknown>,
  ) => {
    if (val === undefined) {
      return;
    }

    if (isNumber(val)) {
      const isObjectLike = ObjectLikeTypes.includes(val);
      if (!isObjectLike) {
        // 如果不是类Object，判断是否有children，如果有，删除掉
        if (value.children && value.children.length > 0) {
          delete value.children;
        }
      }

      onChange(ChangeMode.Update, { ...value, type: val });
    }

    // 更新type
  };
  // 更新
  const onNameChange = (name: string) => {
    onChange(ChangeMode.Update, { ...value, name });
  };

  // 更新
  const onDescriptionChange = useCallback(
    (description: string) => {
      onChange(ChangeMode.Update, { ...value, description });
    },
    [onChange, value],
  );

  /**
   * Description 组件单行 / 多行变换时，其下面第一个 child 的竖线需要缩短 / 延长
   */
  const onDescriptionLineChange = useCallback(
    (type: DescriptionLine) => {
      const errorDoms = treeNodeRef.current?.getElementsByClassName(
        'output-param-name-error-text',
      );

      if (type === DescriptionLine.Multi && value.children?.[0]?.field) {
        onActiveMultiInfoChange?.({
          activeMultiKey: value.children[0].field,
          withNameError: Boolean(errorDoms?.length || 0),
          // withNameError: Boolean(nameError || ''),
        });
      } else {
        onActiveMultiInfoChange?.({
          activeMultiKey: '',
        });
      }
    },
    [onActiveMultiInfoChange, value],
  );

  if (readonly) {
    return (
      // 提高class的css 权重
      <div
        className={classNames(
          styles['readonly-icon-container'],
          styles['more-level'],
          className,
        )}
      >
        {expandIcon}
        <div className={styles['readonly-container']} onClick={onExpand}>
          <span className={styles.name}>{value.name || '-'}</span>
          <div className={styles.tag}>
            <span className={styles.label}>
              {PARAM_TYPE_ALIAS_MAP[value.type] || '-'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <NodeContext.Provider value={{ field: data.field }}>
      <div
        className={classNames({
          [styles.container]: true,
          [className]: Boolean(className),
        })}
        ref={treeNodeRef}
      >
        {/* 每增加一级多15长度 */}
        <div
          style={{ width: IndentationWidth }}
          className={styles['level-icon']}
        >
          <LevelLine
            level={level}
            data={value}
            multiInfo={{
              multiline: activeMultiInfo?.activeMultiKey === value.field,
              withNameError: activeMultiInfo?.withNameError,
            }}
          />
        </div>
        <div className={styles.wrapper}>
          <ParamName
            style={{ width: paramNameWidth - IndentationWidth }}
            data={value}
            onChange={onNameChange}
          />
          <ParamType
            data={value}
            onSelectChange={onSelectChange}
            level={level}
            disabledTypes={disabledTypes}
          />
          {/* LLM 节点输出才有 description */}
          {withDescription ? (
            <ParamDescription
              data={value}
              onChange={onDescriptionChange}
              onLineChange={onDescriptionLineChange}
              hasObjectLike={hasObjectLike}
            />
          ) : (
            <></>
          )}
          <ParamOperator
            data={value}
            level={level}
            onDelete={onDelete}
            onAppend={onAppend}
            disableDelete={disableDelete}
            hasObjectLike={hasObjectLike}
          />
        </div>
      </div>
    </NodeContext.Provider>
  );
}
