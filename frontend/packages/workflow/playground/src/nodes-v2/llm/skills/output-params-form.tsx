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

import { cloneDeep, set } from 'lodash-es';
import { type WithCustomStyle } from '@coze-workflow/base/types';
import { I18n } from '@coze-arch/i18n';
import { Tree, Tooltip } from '@coze-arch/bot-semi';
import { IconInfo } from '@coze-arch/bot-icons';
import { Form, Select, Switch } from '@coze-arch/coze-design';

import { VariableTypeTag } from '@/form-extensions/components/variable-type-tag';

import { type FCResponseParamsSetting, type PluginFCSetting } from './types';
import { TypeMap } from './constants';

export interface ResponseSettings {
  response_params?: PluginFCSetting['response_params'];
  response_style?: PluginFCSetting['response_style'];
}

interface OutputParamsFormProps {
  initValue?: ResponseSettings;
  onChange: (value: ResponseSettings) => void;
}

export const OutputParamsForm: FC<
  WithCustomStyle<OutputParamsFormProps>
> = props => {
  const { initValue, onChange } = props;

  const handleResponseModeChange = value => {
    onChange?.({
      ...initValue,
      response_style: {
        mode: value,
      },
    });
  };

  const handleParamEnableChange =
    (indexPath: Array<number | string>, item: FCResponseParamsSetting) =>
    (enable: boolean) => {
      if (!initValue) {
        return;
      }

      const newValue = cloneDeep(initValue);

      set(newValue.response_params ?? [], indexPath.join('.'), {
        ...item,
        local_disable: !enable,
      });

      onChange?.(newValue);
    };

  const normalizeTreeData = (
    responseParams: PluginFCSetting['response_params'],
    indexPath: Array<number | string> = [],
  ) =>
    responseParams?.map((item, index) => {
      const currentIndexPath = [...indexPath, index];

      return {
        label: (
          <div className="flex items-center text-xs">
            <div className="flex-1">
              <div className="flex items-center">
                <div className="font-medium">{item.name}</div>
                <div>
                  <VariableTypeTag>
                    {TypeMap.get(item.type as number)}
                  </VariableTypeTag>
                </div>
              </div>
              {item.desc ? <div className="coz-fg-dim">{item.desc}</div> : null}
            </div>
            <div
              style={{
                flex: '0 0 60px',
              }}
            >
              <Switch
                size="mini"
                checked={item.local_disable === true ? false : true}
                onChange={handleParamEnableChange(currentIndexPath, item)}
              />
            </div>
          </div>
        ),
        value: item.name,
        key: currentIndexPath.join('-'),
        children: item.sub_parameters
          ? normalizeTreeData(item.sub_parameters, [
              ...currentIndexPath,
              'sub_parameters',
            ])
          : null,
      };
    });

  return (
    <div className="h-full flex flex-col">
      <>
        <div>
          <Form.Label text={I18n.t('skillset_241115_01')} />
        </div>
        <Select
          className="mb-4"
          defaultValue={initValue?.response_style?.mode}
          disabled
          optionList={[
            {
              label: I18n.t('skillset_241115_02'),
              value: 1,
            },
            {
              label: I18n.t('skillset_241115_03'),
              value: 0,
            },
          ]}
          onChange={handleResponseModeChange}
        />
      </>
      <>
        <div>
          <Form.Label text={I18n.t('workflow_detail_end_output')} />
        </div>
        <div className="text-xs text-left coz-fg-secondary coz-mg-hglt py-2 px-3 rounded-lg">
          {I18n.t('plugin_bot_ide_plugin_setting_modal_item_enable_tip')}
        </div>
        <div className="flex text-xs coz-fg-dim font-medium mt-3">
          <div className="flex-1 pl-[26px]">
            {I18n.t('Create_newtool_s3_table_name')}
          </div>
          <div
            style={{
              flex: '0 0 60px',
            }}
          >
            {I18n.t('plugin_edit_tool_default_value_config_item_enable')}
            <Tooltip content={I18n.t('plugin_bot_ide_output_param_enable_tip')}>
              <IconInfo className="relative left-[2px] top-[3px]" />
            </Tooltip>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <Tree
            treeData={normalizeTreeData(initValue?.response_params)}
            defaultExpandAll
          />
        </div>
      </>
    </div>
  );
};
