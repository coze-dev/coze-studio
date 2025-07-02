import { I18n } from '@coze-arch/i18n';
import {
  type ValidatorProps,
  type FormItemMaterialContext,
  type SetterExtension,
} from '@flowgram-adapter/free-layout-editor';

import { nameValidationRule } from '../helper';
import { defaultGetNames } from './utils';
import { NodeInputName } from './node-input-name';

type NodeInputNameValidatorProps = ValidatorProps<
  string,
  {
    validatorConfig?: {
      rule?: RegExp;
      errorMessage?: string;
    };
    getNames?: (context: FormItemMaterialContext) => string[];
    invalidValues?: Record<string, string>;
  }
>;

export const nodeInputName: SetterExtension = {
  key: 'NodeInputName',
  component: NodeInputName,
  validator: (props: NodeInputNameValidatorProps) => {
    const { value, options, context } = props;
    const {
      validatorConfig,
      getNames = defaultGetNames,
      invalidValues = {},
    } = options;
    const validatorRule = validatorConfig?.rule ?? nameValidationRule;
    const validatorErrorMessage =
      validatorConfig?.errorMessage ??
      I18n.t('workflow_detail_node_error_format');

    /** 命名校验 */
    if (!validatorRule.test(value)) {
      return validatorErrorMessage;
    }

    /** 非法值校验 */
    if (invalidValues[value]) {
      return invalidValues[value];
    }

    const names: string[] = getNames(context);

    const foundSames = names.filter((name: string) => name === value);

    return foundSames.length > 1
      ? I18n.t('workflow_detail_node_input_duplicated')
      : undefined;
  },
};
