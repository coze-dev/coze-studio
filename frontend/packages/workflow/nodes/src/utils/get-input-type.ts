import { variableUtils } from '@coze-workflow/variable';
import {
  type DTODefine,
  type VariableMetaDTO,
  ViewVariableType,
} from '@coze-workflow/base';

export const getInputTypeBase = (inputType: ViewVariableType) => {
  const viewType = ViewVariableType.getLabel(inputType);

  return {
    inputType,
    viewType,
    disabledTypes: undefined,
  };
};

export const getInputType = (input: DTODefine.InputVariableDTO) => {
  const { type: inputType } = variableUtils.dtoMetaToViewMeta(
    input as VariableMetaDTO,
  );

  return getInputTypeBase(inputType);
};
