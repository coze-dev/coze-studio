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
 
import { shortcut_command } from '@coze-arch/bot-api/playground_api';

import { shortid } from '../uuid';
import { getAcceptByUploadItemTypes } from '../file-const';
import { type DSL, ElementDirectiveType, ElementPropsType } from '../../types';

// @fixme DSL 类型定义需要更新
export const getDSLTemplate = (): DSL => ({
  elements: {
    root: {
      id: 'root',
      name: 'Root',
      type: '@flowpd/cici-components/PageContainer',
      children: ['form'],
      directives: {},
    },
    form: {
      id: 'form',
      name: 'FlowpdCiciComponentsForm', // TODO 组件名 & type 最好也能事先就约定好
      type: '@flowpd/cici-components/Form',
      props: {
        value: {
          type: ElementPropsType.EXPRESSION,
          value: '{{formValue}}',
        },
        onChange: {
          type: ElementPropsType.ACTION,
          value: '{{onChange}}',
        },
        ruls: {
          // some rules value
        },
      },
      children: ['submitButton'], // 根据 variables + layout 生成
    },
    // 通过 getFormElementsFromcomponent 生成表单元素
    // ...inputElements,
    // 通过 getElementsLayout 生成表单元素 layout
    // ...inputLayoutElements,
    submitButton: {
      id: 'submitButton',
      name: 'FlowpdCiciComponentsButton', // TODO 组件名 & type 最好也能事先就约定好
      type: '@flowpd/cici-components/Button',
      props: {
        onClick: {
          type: ElementPropsType.ACTION,
          value: '{{onSubmit}}',
        },
      },
    },
  },
  rootID: 'root',
  variables: {
    formValue: {
      id: 'formValue',
      defaultValue: {}, // 不需要缺省值
    },
  },
  actions: {
    onSubmit: {
      id: 'onSubmit',
      type: 'submit',
      data: {
        type: ElementDirectiveType.EXPRESSION,
        value: '{{formValue}}',
      },
    },
    onChange: {
      id: 'onChange',
      type: 'updateVar',
      target: 'formValue',
    },
  },
});

type DSLElement = DSL['elements'][string];
export type GetFormItemTemplate = (
  component: shortcut_command.Components,
) => DSLElement;

export const getInputElementDSL: GetFormItemTemplate = component => ({
  id: component.name ?? shortid(),
  name: 'FlowpdCiciComponentsInput', // TODO 组件名最好也能事先就约定好
  type: '@flowpd/cici-components/Input',
  props: {
    name: component.name,
    description: component.description,
    defaultValue: component.default_value,
    rules: [],
    noErrorMessage: true,
    // @FIXME DSL 解析逻辑实际支持传入任意值作为 props，但是类型定义里没有兼容这种语法
  } as unknown as DSLElement['props'],
});

export const getSelectElementDSL: GetFormItemTemplate = component => ({
  id: component.name ?? shortid(),
  name: 'FlowpdCiciComponentsSelect', // TODO 组件名最好也能事先就约定好
  type: '@flowpd/cici-components/Select',
  props: {
    name: component.name,
    description: component.description,
    defaultValue: component.default_value,
    optionList: component.options?.map(value => ({
      label: value,
      value,
    })),
    rules: [
      {
        required: true,
      },
    ],
    noErrorMessage: true,
    // @FIXME DSL 解析逻辑实际支持传入任意值作为 props，但是类型定义里没有兼容这种语法
  } as unknown as DSLElement['props'],
});

// 单位 kb
export const IMAGE_MAX_SIZE = 500 * 1024; // 500 mb
export const FILE_MAX_SIZE = 500 * 1024; // 500 mb

const getAcceptByComponent = (component: shortcut_command.Components) => {
  let uploadItemTypes = [];
  const { input_type, upload_options } = component;
  if (input_type === shortcut_command.InputType.MixUpload) {
    uploadItemTypes = upload_options ?? [];
  } else {
    uploadItemTypes = input_type ? [input_type] : [];
  }
  return getAcceptByUploadItemTypes(uploadItemTypes);
};

export const getUploadElementDSL: GetFormItemTemplate = component => ({
  id: component.name ?? shortid(),
  name: 'FlowpdCiciComponentsUpload', // TODO 组件名最好也能事先就约定好
  type: '@flowpd/cici-components/Upload',
  props: {
    name: component.name,
    description: component.description,
    maxSize:
      component.input_type === shortcut_command.InputType.UploadImage
        ? IMAGE_MAX_SIZE
        : FILE_MAX_SIZE,
    inputType: component.input_type,
    accept: getAcceptByComponent(component),
    rules: [
      {
        required: true,
      },
    ],
    noErrorMessage: true,
    // @FIXME DSL 解析逻辑实际支持传入任意值作为 props，但是类型定义里没有兼容这种语法
  } as unknown as DSLElement['props'],
});

// 配置 & 预览模式占位符
export const getFormItemPlaceholderDSL = () => ({
  id: shortid(),
  name: 'FlowpdCiciComponentsFormItemPlaceholder',
  type: '@flowpd/cici-components/Placeholder',
});

export const getLayoutDSL = (items: DSLElement[]): DSLElement => ({
  id: shortid(),
  name: 'FlowpdCiciComponentsColumnLayout',
  type: '@flowpd/cici-components/ColumnLayout',
  props: {
    // 如出现奇数个，最后一行占满
    Columns: items.map(item => ({
      children: [item.id],
      config: { vertical: 'top', weight: 1, width: 'weighted' },
      type: 'slot',
    })),
    action: 'enableUrl',
    backgroundColor: 'transparent',
    enableClickEvent: false,
    // @FIXME card-buidler Layout 现有的数据结构，但是实际上类型非法
  } as unknown as DSLElement['props'],
});
export const getFormItemDSLMap: Record<
  shortcut_command.InputType,
  GetFormItemTemplate
> = {
  [shortcut_command.InputType.TextInput]: getInputElementDSL,
  [shortcut_command.InputType.Select]: getSelectElementDSL,
  [shortcut_command.InputType.UploadImage]: getUploadElementDSL,
  [shortcut_command.InputType.UploadDoc]: getUploadElementDSL,
  [shortcut_command.InputType.UploadTable]: getUploadElementDSL,
  [shortcut_command.InputType.UploadAudio]: getUploadElementDSL,
  [shortcut_command.InputType.MixUpload]: getUploadElementDSL,
  [shortcut_command.InputType.PPT]: getUploadElementDSL,
  [shortcut_command.InputType.ARCHIVE]: getUploadElementDSL,
  [shortcut_command.InputType.CODE]: getUploadElementDSL,
  [shortcut_command.InputType.TXT]: getUploadElementDSL,
  [shortcut_command.InputType.VIDEO]: getUploadElementDSL,
};
