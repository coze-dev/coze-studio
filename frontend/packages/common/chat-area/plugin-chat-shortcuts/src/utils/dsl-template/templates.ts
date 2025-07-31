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

// @Fixme DSL type definition needs to be updated
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
      name: 'FlowpdCiciComponentsForm', // TODO component name & type can preferably be agreed in advance
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
      children: ['submitButton'], // Generated from variables + layout
    },
    // Generate form elements from getFormElementsFromcomponent
    // ...inputElements,
    // Generate form element layout with getElementsLayout
    // ...inputLayoutElements,
    submitButton: {
      id: 'submitButton',
      name: 'FlowpdCiciComponentsButton', // TODO component name & type can preferably be agreed in advance
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
      defaultValue: {}, // No default is required
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
  name: 'FlowpdCiciComponentsInput', // The TODO component name should preferably be agreed in advance
  type: '@flowpd/cici-components/Input',
  props: {
    name: component.name,
    description: component.description,
    defaultValue: component.default_value,
    rules: [],
    noErrorMessage: true,
    // The @FIXME DSL parsing logic actually supports passing arbitrary values as props, but there is no compatible syntax in the type definition
  } as unknown as DSLElement['props'],
});

export const getSelectElementDSL: GetFormItemTemplate = component => ({
  id: component.name ?? shortid(),
  name: 'FlowpdCiciComponentsSelect', // The TODO component name should preferably be agreed in advance
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
    // The @FIXME DSL parsing logic actually supports passing arbitrary values as props, but there is no compatible syntax in the type definition
  } as unknown as DSLElement['props'],
});

// Unit kb
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
  name: 'FlowpdCiciComponentsUpload', // The TODO component name should preferably be agreed in advance
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
    // The @FIXME DSL parsing logic actually supports passing arbitrary values as props, but there is no compatible syntax in the type definition
  } as unknown as DSLElement['props'],
});

// Configuration & Preview Mode Placeholders
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
    // If an odd number appears, the last line is full
    Columns: items.map(item => ({
      children: [item.id],
      config: { vertical: 'top', weight: 1, width: 'weighted' },
      type: 'slot',
    })),
    action: 'enableUrl',
    backgroundColor: 'transparent',
    enableClickEvent: false,
    // @FIXME card-buidler Layout an existing data structure, but the type is actually illegal
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
