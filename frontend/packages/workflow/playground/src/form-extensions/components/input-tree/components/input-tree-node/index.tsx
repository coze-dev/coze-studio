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

import React, { useRef } from 'react';

import classNames from 'classnames';
import {
  type ViewVariableType,
  type ValueExpression,
} from '@coze-workflow/base';
import { type RenderFullLabelProps } from '@coze-arch/bot-semi/Tree';

import { LevelLine } from '@/form-extensions/components/level-line';

import { InputValue } from '../input-value';
import { InputOperator } from '../input-operator';
import { InputName } from '../input-name';
import { type TreeNodeCustomData } from '../../types';
import { useColumnsStyle } from '../../hooks/use-columns-style';
import { TreeCollapseWidth, ChangeMode } from '../../constants';

import styles from './index.module.less';
export interface InputTreeNodeProps extends RenderFullLabelProps {
  readonly?: boolean;
  needRenderAppendChild?: boolean;
  onChange: (mode: ChangeMode, param: TreeNodeCustomData) => void;
  hasObject?: boolean;
  withDescription?: boolean;
  withRequired?: boolean;
  couldCollapse?: boolean;
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  defaultExpand?: boolean;
  columnsRatio?: string;
  isNamePureText?: boolean;
  disabledTypes?: ViewVariableType[];
  disableDelete: boolean;
}

export default function InputTreeNode(props: InputTreeNodeProps) {
  const {
    data,
    className,
    level,
    readonly = false,
    onChange,
    hasObject,
    couldCollapse = true,
    collapsed = true,
    onCollapse,
    needRenderAppendChild = true,
    columnsRatio,
    isNamePureText,
    disabledTypes,
    disableDelete,
  } = props;

  // current value
  const value = data as TreeNodeCustomData;
  const treeNodeRef = useRef<HTMLDivElement>(null);
  const columnsStyle = useColumnsStyle(columnsRatio, level);
  const testName = `/inputs/inputParameters${(data.field || '')
    .replaceAll('.', '/')
    .replace(/\[(\d+)\]/g, '/$1')}`;
  const nameRef = useRef(value?.name);
  const inputRef = useRef(value?.input);

  // When deleting
  const onDelete = () => {
    onChange(ChangeMode.Delete, value);
  };

  // When adding a child
  const onAppend = () => {
    onChange(ChangeMode.Append, value);
  };

  // update name
  const onNameChange = (name: string) => {
    if (value.name === name) {
      return;
    }
    nameRef.current = name;
    onChange(ChangeMode.Update, { ...value, name, input: inputRef.current });
  };

  const onValueChange = (input?: ValueExpression) => {
    inputRef.current = input;
    onChange(ChangeMode.Update, { ...value, input, name: nameRef.current });
  };

  const paramRow = (
    <div
      className={classNames({
        [styles.wrapper]: true,
      })}
    >
      <InputName
        data={value}
        onChange={onNameChange}
        style={columnsStyle.name}
        disabled={readonly}
        isPureText={isNamePureText}
        testName={testName}
      />
      <InputValue
        data={value}
        onChange={onValueChange}
        style={columnsStyle.value}
        level={level}
        disabled={readonly}
        disabledTypes={disabledTypes}
        testName={testName}
      ></InputValue>

      {!readonly ? (
        <InputOperator
          data={value}
          level={level}
          onDelete={onDelete}
          onAppend={onAppend}
          hasObject={hasObject}
          needRenderAppendChild={needRenderAppendChild}
          disableDelete={disableDelete}
        />
      ) : null}
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
        readonly={readonly}
        expandContentVisible={true}
      />
      <div
        className="w-full"
        style={{ paddingLeft: couldCollapse ? TreeCollapseWidth : 0 }}
      >
        <div
          className={classNames({
            [styles['expand-wrapper']]: true,
            'flex-grow': !couldCollapse,
          })}
        >
          {paramRow}
        </div>
      </div>
    </div>
  );
}
