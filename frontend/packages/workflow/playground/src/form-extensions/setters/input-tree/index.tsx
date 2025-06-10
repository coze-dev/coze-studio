import {
  type SetterComponentProps,
  type SetterExtension,
} from '@flowgram-adapter/free-layout-editor';
import { useNodeTestId } from '@coze-workflow/base';

import { withValidation } from '../../components/validation';
import { InputTree, type InputTreeProps } from '../../components/input-tree';

interface InputTreeOptions {
  id: string;
  disabled?: boolean;
  disabledTooltip?: string;
  readonly?: boolean;
  emptyPlaceholder?: string;
}
type InputTreeSetterProps = SetterComponentProps<
  InputTreeProps['value'],
  InputTreeOptions & Pick<InputTreeProps, 'columnsRatio'>
>;

const InputWithValidation = withValidation<InputTreeSetterProps>(
  ({ value, onChange, options, readonly: workflowReadonly, context }) => {
    const {
      disabled = false,
      readonly = false,
      emptyPlaceholder,
      ...props
    } = options || {};

    const { getNodeSetterId } = useNodeTestId();

    return (
      <InputTree
        {...props}
        testId={getNodeSetterId(context.path)}
        readonly={readonly || workflowReadonly}
        disabled={disabled}
        value={value}
        onChange={onChange}
        emptyPlaceholder={emptyPlaceholder}
      />
    );
  },
);

export const inputTree: SetterExtension = {
  key: 'InputTree',
  component: InputWithValidation,
};
