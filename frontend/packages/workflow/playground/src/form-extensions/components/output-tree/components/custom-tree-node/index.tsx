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
 
import React, { useCallback, useRef, useState, useMemo } from 'react';

import isNumber from 'lodash-es/isNumber';
import classNames from 'classnames';
import { useMemoizedFn } from 'ahooks';
import {
  VARIABLE_TYPE_ALIAS_MAP,
  type ViewVariableType,
} from '@coze-workflow/base';
import { IconCozInfoCircle } from '@coze-arch/coze-design/icons';
import { Tooltip } from '@coze-arch/coze-design';
import { type RenderFullLabelProps } from '@coze-arch/bot-semi/Tree';

import { LevelLine } from '@/form-extensions/components/level-line';

import { useColumnsStyle } from '../../hooks/use-columns-style';
import { TreeCollapseWidth } from '../../constants';
import { VariableTypeTag } from '../../../variable-type-tag';
import {
  type TreeNodeCustomData,
  type ActiveMultiInfo,
  type DefaultValueType,
} from './type';
import { ChangeMode, ObjectLikeTypes } from './constants';
import ParamType from './components/param-type';
import ParamRequired from './components/param-required';
import ParamOperator from './components/param-operator';
import ParamName from './components/param-name';
// import ParamDescription from './components/param-description';
import { ExpandContent } from './components/expand-content';
import { ExpandBtn } from './components/expand-btn';

import styles from './index.module.less';
export interface CustomTreeNodeProps extends RenderFullLabelProps {
  readonly?: boolean;
  typeReadonly?: boolean;
  needRenderAppendChild?: boolean;
  onChange: (mode: ChangeMode, param: TreeNodeCustomData) => void;
  hasObjectLike?: boolean;
  // Description 组件变换为多行时，其下面第一个 child 需被记录
  onActiveMultiInfoChange?: (info: ActiveMultiInfo) => void;
  activeMultiInfo?: ActiveMultiInfo;
  withDescription?: boolean;
  withRequired?: boolean;
  /** 不支持使用的类型 */
  disabledTypes?: ViewVariableType[];
  /** 隐藏类型 */
  hiddenTypes?: ViewVariableType[];
  disableDelete?: boolean;
  disabled?: boolean;
  couldCollapse?: boolean;
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  withDefaultValue?: boolean;
  defaultExpand?: boolean;
  columnsRatio?: string;
  readonlyTooltip?: string;
}

