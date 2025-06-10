// import { get } from 'lodash-es';
import {
  type Effect,
  FlowNodeFormData,
  type FormModelV2,
} from '@flowgram-adapter/free-layout-editor';
import { DEFAULT_DELIMITER_OPTIONS } from '@coze-workflow/nodes';

import { getDefaultOutput, isSplitMethod } from '../utils';

export const handleMethodChangeEffect: Effect = props => {
  const { value, context } = props;
  const { node } = context;

  const formModel = node.getData(FlowNodeFormData).getFormModel<FormModelV2>();

  if (!formModel) {
    return;
  }

  formModel.setValueIn('outputs', getDefaultOutput(value));

  if (isSplitMethod(value)) {
    formModel.setValueIn('delimiter', {
      value: [],
      options: DEFAULT_DELIMITER_OPTIONS,
    });
  }

  formModel.setValueIn('inputParameters', [
    { name: isSplitMethod(value) ? 'String' : 'String1' },
  ]);
};
