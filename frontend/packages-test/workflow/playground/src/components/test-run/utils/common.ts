import { ViewVariableType } from '@coze-workflow/base';

export const genFileTypeByViewVarType = type => {
  if ([ViewVariableType.Voice].includes(type)) {
    return 'voice';
  }

  if ([ViewVariableType.Image, ViewVariableType.ArrayImage].includes(type)) {
    return 'image';
  }

  return 'object';
};