// eslint-disable-next-line complexity
export default function CustomTreeNode(props: CustomTreeNodeProps) {
  const {
    data,
    className,
    level,
    readonly = false,
    typeReadonly = false,
    onChange,
    hasObjectLike,
    // onActiveMultiInfoChange,
    activeMultiInfo,
    withDescription = false,
    withRequired = false,
    disabledTypes,
    hiddenTypes,
    disableDelete = false,
    disabled = false,
    couldCollapse = true,
    collapsed = true,
    onCollapse,
    needRenderAppendChild = true,
    withDefaultValue = false,
    defaultExpand = false,
    columnsRatio,
    readonlyTooltip,
  } = props;

  // 当前值
  const value = data as TreeNodeCustomData;
  const treeNodeRef = useRef<HTMLDivElement>(null);
  const columnsStyle = useColumnsStyle(columnsRatio, level);

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
        if (value.children) {
          delete value.children;
        }
      }

      onChange(ChangeMode.Update, {
        ...value,
        defaultValue: undefined,
        type: val,
      });
    }
  };

  // 更新名称
  const onNameChange = (name: string) => {
    if (value.name === name) {
      return;
    }
    onChange(ChangeMode.Update, { ...value, name });
  };

  // 更新描述
  const onDescriptionChange = useCallback(
    (description: string) => {
      if (value.description === description) {
        return;
      }
      if (description === '' && !value.description) {
        return;
      }
      onChange(ChangeMode.Update, { ...value, description });
    },
    [onChange, value],
  );

  // 更新默认值
  const onDefaultValueChange = useMemoizedFn(
    (defaultValue: DefaultValueType | null) => {
      if (value.defaultValue === defaultValue) {
        return;
      }
      if (defaultValue === '' && !value.defaultValue) {
        return;
      }
      onChange(ChangeMode.Update, { ...value, defaultValue });
    },
  );

  // 默认值、描述展开状态，保存在前端
  const [expand, setExpand] = useState(defaultExpand);
  // 默认值输入类型，前端选择的状态
  const [defaultValueInputType, setDefaultValueInputType] = useState('');
  // 更新是否必选
  const onRequiredChange = useCallback(
    (required: boolean) => {
      onChange(ChangeMode.Update, { ...value, required });
    },
    [onChange, value],
  );

  /**
   * Description 组件单行 / 多行变换时，其下面第一个 child 的竖线需要缩短 / 延长
   */
  // const onDescriptionLineChange = useCallback(
  //   (type: DescriptionLine) => {
  //     const errorDoms = treeNodeRef.current?.getElementsByClassName(
  //       'output-param-name-error-text',
  //     );

  //     if (type === DescriptionLine.Multi && value.children?.[0]?.field) {
  //       onActiveMultiInfoChange?.({
  //         activeMultiKey: value.children[0].field,
  //         withNameError: Boolean(errorDoms?.length || 0),
  //         // withNameError: Boolean(nameError || ''),
  //       });
  //     } else {
  //       onActiveMultiInfoChange?.({
  //         activeMultiKey: '',
  //       });
  //     }
  //   },
  //   [onActiveMultiInfoChange, value],
  // );

  const onEnabledChange = useCallback(
    (enabled: boolean) => {
      onChange(ChangeMode.Update, { ...value, enabled });
    },
    [onChange, value],
  );
  const isPreset = value?.isPreset;

  const _withDefaultValue = useMemo(
    () => withDefaultValue && value.level === 0,
    [value, withDefaultValue],
  );
  const withExpandContent = useMemo(
    () => _withDefaultValue || withDescription,
    [_withDefaultValue, withDescription],
  );

  const showExpandContent = useMemo(
    () => expand && !readonly && withExpandContent,
    [withExpandContent, expand, readonly],
  );

  const paramRow = !readonly ? (
    <div
      className={classNames({
        [styles.wrapper]: true,
        [styles['preset-enabled']]: isPreset && value?.enabled,
        [styles['preset-disabled']]: isPreset && !value?.enabled,
      })}
    >
      <ParamName
        disabled={disabled || isPreset}
        data={value}
        onChange={onNameChange}
        style={columnsStyle.name}
      />
      <ParamType
        disabled={typeReadonly || disabled || isPreset}
        data={value}
        onSelectChange={onSelectChange}
        level={level}
        disabledTypes={disabledTypes}
        hiddenTypes={hiddenTypes}
        style={columnsStyle.type}
      />
      {/* {withDescription ? (
        // 先注释，未来响应式布局还要留着用
        // <ParamDescription
        //   disabled={disabled || isPreset}
        //   data={value}
        //   onChange={onDescriptionChange}
        //   onLineChange={onDescriptionLineChange}
        //   hasObjectLike={hasObjectLike}
        // />
        <ParamDescPopover
          disabled={disabled || isPreset}
          data={value}
          onChange={onDescriptionChange}
          hasObjectLike={hasObjectLike}
        />
      ) : null} */}
      {withRequired ? (
        <ParamRequired
          disabled={disabled || isPreset}
          data={value}
          onChange={onRequiredChange}
        />
      ) : null}
      {withDefaultValue || withDescription ? (
        <ExpandBtn onClick={() => setExpand(!expand)} expand={expand} />
      ) : null}
      <ParamOperator
        data={value}
        level={level}
        onDelete={onDelete}
        onAppend={onAppend}
        disableDelete={disableDelete}
        hasObjectLike={hasObjectLike}
        needRenderAppendChild={needRenderAppendChild}
        onEnabledChange={onEnabledChange}
        disabled={disabled}
      />
    </div>
  ) : (
    <div className={styles['readonly-container']}>
      <span className={styles.name}>{value.name || '-'}</span>
      {readonlyTooltip ? (
        <Tooltip content={readonlyTooltip}>
          <IconCozInfoCircle className="text-xs ml-1 coz-fg-secondary" />
        </Tooltip>
      ) : null}

      <VariableTypeTag size="xs">
        {VARIABLE_TYPE_ALIAS_MAP[value.type] || '-'}
      </VariableTypeTag>
    </div>
  );
  return (
    <div
      className={classNames({
        [className]: Boolean(className),
        [styles['param-container']]: true,
      })}
      ref={treeNodeRef}
    >
      <LevelLine
        level={level}
        data={value}
        collapsed={collapsed}
        onCollapse={onCollapse}
        couldCollapse={couldCollapse}
        expandContentVisible={showExpandContent}
        readonly={readonly}
        multiInfo={{
          multiline: activeMultiInfo?.activeMultiKey === value.field,
          withNameError: activeMultiInfo?.withNameError,
        }}
      />
      <div
        className="w-full"
        style={{ paddingLeft: couldCollapse ? TreeCollapseWidth : 0 }}
      >
        <div
          className={classNames({
            [styles['expand-wrapper']]: true,
            'flex-grow': !couldCollapse,
            'coz-mg-secondary': showExpandContent,
          })}
        >
          {paramRow}
          {showExpandContent ? (
            <ExpandContent
              disabled={disabled}
              data={value}
              onDescChange={onDescriptionChange}
              onDefaultValueChange={onDefaultValueChange}
              onDefaultValueInputTypeChange={setDefaultValueInputType}
              defaultValueInputType={defaultValueInputType}
              hasObjectLike={hasObjectLike}
              withDefaultValue={_withDefaultValue}
              withDescription={withDescription}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
