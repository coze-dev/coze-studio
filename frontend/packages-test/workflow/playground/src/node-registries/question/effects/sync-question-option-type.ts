import {
  type Effect,
  FlowNodeFormData,
  type FormModelV2,
} from '@flowgram-adapter/free-layout-editor';

import { OptionType } from '@/constants/question-settings';

export const syncQuestionOptionTypeEffect: Effect = props => {
  const { value, context } = props;
  const { node } = context;
  const formModel = node.getData(FlowNodeFormData).getFormModel<FormModelV2>();
  if (value === OptionType.Dynamic) {
    return;
  }
  formModel.setValueIn('questionParams.dynamic_option', null);
};
