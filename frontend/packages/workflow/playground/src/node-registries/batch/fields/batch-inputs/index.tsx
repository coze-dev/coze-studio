/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { type FC } from 'react';

import { type InputValueVO, ViewVariableType } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { InputsField } from '@/node-registries/common/fields';

import { BatchPath } from '../../constants';

interface BatchInputsFieldProps {
  name?: string;
}

export const BatchInputsField: FC<BatchInputsFieldProps> = ({ name }) => (
  <InputsField
    name={name ?? BatchPath.Inputs}
    title={I18n.t('workflow_batch_inputs')}
    tooltip={I18n.t('workflow_batch_inputs_tooltips')}
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
