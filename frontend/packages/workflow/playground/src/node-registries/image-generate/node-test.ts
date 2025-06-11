import { I18n, type I18nKeysNoOptionsType } from '@coze-arch/i18n';
import { FlowNodeFormData } from '@flowgram-adapter/free-layout-editor';

import { generateParametersToProperties } from '@/test-run-kit';
import { type NodeTestMeta } from '@/test-run-kit';

export const test: NodeTestMeta = {
  generateFormInputProperties(node) {
    const formData = node
      .getData(FlowNodeFormData)
      .formModel.getFormItemValueByPath('/');
    const inputParameters =
      formData?.inputParameters || formData?.inputs.inputParameters || [];
    const references = (
      formData?.references ||
      formData?.inputs?.references ||
      []
    )
      .filter(item => item.preprocessor)
      .map(item => ({
        name: `__image_references_${item.preprocessor}`,
        title: I18n.t(
          `Imageflow_reference${item.preprocessor}` as I18nKeysNoOptionsType,
        ),
        input: item.url,
      }));

    return {
      ...generateParametersToProperties(references, { node }),
      ...generateParametersToProperties(inputParameters, { node }),
    };
  },
};
