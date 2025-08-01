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

import { type FC } from 'react';

import cls from 'classnames';
import { ViewVariableType } from '@coze-workflow/base/types';
import { I18n } from '@coze-arch/i18n';
import { IconCozImage, IconCozString } from '@coze-arch/coze-design/icons';
import {
  type RenderSelectedItemFn,
  Select,
  type SelectProps,
  Tag,
} from '@coze-arch/coze-design';

import { useGlobalContext } from '../../context';

import s from './ref-select.module.less';

type IProps = SelectProps & {
  value: string;
  label: string;
  labelInside: boolean;
};
export const RefSelect: FC<IProps> = props => {
  const { value: objectId, label, labelInside, className } = props;
  const { customVariableRefs, variables, updateRefByObjectId } =
    useGlobalContext();

  const targetRef = customVariableRefs?.find(ref => ref.objectId === objectId);
  const value = targetRef?.variableId;
  const targetVariable = variables?.find(v => v.id === value);

  return (
    <div className="w-full text-[14px] flex flex-row gap-[8px] items-center">
      {!labelInside && label ? (
        <div className="text-[14px] min-w-[80px]">{label}</div>
      ) : (
        <></>
      )}
      <Select
        prefix={
          labelInside && label ? (
            <div className="text-[14px] pl-[8px] pr-[4px] py-[2px] min-w-[40px]">
              {label}
            </div>
          ) : undefined
        }
        showClear
        showTick={false}
        placeholder={I18n.t('imageflow_canvas_select_var', {}, '选择变量')}
        value={targetRef?.variableId}
        className={cls(className, s['ref-select'])}
        onChange={d => {
          updateRefByObjectId?.({
            objectId,
            variable: d ? variables?.find(v => v.id === d) : undefined,
          });
        }}
        renderSelectedItem={
          ((options: { value: string; label: React.ReactNode }) => {
            const { value: _value, label: _label } = options;
            const variable = variables?.find(v => v.id === _value);
            if (variable) {
              return (
                <Tag color="primary" className="w-full">
                  <div className="flex flex-row items-center gap-[4px] w-full">
                    {variable.type === ViewVariableType.String ? (
                      <IconCozString className="coz-fg-dim" />
                    ) : (
                      <IconCozImage className="coz-fg-dim" />
                    )}
                    <div className="flex-1 overflow-hidden">
                      <div className="truncate w-full overflow-hidden">
                        {variable.name}
                      </div>
                    </div>
                  </div>
                </Tag>
              );
            }
            return _label;
          }) as RenderSelectedItemFn
        }
      >
        {value && !targetVariable ? (
          <Select.Option value={value}>
            <Tag className="max-w-full m-[8px]" color="yellow">
              <div className="truncate overflow-hidden">
                {I18n.t('imageflow_canvas_var_delete', {}, '变量被删除')}
              </div>
            </Tag>
          </Select.Option>
        ) : (
          <></>
        )}

        {variables?.map(v => (
          <Select.Option value={v.id}>
            <div className="flex flex-row items-center gap-[4px] w-full p-[8px] max-w-[400px]">
              {v.type === ViewVariableType.String ? (
                <IconCozString className="coz-fg-dim" />
              ) : (
                <IconCozImage className="coz-fg-dim" />
              )}

              <div className="flex-1 overflow-hidden">
                <div className="truncate w-full overflow-hidden">{v.name}</div>
              </div>
              {v.id === value ? (
                <Tag color="primary">
                  {I18n.t('eval_status_referenced', {}, '已引用')}
                </Tag>
              ) : null}
            </div>
          </Select.Option>
        ))}
      </Select>
    </div>
  );
};
