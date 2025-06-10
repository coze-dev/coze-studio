import { InputsField } from '@/node-registries/common/fields';
import { I18n } from '@coze-arch/i18n';
import { type FC } from 'react';
import { LoopPath, LoopVariablePrefix } from '../../constants';

interface LoopVariableFieldProps {
  name?: string;
}

export const LoopVariablesField: FC<LoopVariableFieldProps> = ({ name }) => (
  <InputsField
    name={name ?? LoopPath.LoopVariables}
    title={I18n.t('workflow_loop_loop_variables')}
    tooltip={I18n.t('workflow_loop_loop_variables_tips')}
    defaultValue={[]}
    showEmptyText={false}
    nameProps={{ prefix: LoopVariablePrefix }}
  />
);
