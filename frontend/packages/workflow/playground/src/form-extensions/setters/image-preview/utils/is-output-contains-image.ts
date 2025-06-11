import { FlowNodeFormData } from '@flowgram-adapter/free-layout-editor';
import { type FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import { ViewVariableType } from '@coze-workflow/base';

function isContainsImage(output): boolean {
  if (!output) {
    return false;
  }

  const checkValue = (_value): boolean => {
    if (
      [
        ViewVariableType.Image,
        ViewVariableType.ArrayImage,
        ViewVariableType.Svg,
        ViewVariableType.ArraySvg,
      ].includes(_value?.type || '')
    ) {
      return true;
    }

    return _value?.children?.some(checkValue) ?? false;
  };

  return Array.isArray(output) ? output.some(checkValue) : checkValue(output);
}

export function isOutputsContainsImage(node: FlowNodeEntity): boolean {
  const formModel = node?.getData<FlowNodeFormData>(FlowNodeFormData).formModel;
  const outputs = formModel?.getFormItemValueByPath?.('/outputs');

  return isContainsImage(outputs);
}
