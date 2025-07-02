import { type FC } from 'react';

import {
  Field,
  type FieldRenderProps,
} from '@flowgram-adapter/free-layout-editor';
import { type ValueExpression, ViewVariableType } from '@coze-workflow/base';

import { ValueExpressionInput } from '@/nodes-v2/components/value-expression-input';
import { FormItemFeedback } from '@/nodes-v2/components/form-item-feedback';

import { DEFUALT_VISION_INPUT } from '../constants';

interface VisionProps {
  name: string;
  enabledTypes: ViewVariableType[];
}

/**
 * 输入值字段
 * @returns */
export const VisionValueField: FC<VisionProps> = ({ enabledTypes, name }) => {
  const disabledTypes = ViewVariableType.getComplement([
    ...enabledTypes,
    ViewVariableType.String,
  ]);

  return (
    <Field name={name}>
      {({
        field: childInputField,
        fieldState: inputFieldState,
      }: FieldRenderProps<ValueExpression | undefined>) => (
        <div className="flex-[3] min-w-0">
          <ValueExpressionInput
            {...childInputField}
            isError={!!inputFieldState?.errors?.length}
            disabledTypes={disabledTypes}
            defaultInputType={enabledTypes[0]}
            inputTypes={enabledTypes}
            onChange={v => {
              const expression = v as ValueExpression;
              if (!expression) {
                // 默认值需要带raw meta不然无法区分是不是视觉理解
                childInputField?.onChange(DEFUALT_VISION_INPUT);
                return;
              }
              const newExpression: ValueExpression = {
                ...expression,
                rawMeta: {
                  ...(expression.rawMeta || {}),
                  isVision: true,
                },
              };
              childInputField?.onChange(newExpression);
            }}
          />
          <FormItemFeedback errors={inputFieldState?.errors} />
        </div>
      )}
    </Field>
  );
};
