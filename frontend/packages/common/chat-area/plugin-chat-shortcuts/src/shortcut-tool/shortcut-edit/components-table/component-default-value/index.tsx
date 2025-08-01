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

import { I18n } from '@coze-arch/i18n';
import { InputType } from '@coze-arch/bot-api/playground_api';

import {
  type SelectComponentTypeItem,
  type TextComponentTypeItem,
  type UploadComponentTypeItem,
} from '../types';
import { type UploadItemType } from '../../../../utils/file-const';
import { UploadField } from './upload-field';
import { SelectWithInputTypeField } from './select-field';
import { InputWithInputTypeField } from './input-field';

export interface ComponentDefaultChangeValue {
  type: InputType.TextInput | UploadItemType;
  value: string;
}

export interface ComponentDefaultValueProps {
  field: string;
  componentType:
    | TextComponentTypeItem
    | SelectComponentTypeItem
    | UploadComponentTypeItem;
  disabled?: boolean;
}

export const ComponentDefaultValue: FC<ComponentDefaultValueProps> = props => {
  const { componentType, field, disabled = false } = props;
  const { type } = componentType;

  if (type === 'text') {
    return (
      <InputWithInputTypeField
        noLabel
        value={{
          type: InputType.TextInput,
          value: '',
        }}
        field={field}
        noErrorMessage
        placeholder={I18n.t(
          'shortcut_modal_use_tool_parameter_default_value_placeholder',
        )}
        disabled={disabled}
      />
    );
  }
  if (type === 'select') {
    return (
      <SelectWithInputTypeField
        value={{
          type: InputType.TextInput,
          value: '',
        }}
        noLabel
        style={{
          width: '100%',
        }}
        field={field}
        noErrorMessage
        optionList={componentType.options.map(option => ({
          label: option,
          value: option,
        }))}
        disabled={disabled}
      />
    );
  }
  if (type === 'upload') {
    // Grey out first, then release the upload default value.
    return <UploadField />;
    // return (
    //   <UploadDefaultValue
    //     noLabel
    //     field={field}
    //     acceptUploadItemTypes={componentType.uploadTypes}
    //     uploadItemConfig={{
    //       [InputType.UploadImage]: {
    //         maxSize: IMAGE_MAX_SIZE,
    //       },
    //       [InputType.UploadDoc]: {
    //         maxSize: FILE_MAX_SIZE,
    //       },
    //       [InputType.UploadTable]: {
    //         maxSize: FILE_MAX_SIZE,
    //       },
    //       [InputType.UploadAudio]: {
    //         maxSize: FILE_MAX_SIZE,
    //       },
    //     }}
    //     onChange={res => {
    //       const { default_value, default_value_type } = res
    //         ? convertComponentDefaultValueToFormValues(res)
    //         : {
    //             default_value: '',
    //             default_value_type: undefined,
    //           };
    //       return {
    //         value: default_value,
    //         type: default_value_type,
    //       };
    //     }}
    //     uploadFile={({ file, onError, onProgress, onSuccess }) => {
    //       getRegisteredPluginInstance?.({
    //         file,
    //         onProgress,
    //         onError,
    //         onSuccess,
    //       });
    //     }}
    //   />
    // );
  }

  return <></>;
};
