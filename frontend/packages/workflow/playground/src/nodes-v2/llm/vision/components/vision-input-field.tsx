import { type FC } from 'react';

import {
  type FieldRenderProps,
  type FieldArrayRenderProps,
} from '@flowgram-adapter/free-layout-editor';
import { type InputValueVO, type ViewVariableType } from '@coze-workflow/base';
import { IconCozMinus } from '@coze-arch/coze-design/icons';
import { IconButton } from '@coze-arch/coze-design';

import { isVisionInput } from '../utils/index';
import { VisionValueField } from './vision-value-field';
import { VisionNameField } from './vision-name-field';

interface VisionInputFieldProps {
  inputField: FieldRenderProps<InputValueVO>['field'];
  inputsField: FieldArrayRenderProps<InputValueVO>['field'];
  index: number;
  readonly?: boolean;
  form;
  enabledTypes: ViewVariableType[];
}

/**
 * 输入字段
 */
export const VisionInputField: FC<VisionInputFieldProps> = ({
  readonly,
  inputField,
  inputsField,
  index,
  enabledTypes,
}) => {
  if (!isVisionInput(inputField?.value)) {
    return null;
  }
  return (
    <div className={'flex items-start pb-1 gap-1'}>
      <VisionNameField
        inputField={inputField}
        inputsField={inputsField}
        enabledTypes={enabledTypes}
      />
      <VisionValueField
        name={`${inputField.name}.input`}
        enabledTypes={enabledTypes}
      />
      {readonly ? (
        <></>
      ) : (
        <div className="leading-none">
          <IconButton
            size="small"
            color="secondary"
            icon={<IconCozMinus className="text-sm" />}
            onClick={() => {
              inputsField.delete(index);
            }}
          />
        </div>
      )}
    </div>
  );
};
