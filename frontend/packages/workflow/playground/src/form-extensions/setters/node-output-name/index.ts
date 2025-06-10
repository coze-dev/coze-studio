import { I18n } from '@coze-arch/i18n';
import { type SetterExtension } from '@flowgram-adapter/free-layout-editor';

import { nameValidationRule } from '../helper';
import { NodeOutputName } from './node-output-name';
interface PartialOutputParameter {
  name: string | undefined;
}

export const nodeOutputName: SetterExtension = {
  key: 'NodeOutputName',
  component: NodeOutputName,
  validator: ({ value, context }) => {
    const { node } = context;

    /** 命名校验 */
    if (!nameValidationRule.test(value)) {
      return I18n.t('workflow_detail_node_error_format');
    }

    const outputsPath = node.getNodeMeta()?.outputsPath;

    if (!outputsPath) {
      return;
    }

    const nodeInputParameters =
      context.getFormItemValueByPath<PartialOutputParameter[]>(outputsPath) ||
      [];

    const foundSame = nodeInputParameters.filter(
      (input: PartialOutputParameter) => input.name === value,
    );

    return foundSame?.length > 1
      ? I18n.t('workflow_detail_node_error_name_duplicated', {
          name: value,
        })
      : undefined;
  },
};
