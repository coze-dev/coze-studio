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

import { useState } from 'react';

import cls from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { IconCozEdit } from '@coze-arch/coze-design/icons';
import { CozInputNumber, Switch, Input } from '@coze-arch/coze-design';

import { ViewVariableType } from '@/store';
import { type TreeNodeCustomData } from '@/components/variable-tree/type';

import { ReadonlyText } from '../readonly-text';
import { JSONLikeTypes } from '../../constants';
import { JSONImport } from '../../../json-import';

interface ParamDefaultProps {
  data: TreeNodeCustomData;
  onDefaultChange: (value: string | number | boolean) => void;
  onImportChange: (value: TreeNodeCustomData) => void;
  readonly?: boolean;
}

export const ParamDefault = (props: ParamDefaultProps) => {
  const { data, onDefaultChange, onImportChange, readonly } = props;
  const [jsonModalVisible, setJsonModalVisible] = useState(false);

  const isRoot = data.meta.level === 0;
  const isString = isRoot && data.type === ViewVariableType.String;
  const isNumber =
    isRoot &&
    (data.type === ViewVariableType.Number ||
      data.type === ViewVariableType.Integer);
  const isBoolean = isRoot && data.type === ViewVariableType.Boolean;
  const isShowJsonImport = JSONLikeTypes.includes(data.type) && isRoot;

  return (
    <div className="w-[144px] h-full flex items-center [&_.semi-input-number-suffix-btns]:!h-auto">
      <div className="flex flex-col w-full relative">
        {readonly && !isShowJsonImport ? (
          <ReadonlyText
            className="w-[144px]"
            value={data.defaultValue || '-'}
          />
        ) : (
          <>
            {isString ? (
              <Input
                value={data.defaultValue}
                onChange={value => onDefaultChange(value)}
                placeholder={I18n.t(
                  'workflow_detail_title_testrun_error_input',
                  {
                    a: data.name,
                  },
                )}
                maxLength={1000}
                disabled={readonly}
              />
            ) : null}

            {isNumber ? (
              <CozInputNumber
                className={cls('h-full', {
                  '[&_.semi-input-wrapper]:!coz-stroke-plus': true,
                })}
                value={data.defaultValue}
                onChange={value => onDefaultChange(value)}
                placeholder={I18n.t(
                  'workflow_detail_title_testrun_error_input',
                  {
                    a: data.name,
                  },
                )}
                disabled={readonly}
              />
            ) : null}

            {isBoolean ? (
              <Switch
                checked={Boolean(data.defaultValue === 'true')}
                size="small"
                onChange={value => onDefaultChange(value)}
                disabled={readonly}
              />
            ) : null}

            {isShowJsonImport ? (
              <>
                <div
                  onClick={() => setJsonModalVisible(true)}
                  className={cls(
                    'coz-mg-primary rounded cursor-pointer flex items-center justify-center h-[32px] gap-x-1',
                    {
                      'coz-fg-primary': !readonly,
                      'coz-fg-dim': readonly,
                    },
                  )}
                >
                  <IconCozEdit />
                  <span className="text-sm font-medium">
                    {readonly
                      ? I18n.t('variables_json_input_readonly_button')
                      : I18n.t('variable_button_input_json')}
                  </span>
                </div>
                <JSONImport
                  visible={jsonModalVisible}
                  treeData={data}
                  rules={{
                    jsonImport: true,
                    readonly: Boolean(readonly),
                  }}
                  onOk={value => {
                    onImportChange(value);
                    setJsonModalVisible(false);
                  }}
                  onCancel={() => setJsonModalVisible(false)}
                />
              </>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
};
