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

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import cls from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { Button } from '@coze-arch/coze-design';
import { Toast, UIInput, Popover, Form } from '@coze-arch/bot-semi';
import { IconChevronDown } from '@douyinfe/semi-icons';

import {
  type ComponentTypeItem,
  type ComponentTypeSelectContentRadioValueType,
  type SelectComponentTypeItem,
  type UploadComponentTypeItem,
} from '../types';
import { UploadContent } from './upload-contnet';
import { SelectContentField } from './select-content';
import { formatComponentTypeForm } from './method';

const { RadioGroup, Radio } = Form;

const SelectTypeAndLableMap: Record<
  ComponentTypeSelectContentRadioValueType,
  string
> = {
  text: I18n.t('shortcut_component_type_text'),
  select: I18n.t('shortcut_component_type_selector'),
  upload: I18n.t('shortcut_modal_components_modal_upload_component'),
};

export const ComponentTypeSelectRecordItem = (props: {
  value: ComponentTypeItem;
  onSubmit?: (value: ComponentTypeItem) => void;
  disabled?: boolean;
}) => {
  const { value: defaultValue, onSubmit, disabled = false } = props;
  const [submitValue, setSubmitValue] =
    useState<ComponentTypeItem>(defaultValue);
  const [componentType, setComponentType] =
    useState<ComponentTypeItem>(defaultValue);
  const [selectPopoverVisible, setSelectPopoverVisible] = useState(false);
  const componentTypeSelectFormRef = useRef<{
    formApi: ComponentTypeSelectFormMethods;
  } | null>(null);
  const onComponentTypeSelectFormSubmit = async () => {
    if (await componentTypeSelectFormRef.current?.formApi.validate()) {
      if (!componentType) {
        return;
      }
      onSubmit?.(componentType);
      setSubmitValue(componentType);
      setSelectPopoverVisible(false);
    }
  };

  useEffect(() => {
    setSubmitValue(defaultValue);
  }, [defaultValue]);

  return (
    <div className="flex items-center">
      <div className="w-full">
        <>
          <Popover
            trigger="custom"
            footer={null}
            visible={selectPopoverVisible}
            position="topRight"
            onClickOutSide={() => setSelectPopoverVisible(false)}
            content={() => (
              <div className="p-6 w-[288px]">
                <ComponentTypeSelectForm
                  ref={componentTypeSelectFormRef}
                  value={submitValue}
                  onChange={setComponentType}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    color="highlight"
                    onClick={() => setSelectPopoverVisible(false)}
                  >
                    {I18n.t('cancel')}
                  </Button>
                  <Button onClick={onComponentTypeSelectFormSubmit}>
                    {I18n.t('Confirm')}
                  </Button>
                </div>
              </div>
            )}
          >
            <UIInput
              className={cls('w-full', disabled && '!pointer-events-auto')}
              suffix={
                <IconChevronDown
                  onClick={() => setSelectPopoverVisible(!selectPopoverVisible)}
                />
              }
              placeholder={I18n.t(
                'shortcut_modal_selector_component_default_text',
              )}
              value={SelectTypeAndLableMap[submitValue?.type]}
              onClick={() => setSelectPopoverVisible(!selectPopoverVisible)}
              disabled={disabled}
              readonly
            />
          </Popover>
        </>
      </div>
    </div>
  );
};

export interface ComponentTypeSelectFormProps {
  value: ComponentTypeItem;
  onChange?: (values: ComponentTypeItem) => void;
}

export interface ComponentTypeSelectFormMethods {
  validate: () => Promise<boolean>;
}

export const ComponentTypeSelectForm = forwardRef<
  { formApi?: ComponentTypeSelectFormMethods },
  ComponentTypeSelectFormProps
>((props, ref) => {
  const { value, onChange } = props;
  const [selectOption, setSelectOption] =
    useState<ComponentTypeSelectContentRadioValueType>(value.type);
  const optionsMap = getComponentTypeOptionMap(value);
  const formRef = useRef<Form>(null);

  useImperativeHandle(ref, () => ({
    formApi: {
      validate: async () => {
        try {
          if (selectOption === 'select') {
            return Boolean(
              await formRef.current?.formApi.validate(['values.options']),
            );
          }
          if (selectOption === 'upload') {
            return Boolean(
              await formRef.current?.formApi.validate(['values.uploadTypes']),
            );
          }
          return true;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (errors: any) {
          if (selectOption === 'select') {
            const message = errors?.values?.options;
            message && Toast.error(message);
          }
          if (selectOption === 'upload') {
            const message = errors?.values?.uploadTypes;
            message && Toast.error(message);
          }
          return false;
        }
      },
    },
  }));

  return (
    <Form<{ values: ComponentTypeItem }>
      autoComplete="off"
      ref={formRef}
      initValues={{ values: value }}
      className="flex flex-col gap-6"
      onValueChange={({ values }) => {
        onChange?.(formatComponentTypeForm(values));
      }}
    >
      <div className="coz-fg-plus text-[16px] font-medium">
        {I18n.t('shortcut_modal_components_modal_component_type')}
      </div>
      <RadioGroup
        fieldStyle={{
          padding: 0,
        }}
        className="flex flex-col !p-0 gap-3"
        defaultValue={selectOption}
        field="values.type"
        noLabel
        onChange={e => {
          setSelectOption(e.target.value);
        }}
      >
        {Object.entries(optionsMap).map(([key, { label }]) => (
          <Radio value={key}>{label}</Radio>
        ))}
      </RadioGroup>
      {Object.entries(optionsMap).map(([key, { render }]) => (
        <div
          key={key}
          className={cls({
            hidden: key !== selectOption,
          })}
        >
          {render?.()}
        </div>
      ))}
    </Form>
  );
});

const getComponentTypeOptionMap = (
  initValue?: ComponentTypeItem,
): {
  [key in ComponentTypeSelectContentRadioValueType]: {
    label: string;
    render?: () => React.ReactNode;
  };
} => ({
  text: {
    label: I18n.t('shortcut_component_type_text'),
  },
  select: {
    label: I18n.t('shortcut_component_type_selector'),
    render: () => (
      <SelectContentField
        field="values.options"
        value={(initValue as SelectComponentTypeItem)?.options}
      />
    ),
  },
  upload: {
    label: I18n.t('shortcut_modal_components_modal_upload_component'),
    render: () => (
      <UploadContent
        value={(initValue as UploadComponentTypeItem)?.uploadTypes}
      />
    ),
  },
});
