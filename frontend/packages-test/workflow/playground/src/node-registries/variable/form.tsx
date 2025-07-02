import { I18n } from '@coze-arch/i18n';

import { NodeConfigForm } from '@/node-registries/common/components';
import { useWatch } from '@/form';

import {
  InputsParametersField,
  OutputsField,
  RadioSetterField,
} from '../common/fields';
import { ModeValue } from './constants';

const Render = () => {
  const mode = useWatch('mode');
  const isSetMode = mode === ModeValue.Set;

  return (
    <NodeConfigForm nodeDisabled readonlyAllowDeleteOperation>
      <RadioSetterField
        name="mode"
        defaultValue={ModeValue.Set}
        options={{
          key: 'mode',
          mode: 'button',
          options: [
            {
              value: ModeValue.Set,
              label: I18n.t(
                'workflow_detail_variable_set_title',
                {},
                '设置变量值',
              ),
            },
            {
              value: ModeValue.Get,
              label: I18n.t(
                'workflow_detail_variable_get_title',
                {},
                '获取变量值',
              ),
            },
          ],
        }}
        customReadonly
      />
      <InputsParametersField
        name="inputParameters"
        tooltip={I18n.t(
          'workflow_detail_variable_subtitle',
          {},
          '用于在智能体中读取和写入变量，变量名必须与智能体中的变量名匹配。',
        )}
        nameProps={{ isPureText: !isSetMode, readonly: true }}
        customReadonly
      />
      <OutputsField
        title={I18n.t('workflow_detail_node_output')}
        tooltip={I18n.t('workflow_detail_variable_set_output_tooltip')}
        id="variable-node-outputs"
        name="outputs"
        topLevelReadonly={true}
        customReadonly={isSetMode}
      />
    </NodeConfigForm>
  );
};

export default Render;
