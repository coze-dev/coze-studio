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

import { type FormApi } from '@coze-arch/bot-semi/Form';
import {
  InputType,
  type shortcut_command,
  type ToolInfo,
} from '@coze-arch/bot-api/playground_api';

import { shortid } from '../../../utils/uuid';
import { type UploadItemType } from '../../../utils/file-const';
import { type ComponentsWithId, type ComponentTypeItem } from './types';

const MAX_COMPONENTS = 10;

export const attachIdToComponents = (
  components: shortcut_command.Components[],
): ComponentsWithId[] =>
  components.map(item => ({
    ...item,
    id: shortid(),
  }));

export const formatSubmitValues = (
  values: ComponentsWithId[],
): shortcut_command.Components[] =>
  values.map(({ id, options, ...value }) => ({
    ...value,
    options: value.input_type === InputType.Select ? options : [],
  }));

export const checkDuplicateName = (
  values: ComponentsWithId[],
  formApi: FormApi,
) => {
  const fieldMap: Record<string, number[]> = {};
  values.forEach((item, index) => {
    if (item.name) {
      if (fieldMap[item.name]) {
        fieldMap[item.name]?.push(index);
      } else {
        fieldMap[item.name] = [index];
      }
    }
  });
  setTimeout(() => {
    // Avoid being overwritten by the field's own check state immediately after modification
    Object.entries(fieldMap).forEach(([name, indexArray]) => {
      const isDuplicated = indexArray.length > 1;
      indexArray.forEach(index => {
        formApi.setError(`values.${index}.name`, !isDuplicated);
      });
    });
  });
  return Object.entries(fieldMap).some(
    ([name, indexArr]) => indexArr.length > 1,
  );
};

export interface SubmitComponentTypeFields {
  input_type?: InputType;
  options?: string[];
  upload_options?: UploadItemType[];
}

export const getComponentTypeSelectFormInitValues = (): ComponentTypeItem => ({
  type: 'text',
});

// Define a mapping object that maps the ComponentTypeItem type to the corresponding input_type and other fields
const componentTypeHandlers = {
  text: () => ({ input_type: InputType.TextInput }),
  select: (value: ComponentTypeItem) => {
    const { type } = value;
    if (type !== 'select') {
      return;
    }
    return {
      input_type: InputType.Select,
      options: value.options,
    };
  },
  upload: (value: ComponentTypeItem) => {
    if (value.type !== 'upload') {
      return;
    }
    const { uploadTypes } = value;

    if (uploadTypes.length > 1) {
      return {
        input_type: InputType.MixUpload,
        upload_options: uploadTypes,
      };
    }
    return {
      input_type: uploadTypes.at(0) as InputType,
      upload_options: undefined,
    };
  },
};

export const getSubmitFieldFromComponentTypeForm = (
  values: ComponentTypeItem,
): SubmitComponentTypeFields => {
  const { type } = values;

  const handler = componentTypeHandlers[type];

  const result = handler && handler(values);

  if (result) {
    return result;
  }

  // If no handler is found, the default value is returned
  return { input_type: InputType.TextInput };
};

// Is it the upload type?
export const isUploadType = (
  type: InputType,
): type is
  | InputType.UploadImage
  | InputType.UploadDoc
  | InputType.UploadTable
  | InputType.UploadAudio
  | InputType.CODE
  | InputType.ARCHIVE
  | InputType.PPT
  | InputType.VIDEO
  | InputType.TXT
  | InputType.MixUpload =>
  [
    InputType.UploadImage,
    InputType.UploadDoc,
    InputType.UploadTable,
    InputType.UploadAudio,
    InputType.CODE,
    InputType.ARCHIVE,
    InputType.PPT,
    InputType.VIDEO,
    InputType.TXT,
    InputType.MixUpload,
  ].includes(type);

// Map input_type to the corresponding handler
const inputTypeHandlers = {
  [InputType.TextInput]: () => ({ type: 'text' }),
  [InputType.Select]: (options: string[] = []) => ({
    type: 'select' as const,
    options,
  }),
  upload: (uploadTypes: UploadItemType[] = []) => ({
    type: 'upload' as const,
    uploadTypes,
  }),
};

export const getComponentTypeFormBySubmitField = (
  values: SubmitComponentTypeFields,
): ComponentTypeItem => {
  const { input_type, options, upload_options } = values;

  if (!input_type) {
    return getComponentTypeSelectFormInitValues();
  }

  if (isUploadType(input_type)) {
    const handler = inputTypeHandlers.upload;
    return handler(upload_options);
  }

  const handler = inputTypeHandlers[input_type];

  if (handler) {
    return handler(options);
  }

  return getComponentTypeSelectFormInitValues();
};

/**
 * 1. Modify the hide of the corresponding component in the components list: true
 */
export const modifyComponentWhenSwitchChange = ({
  components,
  record,
  checked,
}: {
  components: ComponentsWithId[];
  record: ComponentsWithId;
  checked: boolean;
}) =>
  components.map(item => {
    if (item.id === record.id) {
      return {
        ...item,
        hide: !checked,
      };
    }
    return item;
  });

// Components switching disabled
export const isSwitchDisabled = ({
  components,
  record,
  toolInfo,
}: {
  components: ComponentsWithId[];
  record: ComponentsWithId;
  toolInfo: ToolInfo;
}) => {
  const { default_value } = record ?? {};
  const isWithDefaultValue = !!default_value?.value;
  const isRequired = (() => {
    if (!toolInfo?.tool_name) {
      return true;
    }

    /**
     * Use tools & required parameters
     */
    return !!toolInfo?.tool_params_list?.find(t => t.name === record.parameter)
      ?.required;
  })();

  // Components exceed the maximum number and are not allowed to be opened
  const isMaxCount =
    record.hide && components.filter(com => !com.hide).length >= MAX_COMPONENTS;

  /** Required and no default value Closure is not allowed */
  const isFinalRequired = isRequired && !isWithDefaultValue;

  return isFinalRequired || isMaxCount;
};
