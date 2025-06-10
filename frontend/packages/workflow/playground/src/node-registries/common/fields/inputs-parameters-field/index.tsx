import { type ViewVariableType, type InputValueVO } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { type FieldProps } from '@/form';

import { type NodeInputNameProps } from './node-input-name/type';
import { InputsTreeField } from './inputs-tree-field';
import { InputsField } from './inputs-field';

interface InputsSectionProps extends FieldProps<InputValueVO[]> {
  title?: string;
  tooltip?: React.ReactNode;
  isTree?: boolean;
  paramsTitle?: string;
  expressionTitle?: string;
  disabledTypes?: ViewVariableType[];
  onAppend?: () => InputValueVO;
  inputPlaceholder?: string;
  literalDisabled?: boolean;
  nameProps?: Partial<NodeInputNameProps>;
  customReadonly?: boolean;
}

export const InputsParametersField = ({
  name = 'inputs.inputParameters',
  title = I18n.t('workflow_detail_node_parameter_input'),
  tooltip = I18n.t('workflow_240218_07'),
  paramsTitle,
  expressionTitle,
  disabledTypes,
  defaultValue,
  onAppend,
  inputPlaceholder,
  literalDisabled,
  isTree,
  nameProps,
  customReadonly,
}: InputsSectionProps) =>
  isTree ? (
    <InputsTreeField
      name={name}
      defaultValue={defaultValue}
      title={title}
      tooltip={tooltip}
      customReadonly={customReadonly}
    />
  ) : (
    <InputsField
      name={name}
      defaultValue={defaultValue}
      title={title}
      tooltip={tooltip}
      paramsTitle={paramsTitle}
      expressionTitle={expressionTitle}
      disabledTypes={disabledTypes}
      onAppend={onAppend}
      inputPlaceholder={inputPlaceholder}
      literalDisabled={literalDisabled}
      nameProps={nameProps}
      customReadonly={customReadonly}
    />
  );
