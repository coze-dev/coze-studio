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

import { createContext, type FC, useContext, useState } from 'react';

import { nanoid } from 'nanoid';
import { produce } from 'immer';
import classnames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { IconCozInfoCircle } from '@coze-arch/coze-design/icons';
import {
  Button,
  Input,
  InputNumber,
  Popover,
  Radio,
  RadioGroup,
  Select,
  Tag,
  Typography,
} from '@coze-arch/coze-design';
import {
  InputComponentType,
  type InputTypeInfo,
} from '@coze-arch/bot-api/connector_api';

import { getIsSelectType } from '../../validate/utils';
import { validateSingleInputFieldControl } from '../../validate';
import { type InputConfigFe } from '../../types';
import { type ConfigStoreState } from '../../store';
import { MdTooltip } from '../../md-tooltip';
import { useConfigStoreGuarded } from '../../context/store-context';
import { INPUT_CONFIG_TEXT_MAX_CHAR } from '../../constants';
import { BigCheckbox } from '../../big-checkbox';
import { useRequireVerify } from './use-require-verify';
import { RequiredWarn } from './required-warn';
import { SelectSubEditComponent } from './input-config-line-select-edit';

export const inputFieldColumnWidth = {
  field: 110,
  title: 118,
  placeholder: 118,
  control: 118,
  required: 60,
};

export interface InputComponentOption {
  label: string;
  value: InputComponentType;
}

const USER_QUERY_FIELD_NAME = 'user_query';
const INVALID_LINE_OPACITY = 0.3;

export const InputLineCommonContext = createContext<{
  onChange?: (val: InputConfigFe) => void;
  inputFieldsSelectorList?: InputTypeInfo[];
  inputOptions?: InputComponentOption[];
  onToggleError?: (id: string, error: boolean) => void;
}>({});

const getInputConfig = (storeState: ConfigStoreState, id: string) => {
  const data = storeState.config?.input_config.find(item => item._id === id);
  if (!data) {
    throw new Error(`cannot find data of ${id}`);
  }
  return data;
};

export const BaseInputFieldLine: FC<{
  data: InputConfigFe;
  // eslint-disable-next-line @coze-arch/max-line-per-function -- rat rat me, I am also very helpless
}> = ({ data: { _id: id } }) => {
  const { onChange, inputFieldsSelectorList, inputOptions, onToggleError } =
    useContext(InputLineCommonContext);
  const store = useConfigStoreGuarded();
  const data = useConfigStoreGuarded()(state => getInputConfig(state, id));
  if (!data) {
    throw new Error(`cannot find data of ${id}`);
  }
  if (
    !inputFieldsSelectorList ||
    !onChange ||
    !inputOptions ||
    !onToggleError
  ) {
    throw new Error('impossible context member miss');
  }
  const changeByImmer = (updater: (sth: InputConfigFe) => void) => {
    onChange(produce<InputConfigFe>(updater)(data));
  };
  const isUserQuery = data.field === USER_QUERY_FIELD_NAME;

  const [showPopover, setShowPopover] = useState(false);

  const getVal = () => getInputConfig(store.getState(), id);
  const titleRequire = useRequireVerify({
    getVal,
    verify: config => !!config?.title,
    onChange: isError => onToggleError(`${id}#title`, isError),
  });
  const controlRequire = useRequireVerify({
    getVal,
    verify: config => !!config?.input_component.type,
    onChange: isError => onToggleError(`${id}#control`, isError),
  });

  return (
    <>
      <div
        className="coz-fg-secondary text-[14px] leading-[20px] flex items-center"
        style={{
          width: inputFieldColumnWidth.field,
          opacity: data.invalid ? INVALID_LINE_OPACITY : 1,
        }}
      >
        <Typography.Text
          className={classnames('mr-[3px] coz-fg-secondary')}
          ellipsis={{ showTooltip: true }}
        >
          {data.field}
        </Typography.Text>
        {data.desc ? (
          <MdTooltip content={data.desc} tooltipPosition="right">
            <Button
              className="!w-[14px] !h-[16px] !min-w-0 !p-0"
              theme="borderless"
              type="secondary"
              color="secondary"
              icon={<IconCozInfoCircle className="text-[12px]" />}
            />
          </MdTooltip>
        ) : null}
        {data.invalid ? (
          <Tag color="primary" size="mini">
            {I18n.t('publish_base_configFields_invalid')}
          </Tag>
        ) : null}
      </div>

      <div
        style={{
          width: inputFieldColumnWidth.title,
          position: 'relative',
        }}
      >
        <Input
          error={titleRequire.showWarn}
          onBlur={titleRequire.onTrigger}
          value={data.title}
          onChange={val =>
            changeByImmer(origin => {
              origin.title = val;
            })
          }
          placeholder={I18n.t('publish_base_configFields_title_placeholder')}
          disabled={data.invalid}
          maxLength={30}
        />
        {titleRequire.showWarn ? <RequiredWarn /> : null}
      </div>

      <Input
        value={data.placeholder}
        onChange={val =>
          changeByImmer(origin => {
            origin.placeholder = val;
          })
        }
        placeholder={I18n.t(
          'publish_base_configFields_placeholder_placeholder',
        )}
        style={{
          width: inputFieldColumnWidth.placeholder,
        }}
        disabled={data.invalid}
        maxLength={30}
      />

      <Popover
        visible={showPopover}
        trigger="custom"
        position="top"
        content={
          <InputFieldControlConfig
            originConfig={data}
            inputOptions={inputOptions}
            closePanel={() => {
              setShowPopover(false);
              controlRequire.onTrigger();
            }}
            onUpdate={(config: InputConfigFe) => {
              onChange(config);
            }}
            inputFieldsSelectorList={inputFieldsSelectorList}
          />
        }
      >
        <div
          style={{
            width: inputFieldColumnWidth.control,
            position: 'relative',
          }}
        >
          <div
            onClick={() => {
              if (!data.invalid) {
                setShowPopover(true);
              }
            }}
          >
            <Select
              disabled={data.invalid}
              optionList={inputOptions}
              value={data.input_component.type}
              className="w-full"
              dropdownStyle={{
                display: 'none',
              }}
              renderOptionItem={() => null}
              placeholder={I18n.t(
                'publish_base_configFields_component_placeholder',
              )}
              hasError={controlRequire.showWarn}
            />
          </div>
          {controlRequire.showWarn ? <RequiredWarn /> : null}
        </div>
      </Popover>

      {data.invalid ? null : (
        <BigCheckbox
          style={{
            marginLeft: 'auto',
          }}
          checked={isUserQuery || data.required}
          disabled={isUserQuery}
          onChange={e => {
            const val = Boolean(e.target.checked);
            changeByImmer(cur => {
              cur.required = val;
            });
          }}
        />
      )}
    </>
  );
};

