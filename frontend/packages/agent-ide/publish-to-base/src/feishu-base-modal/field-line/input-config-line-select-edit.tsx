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

import { createContext, type FC, useContext } from 'react';

import { nanoid } from 'nanoid';
import { produce } from 'immer';
import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { IconCozPlus, IconCozTrashCan } from '@coze-arch/coze-design/icons';
import { Button, Input } from '@coze-arch/coze-design';

import { SortableFieldTable } from '../sortable-field-table';
import type { InputComponentSelectOption, InputConfigFe } from '../../types';

import styles from './index.module.less';

const SelectSubEditContext = createContext<{
  onChange?: (choice: InputComponentSelectOption) => void;
  onDelete?: (data: InputComponentSelectOption) => void;
  choiceLength?: number;
}>({});

export const SelectSubEditComponent: FC<{
  config: InputConfigFe;
  onUpdate: (cfg: InputConfigFe) => void;
}> = ({ config, onUpdate }) => (
  <div>
    <div className="flex ml-[8px] mt-[20px]">
      <span className="coz-fg-secondary text-[12px] font-medium leading-[16px]">
        {I18n.t('publish_base_inputFieldConfig_options')}
      </span>
      <Button
        icon={<IconCozPlus />}
        onClick={() => {
          onUpdate(
            produce<InputConfigFe>(cfg => {
              cfg.input_component.choice.push({
                name: '',
                id: nanoid(),
              });
            })(config),
          );
        }}
        color="secondary"
        size="small"
        className="ml-auto"
      >
        {I18n.t('Add_1')}
      </Button>
    </div>
    <SelectSubEditContext.Provider
      value={{
        onChange: choiceItem => {
          onUpdate(
            produce<InputConfigFe>(cfg => {
              const { choice } = cfg.input_component;
              const idx = choice.findIndex(i => i.id === choiceItem.id);
              choice.splice(idx, 1, choiceItem);
            })(config),
          );
        },
        choiceLength: config.input_component.choice?.length || 0,
        onDelete: delData => {
          onUpdate(
            produce<InputConfigFe>(cfg => {
              cfg.input_component.choice = cfg.input_component.choice.filter(
                it => it.id !== delData.id,
              );
            })(config),
          );
        },
      }}
    >
      <SortableFieldTable<InputComponentSelectOption>
        enabled={config.input_component.choice.length > 1}
        headless
        style={{
          padding: 0,
        }}
        headers={[
          {
            width: 192,
            name: '',
            required: false,
          },
        ]}
        data={config.input_component.choice.map(data => ({
          data,
          deletable: false,
          lineStyle: {
            paddingRight: 0,
            paddingTop: 8,
          },
          getKey: it => it.id,
          bizComponent: SelectEditLine,
        }))}
        getId={data => data.data.id}
        onChange={data => {
          const choice = data.map(it => it.data);
          onUpdate(
            produce<InputConfigFe>(cfg => {
              cfg.input_component.choice = choice;
            })(config),
          );
        }}
      />
    </SelectSubEditContext.Provider>
  </div>
);

const SelectEditLine: FC<{
  data: InputComponentSelectOption;
}> = ({ data }) => {
  const { onChange, onDelete, choiceLength } = useContext(SelectSubEditContext);

  if (choiceLength === undefined || !onChange || !onDelete) {
    throw new Error('impossible context member miss');
  }

  return (
    <Input
      value={data.name}
      onChange={str => {
        onChange({
          id: data.id,
          name: str,
        });
      }}
      className={classNames(styles.input_deletable, 'w-full mr-[8px]')}
      suffix={
        choiceLength <= 1 ? null : (
          <Button
            color="secondary"
            onClick={() => onDelete(data)}
            icon={<IconCozTrashCan />}
            style={{
              width: 24,
              height: 24,
              minWidth: 0,
              padding: 0,
            }}
          ></Button>
        )
      }
    />
  );
};
