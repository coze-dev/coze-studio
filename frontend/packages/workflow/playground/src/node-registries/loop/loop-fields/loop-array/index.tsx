/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { type FC } from 'react';

import { type InputValueVO, ViewVariableType } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { InputsField } from '@/node-registries/common/fields';

import { useLoopType } from '../../hooks';
import { LoopPath, LoopType } from '../../constants';

interface LoopArrayFieldProps {
  name?: string;
}

export const LoopArrayField: FC<LoopArrayFieldProps> = ({ name }) => {
  const loopType = useLoopType();

  if (loopType !== LoopType.Array) {
    return null;
  }

  return (
    <InputsField
      name={name ?? LoopPath.LoopArray}
      title={I18n.t('workflow_loop_loop_times')}
      tooltip={I18n.t('workflow_loop_loop_times_tips')}
      defaultValue={[{ name: 'input' } as InputValueVO]}
      nthCannotDeleted={1}
      inputProps={{
        hideDeleteIcon: true,
        disabledTypes: ViewVariableType.getComplement(
          ViewVariableType.getAllArrayType(),
        ),
      }}
    />
  );
};
