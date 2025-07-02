import { get } from 'lodash-es';
import { I18n } from '@coze-arch/i18n';

import { nameValidationRule } from '@/nodes-v2/components/helpers';

import { isVisionEqual, isVisionInput } from '../vision';

export const llmInputNameValidator = ({ value, formValues, name }) => {
  const validatorRule = nameValidationRule;

  /** 命名校验 */
  if (!validatorRule.test(value)) {
    return I18n.t('workflow_detail_node_error_format');
  }

  const inputValues =
    get(formValues, '$$input_decorator$$.inputParameters') || [];
  const paths = name.split('.');
  paths.pop();
  const inputValue = get(formValues, paths);

  if (!inputValue) {
    return;
  }

  const sameVisionInputs = inputValues.filter(
    item => item.name === value && isVisionEqual(item, inputValue),
  );

  // 都是输入或者视觉理解的场景直接返回重名
  if (sameVisionInputs.length > 1) {
    return I18n.t('workflow_detail_node_input_duplicated');
  }

  // 输入和视觉理解参数重名的场景，返回不能和视觉理解参数重名
  // 视觉理解参数和输入重名，返回不能和输入重名
  const differentVisionInputs = inputValues.filter(
    item => item.name === value && !isVisionEqual(item, inputValue),
  );
  if (differentVisionInputs.length > 0) {
    if (isVisionInput(inputValue)) {
      return I18n.t('workflow_250317_01', undefined, '不能和输入重名');
    } else {
      return I18n.t('workflow_250317_02', undefined, '不能和视觉理解输入重名');
    }
  }
};
