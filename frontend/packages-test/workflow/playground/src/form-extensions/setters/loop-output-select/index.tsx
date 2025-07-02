import {
  type SetterComponentProps,
  type ValidatorProps,
} from '@flowgram-adapter/free-layout-editor';
import { useNodeTestId, type RefExpression } from '@coze-workflow/base';

import { LoopOutputSelect as LoopOutputSelectComponent } from '@/form-extensions/components/loop-output-select';

import { valueExpressionValidator } from '../../validators';

type LoopOutputSelectSetterProps = SetterComponentProps<RefExpression>;

export function LoopOutputSelectSetter(
  props: LoopOutputSelectSetterProps,
): JSX.Element {
  const { value, onChange, readonly, context } = props;

  const { getNodeSetterId } = useNodeTestId();
  const testId = getNodeSetterId(context?.path);

  return (
    <LoopOutputSelectComponent
      value={value}
      onChange={onChange}
      readonly={readonly}
      testId={testId}
    />
  );
}

export const LoopOutputSelect = {
  key: 'LoopOutputSelect',
  component: LoopOutputSelectSetter,
  validator: ({ value, context }: ValidatorProps) => {
    const { meta, playgroundContext, node } = context;
    const { required } = meta;
    return valueExpressionValidator({
      value,
      playgroundContext,
      node,
      required,
    });
  },
};