const InputFieldControlConfig: FC<{
  onUpdate: (config: InputConfigFe) => void;
  inputOptions: InputComponentOption[];
  inputFieldsSelectorList: InputTypeInfo[];
  originConfig: InputConfigFe;
  closePanel: () => void;
}> = ({
  inputOptions,
  onUpdate: submitSubConfig,
  originConfig,
  closePanel,
  inputFieldsSelectorList,
}) => {
  const [config, setConfig] = useState(() => originConfig);
  const fieldsSelectorOptions = inputFieldsSelectorList.map(opt => ({
    value: opt.id,
    label: opt.name,
  }));
  return (
    <div className="pl-[12px] pb-[16px]">
      <div className="overflow-y-auto max-h-[320px] pt-[12px] pr-[12px]">
        <div className="ml-[8px]">
          <p className="coz-fg-secondary text-[12px] font-medium leading-[16px]">
            {I18n.t('publish_base_configFields_component')}
          </p>
        </div>
        <RadioGroup
          className="mx-[8px] mt-[14px] grid grid-cols-2 gap-[12px]"
          defaultValue={config.input_component.type}
          onChange={val => {
            const type = val.target.value as InputComponentType;
            setConfig(
              produce<InputConfigFe>(curConfig => {
                curConfig.input_component.type = type;
                if (
                  getIsSelectType(type) &&
                  !curConfig.input_component.choice?.length
                ) {
                  curConfig.input_component.choice.push({
                    name: '',
                    id: nanoid(),
                  });
                }
              }),
            );
          }}
        >
          {inputOptions.map(option => (
            <Radio key={option.value} value={option.value} className="">
              {option.label}
            </Radio>
          ))}
        </RadioGroup>
        {config.input_component.type === InputComponentType.Text ? (
          <div className="ml-[8px] mt-[20px]">
            <div className="coz-fg-secondary text-[12px] font-medium leading-[16px]">
              {I18n.t('publish_base_inputFieldConfig_maxChars')}
            </div>
            <InputNumber
              style={{
                marginTop: 6,
              }}
              defaultValue={config.input_component.max_char}
              max={INPUT_CONFIG_TEXT_MAX_CHAR}
              min={config.required ? 1 : 0}
              onChange={val => {
                setConfig(
                  produce<InputConfigFe>(curConfig => {
                    curConfig.input_component.max_char = Number(val);
                  }),
                );
              }}
            />
          </div>
        ) : null}
        {getIsSelectType(config.input_component.type) ? (
          <SelectSubEditComponent config={config} onUpdate={setConfig} />
        ) : null}
        {config.input_component.type === InputComponentType.FieldSelector ? (
          <div>
            <div className="flex ml-[8px] mt-[20px]">
              <span className="coz-fg-secondary text-[12px] font-medium leading-[16px]">
                {I18n.t('publish_base_inputFieldConfig_supports')}
              </span>
            </div>
            <Select
              style={{
                width: 256,
                marginTop: 6,
              }}
              optionList={fieldsSelectorOptions}
              multiple
              defaultValue={config.input_component.supported_type}
              maxTagCount={2}
              expandRestTagsOnClick
              onChange={valRaw => {
                const val = valRaw as number[];
                setConfig(
                  produce<InputConfigFe>(curConfig => {
                    curConfig.input_component.supported_type = val;
                  }),
                );
              }}
            ></Select>
          </div>
        ) : null}
      </div>
      <div className="flex gap-[8px] items-center mt-[24px] mr-[12px]">
        <Button color="primary" onClick={closePanel} className="ml-auto">
          {I18n.t('Cancel')}
        </Button>
        <Button
          disabled={!validateSingleInputFieldControl(config)}
          onClick={() => {
            submitSubConfig(config);
            closePanel();
          }}
        >
          {I18n.t('Confirm')}
        </Button>
      </div>
    </div>
  );
};
