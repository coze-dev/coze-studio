import { useCurrentEntity } from '@flowgram-adapter/free-layout-editor';
import { type RefExpression, useNodeTestId } from '@coze-workflow/base';

import { MutableVariableAssign } from '@/form-extensions/components/mutable-variable-assign';
import { useField, withField } from '@/form';

import type { SetVariableItem } from '../types';

interface MutableVariableAssignFieldProps {
  right: RefExpression;
  inputParameters: SetVariableItem[];
  index: number;
}

export const MutableVariableAssignField =
  withField<MutableVariableAssignFieldProps>(
    ({ right, inputParameters, index }) => {
      const node = useCurrentEntity();
      const { name, value, onChange, readonly } = useField<RefExpression>();
      const { getNodeSetterId } = useNodeTestId();
      const testId = getNodeSetterId(name);

      return (
        <MutableVariableAssign
          value={value}
          onChange={onChange}
          readonly={readonly}
          right={right}
          inputParameters={inputParameters}
          index={index}
          node={node}
          testId={testId}
        />
      );
    },
  );
