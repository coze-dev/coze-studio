import { type InputValueVO } from '@coze-workflow/base';

import { useReadonly } from '@/nodes-v2/hooks/use-readonly';
import { type ValidationProps } from '@/nodes-v2/components/validation/with-validation';
import { withValidation } from '@/nodes-v2/components/validation';
import {
  InputTree,
  type InputTreeProps,
} from '@/form-extensions/components/input-tree';
import { useField, withField, type FieldProps } from '@/form';

interface InputsTreeFieldProps extends FieldProps<InputValueVO[]> {
  title?: string;
  customReadonly?: boolean;
}

const InputTreeWithValidation = withValidation(
  (props: InputTreeProps & ValidationProps) => <InputTree {...props} />,
);

export const InputsTreeField = withField(
  ({ title, tooltip, customReadonly }: InputsTreeFieldProps) => {
    const { value, onChange, errors } = useField<InputValueVO[]>();
    const formReadonly = useReadonly();
    const readonly = formReadonly || customReadonly;
    return (
      <InputTreeWithValidation
        value={value}
        title={title}
        titleTooltip={tooltip}
        readonly={readonly}
        onChange={onChange}
        errors={errors}
      />
    );
  },
  {
    hasFeedback: false,
  },
);
