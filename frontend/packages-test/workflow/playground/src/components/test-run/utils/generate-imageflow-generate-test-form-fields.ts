import { get } from 'lodash-es';
import { I18n, type I18nKeysNoOptionsType } from '@coze-arch/i18n';

import { generateArrayInputParameters } from './generate-test-form-fields';

/**
 * 生成图像生成单节点试运行表单字段
 */
export function generateImageflowGenerateTestFormFields(formData, context) {
  const references =
    get(formData, 'references') || get(formData, 'inputs.references');

  const originParameters =
    get(formData, 'inputParameters') ||
    get(formData, 'inputs.inputParameters') ||
    [];

  const referencesInputParameters =
    referencesToArrayInputParameters(references) || [];

  const inputParameters = [...originParameters, ...referencesInputParameters];

  const fields = generateArrayInputParameters(inputParameters, context);

  return fields;
}

function referencesToArrayInputParameters(references) {
  return references
    ?.filter(({ preprocessor }) => preprocessor)
    ?.map(({ preprocessor, url }) => ({
      name: `__image_references_${preprocessor}`,
      label: I18n.t(
        `Imageflow_reference${preprocessor}` as I18nKeysNoOptionsType,
      ),
      input: url,
    }));
}
