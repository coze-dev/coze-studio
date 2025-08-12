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

import { type FC, useState } from 'react';

import { I18n } from '@coze-arch/i18n';
import { InputComponentType } from '@coze-arch/bot-api/connector_api';

import { type InputConfigFe } from '../types';
import {
  useConfigAsserted,
  useConfigStoreGuarded,
} from '../context/store-context';
import { ERROR_LINE_HEIGHT } from '../constants';
import { type HeaderItem, SortableFieldTable } from './sortable-field-table';
import {
  BaseInputFieldLine,
  inputFieldColumnWidth,
  type InputComponentOption,
  InputLineCommonContext,
} from './field-line/input-config-line';

export const BaseInputFieldsTable: FC = () => {
  const config = useConfigAsserted();
  const inputFields = config.input_config || [];
  const updateConfigByImmer = useConfigStoreGuarded()(
    state => state.updateConfigByImmer,
  );
  const [errorLines, setErrorLines] = useState<string[]>([]);

  return (
    <div className="mt-[4px]">
      <InputLineCommonContext.Provider
        value={{
          inputFieldsSelectorList: config.input_type_list,
          onChange: val => {
            updateConfigByImmer(cfg => {
              const fields = cfg.input_config;
              const idx = fields.findIndex(field => field._id === val._id);
              fields[idx] = val;
            });
          },
          inputOptions: getInputOptions(),
          onToggleError: (id, error) => {
            setErrorLines(lines => {
              if (!error) {
                return lines.filter(lineId => lineId !== id);
              }
              const inLines = lines.includes(id);
              if (!inLines) {
                return [...lines, id];
              }
              return lines;
            });
          },
        }}
      >
        <SortableFieldTable<InputConfigFe>
          enabled={inputFields.length > 1}
          headers={getInputFieldsHeaders()}
          data={inputFields.map(field => ({
            deletable: field.invalid ?? false,
            bizComponent: BaseInputFieldLine,
            data: field,
            getKey: data => data._id,
            onDelete: delItem => {
              updateConfigByImmer(cfg => {
                cfg.input_config = cfg.input_config.filter(
                  e => e._id !== delItem._id,
                );
              });
            },
            deleteButtonStyle: {
              width: 32,
            },
            lineStyle: {
              marginTop: 8,
              paddingBottom: errorLines.some(id => id.includes(field._id))
                ? ERROR_LINE_HEIGHT
                : 0,
            },
          }))}
          getId={data => data.data._id}
          onChange={mix =>
            updateConfigByImmer(cfg => {
              cfg.input_config = mix.map(x => x.data);
            })
          }
        />
      </InputLineCommonContext.Provider>
    </div>
  );
};

const getInputFieldsHeaders = (): HeaderItem[] => [
  {
    name: I18n.t('publish_base_configFields_field'),
    required: false,
    width: inputFieldColumnWidth.field,
  },
  {
    name: I18n.t('publish_base_configFields_title'),
    required: true,
    width: inputFieldColumnWidth.title,
  },
  {
    name: I18n.t('publish_base_configFields_placeholder'),
    required: false,
    width: inputFieldColumnWidth.placeholder,
  },
  {
    name: I18n.t('publish_base_configFields_component'),
    required: true,
    width: inputFieldColumnWidth.control,
  },
  {
    name: I18n.t('required'),
    required: false,
    width: inputFieldColumnWidth.required,
  },
];

const getInputOptions = (): InputComponentOption[] => [
  {
    label: I18n.t('publish_base_inputFieldConfig_textInput'),
    value: InputComponentType.Text,
  },
  {
    label: I18n.t('publish_base_inputFieldConfig_singleSelect'),
    value: InputComponentType.SingleSelect,
  },
  {
    label: I18n.t('publish_base_inputFieldConfig_multiSelect'),
    value: InputComponentType.MultiSelect,
  },
  {
    label: I18n.t('publish_base_inputFieldConfig_fieldSelector'),
    value: InputComponentType.FieldSelector,
  },
];
