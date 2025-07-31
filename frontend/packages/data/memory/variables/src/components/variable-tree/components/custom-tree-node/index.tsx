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
import { cloneDeep } from 'lodash-es';
import classNames from 'classnames';
import { type RenderFullLabelProps } from '@coze-arch/bot-semi/Tree';
import { IconCozArrowRight } from '@coze-arch/coze-design/icons';

import { type Variable, type ViewVariableType } from '@/store';

import { type TreeNodeCustomData } from '../../type';
import { TreeIndentWidth } from '../../constants';
import { ChangeMode } from './constants';
import ParamType from './components/param-type';
import ParamOperator from './components/param-operator';
import { ParamName } from './components/param-name';
import { ParamDescription } from './components/param-description';
import { ParamDefault } from './components/param-default';
import { ParamChannel } from './components/param-channel';
export interface CustomTreeNodeProps extends RenderFullLabelProps {
  level: number;
  readonly?: boolean;
  variablePageCanEdit?: boolean;
  needRenderAppendChild?: boolean;
  onChange: (mode: ChangeMode, param: TreeNodeCustomData) => void;
  hasObjectLike?: boolean;
  disableDelete?: boolean;
  couldCollapse?: boolean;
  hideHeaderKeys?: string[];
  collapsed?: boolean;
  validateExistKeyword?: boolean;
  onCollapse?: (collapsed: boolean) => void;
}

export default function CustomTreeNode(props: CustomTreeNodeProps) {
  const {
    data,
    className,
    level,
    readonly = false,
    onChange,
    hasObjectLike,
    couldCollapse = true,
    hideHeaderKeys,
    collapsed = false,
    onCollapse,
    validateExistKeyword = false,
  } = props;
  // current value
  const value = cloneDeep(data) as Variable;
  const treeNodeRef = useRef<HTMLDivElement>(null);

  // When deleting
  const onDelete = () => {
    onChange(ChangeMode.Delete, value);
  };

  // When adding a child
  const onAppend = () => {
    onChange(ChangeMode.Append, value);
  };
  // When switching types
  const onSelectChange = (
    val?: string | number | Array<unknown> | Record<string, unknown>,
  ) => {
    if (val === undefined) {
      return;
    }
    if (!isNumber(val)) {
      return;
    }
    // Clear default
    value.defaultValue = '';
    value.children = [];
    onChange(ChangeMode.Update, { ...value, type: val as ViewVariableType });
  };
  const onDefaultChange = (
    val: string | number | boolean | TreeNodeCustomData,
  ) => {
    onChange(ChangeMode.Update, { ...value, defaultValue: val.toString() });
  };

  const onImportChange = (val: TreeNodeCustomData) => {
    onChange(ChangeMode.Replace, val);
  };

  const onNameChange = (name: string) => {
    if (value.name === name) {
      return;
    }
    onChange(ChangeMode.Update, { ...value, name });
  };

  const onDescriptionChange = useCallback(
    (description: string) => {
      if (value.description === description) {
        return;
      }
      onChange(ChangeMode.Update, { ...value, description });
    },
    [onChange, value],
  );

  const onEnabledChange = useCallback(
    (enabled: boolean) => {
      onChange(ChangeMode.UpdateEnabled, { ...value, enabled });
    },
    [onChange, value],
  );
  return (
    <div
      className={classNames('flex items-center', {
        [className]: Boolean(className),
      })}
      ref={treeNodeRef}
    >
      <div className="flex flex-1 my-3 gap-x-4 items-center w-full relative h-[32px]">
        <div className="flex flex-1 items-center flex-nowrap overflow-x-hidden overflow-y-visible">
          <div
            className="flex items-center justify-end"
            style={{ width: level * TreeIndentWidth }}
          ></div>
          <IconCozArrowRight
            className={classNames(
              'flex-none mr-2 w-[16px] h-[16px]',
              collapsed ? 'rotate-90' : '',
              couldCollapse ? '' : 'invisible',
              'cursor-pointer',
              level === 0 && !couldCollapse ? 'hidden' : '',
            )}
            onClick={() => {
              onCollapse?.(!collapsed);
            }}
          />
          <ParamName
            readonly={readonly}
            data={value}
            onChange={onNameChange}
            validateExistKeyword={validateExistKeyword}
          />
        </div>
        <div className="flex-1 overflow-hidden">
          <ParamDescription
            data={value}
            onChange={onDescriptionChange}
            readonly={readonly}
          />
        </div>
        {!hideHeaderKeys?.includes('type') ? (
          <div className="flex-none w-[166px] basis-[166px]">
            <ParamType
              level={level}
              readonly={readonly}
              data={value}
              onSelectChange={onSelectChange}
            />
          </div>
        ) : null}
        <div className="flex-none w-[164px] basis-[164px]">
          <ParamDefault
            readonly={readonly}
            data={value}
            onDefaultChange={onDefaultChange}
            onImportChange={onImportChange}
          />
        </div>
        <div className="flex-none w-[164px] basis-[164px] empty:hidden">
          <ParamChannel value={value} />
        </div>
        <div className="flex-none w-[130px] basis-[130px]">
          <ParamOperator
            data={value}
            readonly={readonly}
            level={level}
            onDelete={onDelete}
            onAppend={onAppend}
            hasObjectLike={hasObjectLike}
            needRenderAppendChild={!hideHeaderKeys?.includes('type')}
            onEnabledChange={onEnabledChange}
          />
        </div>
      </div>
    </div>
  );
}
