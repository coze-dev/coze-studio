import { I18n } from '@coze-arch/i18n';

import {
  DatabaseSelectField,
  OutputsField,
} from '@/node-registries/database/common/fields';
import { NodeConfigForm } from '@/node-registries/common/components';
import { Section } from '@/form';

import { InputsParametersField } from '../../common/fields';
import { SqlField } from './components/sql-field';

const Render = () => (
  <NodeConfigForm>
    <InputsParametersField
      name="inputParameters"
      tooltip={I18n.t(
        'workflow_240218_07',
        {},
        '需要添加的输入变量，SQL中可直接引用此处添加的变量',
      )}
    />
    <DatabaseSelectField name="databaseInfoList" />
    <Section
      title={I18n.t('workflow_240218_09', {}, 'SQL')}
      tooltip={I18n.t(
        'workflow_240218_10',
        {},
        '要执行的SQL语句,可以直接使用输入参数中的变量,注意rowNum输出返回的行数或者受影响的行数,outputList中的变量名需与SQL中定义的字段名一致。',
      )}
    >
      <SqlField name="sql" />
    </Section>
    <OutputsField name="outputs" />
  </NodeConfigForm>
);

export default Render;
