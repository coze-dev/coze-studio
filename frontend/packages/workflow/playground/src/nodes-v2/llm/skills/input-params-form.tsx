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

import { type FC, type RefObject } from 'react';

import { type WithCustomStyle } from '@coze-workflow/base/types';
import { I18n } from '@coze-arch/i18n';
import { Tooltip } from '@coze-arch/bot-semi';
import { IconInfo } from '@coze-arch/bot-icons';
import { Input, Switch, Table, Tag } from '@coze-arch/coze-design';

import { VariableTypeTag } from '@/form-extensions/components/variable-type-tag';

import { useTableScroll } from './use-table-scroll';
import { type FCRequestParamsSetting, type PluginFCSetting } from './types';
import { TypeMap } from './constants';

interface InputParamsFormProps {
  initValue?: PluginFCSetting['request_params'];
  onChange: (value: PluginFCSetting['request_params']) => void;
}

const GAP = 55;

export const InputParamsForm: FC<
  WithCustomStyle<InputParamsFormProps>
> = props => {
  const { initValue = [], onChange } = props;
  const { containerRef, scroll } = useTableScroll(GAP);

  const handleDefaultValueChange = index => (value: string) => {
    onChange?.(
      initValue.map((item, _index) => {
        if (_index === index) {
          return {
            ...item,
            local_default: value,
          };
        } else {
          return item;
        }
      }),
    );
  };

  const handleEnableChange = index => (checked: boolean) => {
    onChange?.(
      initValue.map((item, _index) => {
        if (_index === index) {
          return {
            ...item,
            local_disable: !checked,
          };
        } else {
          return item;
        }
      }),
    );
  };

  return (
    <div ref={containerRef as RefObject<HTMLDivElement>} className="h-full">
      <Table
        tableProps={{
          dataSource: initValue,
          scroll,
          columns: [
            {
              title: I18n.t('Create_newtool_s3_table_name'),
              dataIndex: 'name',
              width: 300,
              render: (text, record: FCRequestParamsSetting, index) => (
                <div>
                  <div className="flex items-center gap-2">
                    <div>{record.name}</div>
                    <VariableTypeTag>
                      {TypeMap.get(record.type as number)}
                    </VariableTypeTag>
                    {record.is_required ? (
                      <Tag color="red" size="mini">
                        {I18n.t('required')}
                      </Tag>
                    ) : null}
                  </div>
                  <div className="coz-fg-dim font-normal leading-4">
                    {record.desc}
                  </div>
                </div>
              ),
            },
            {
              title: I18n.t(
                'plugin_edit_tool_default_value_config_item_default_value',
              ),
              dataIndex: 'defaultValue',
              width: 160,
              render: (text, record: FCRequestParamsSetting, index) => (
                <Input
                  size="small"
                  defaultValue={record.local_default}
                  onChange={handleDefaultValueChange(index)}
                />
              ),
            },
            {
              title: () => (
                <div>
                  {I18n.t('plugin_edit_tool_default_value_config_item_enable')}
                  <Tooltip
                    content={I18n.t(
                      'plugin_bot_ide_plugin_setting_modal_item_enable_tip',
                    )}
                  >
                    <IconInfo className="relative left-[2px] top-[2px]" />
                  </Tooltip>
                </div>
              ),
              dataIndex: 'enable',
              render: (text, record: FCRequestParamsSetting, index) => (
                <Switch
                  size="mini"
                  checked={record.local_disable === false ? true : false}
                  onChange={handleEnableChange(index)}
                />
              ),
            },
          ],
        }}
      />
    </div>
  );
};
