import { I18n } from '@coze-arch/i18n';
import { type Validate } from '@flowgram-adapter/free-layout-editor';

import { nameValidationRule } from '../helpers';

export interface CreateNodeInputNameValidateOptions {
  getNames?: ({ value, formValues }) => string[];
  validatorConfig?: {
    rule?: RegExp;
    errorMessage?: string;
  };
  invalidValues?: Record<string, string>;
  skipValidate?: ({ value, formValues }) => boolean;
}

const defaultGetNames = ({ formValues }) =>
  formValues.inputParameters.map(item => item.name);

export const createNodeInputNameValidate =
  (options?: CreateNodeInputNameValidateOptions): Validate =>
  ({ value, formValues }) => {
    const {
      getNames = defaultGetNames,
      validatorConfig,
      invalidValues,
      skipValidate,
    } = options || {};
    if (skipValidate?.({ value, formValues })) {
      return;
    }

    const validatorRule = validatorConfig?.rule ?? nameValidationRule;
    const validatorErrorMessage =
      validatorConfig?.errorMessage ??
      I18n.t('workflow_detail_node_error_format');

    /** 命名校验 */
    if (!validatorRule.test(value)) {
      return validatorErrorMessage;
    }

    /** 非法值校验 */
    if (invalidValues?.[value]) {
      return invalidValues[value];
    }

    const names: string[] = getNames({ value, formValues });

    const foundSames = names.filter((name: string) => name === value);

    return foundSames.length > 1
      ? I18n.t('workflow_detail_node_input_duplicated')
      : undefined;
  };
