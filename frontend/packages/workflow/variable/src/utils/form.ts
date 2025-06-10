import { set } from 'lodash-es';
import {
  type FormModelV2,
  isFormV2,
  type FlowNodeEntity,
} from '@flowgram-adapter/free-layout-editor';
import { FlowNodeFormData } from '@flowgram-adapter/free-layout-editor';

export function setValueIn(
  node: FlowNodeEntity,
  path: string,
  nextValue: unknown,
) {
  const formData = node.getData(FlowNodeFormData);
  // 新表单引擎更新数据
  if (isFormV2(node)) {
    (formData.formModel as FormModelV2).setValueIn(path, nextValue);
    return;
  }

  // 老表单引擎更新数据
  const fullData = formData.formModel.getFormItemValueByPath('/');
  set(fullData, path, nextValue);

  return;
}
