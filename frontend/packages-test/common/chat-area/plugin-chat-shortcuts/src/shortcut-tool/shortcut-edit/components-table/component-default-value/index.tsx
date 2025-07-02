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
    // 先置灰,后续放开上传默认值
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
