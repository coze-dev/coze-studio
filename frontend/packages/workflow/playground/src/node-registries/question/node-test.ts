import { FlowNodeFormData } from '@flowgram-adapter/free-layout-editor';
import { type IFormSchema } from '@coze-workflow/test-run-next';

import { generateParametersToProperties } from '@/test-run-kit';
import { type NodeTestMeta } from '@/test-run-kit';
import { AnswerType, OptionType } from '@/constants/question-settings';

export const test: NodeTestMeta = {
  generateFormInputProperties(node) {
    const formData = node
      .getData(FlowNodeFormData)
      .formModel.getFormItemValueByPath('/');
    const inputParameters = formData?.inputParameters;

    const inputProperties = generateParametersToProperties(inputParameters, {
      node,
    });
    const answerType = formData?.questionParams?.answer_type;
    const optionType = formData?.questionParams?.option_type;
    let dynamicProperties: IFormSchema['properties'] = {};
    if (answerType === AnswerType.Option && optionType === OptionType.Dynamic) {
      const dynamicOption = formData?.questionParams?.dynamic_option;
      dynamicProperties = generateParametersToProperties(
        [
          {
            name: 'dynamic_option',
            input: dynamicOption,
          },
        ],
        { node },
      );
    }

    return {
      ...inputProperties,
      ...dynamicProperties,
    };
  },
};
