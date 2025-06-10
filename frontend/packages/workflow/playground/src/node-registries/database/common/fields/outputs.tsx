import { nanoid } from 'nanoid';
import { ViewVariableType } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { OutputsField as BaseOutputsField } from '@/node-registries/common/fields/outputs';
import { type FieldProps } from '@/form';

export function OutputsField({
  name,
  deps,
}: Pick<FieldProps, 'name' | 'deps'>) {
  return (
    <BaseOutputsField
      title={I18n.t('workflow_detail_node_output')}
      tooltip={I18n.t('workflow_240218_08')}
      id="database-node-outputs"
      name={name}
      deps={deps}
      topLevelReadonly={true}
      disabledTypes={[ViewVariableType.Object]}
      defaultValue={[
        {
          key: nanoid(),
          name: 'outputList',
          type: ViewVariableType.ArrayObject,
        },
        {
          key: nanoid(),
          name: 'rowNum',
          type: ViewVariableType.Integer,
        },
      ]}
    />
  );
}
