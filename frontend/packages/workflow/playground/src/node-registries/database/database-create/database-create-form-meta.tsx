import { ValidateTrigger } from '@flowgram-adapter/free-layout-editor';
import { type WorkflowNodeRegistry } from '@coze-workflow/nodes';

import { DatabaseNodeService } from '@/services/database-node-service';
import { provideNodeOutputVariablesEffect } from '@/nodes-v2/materials/provide-node-output-variables';
import { nodeMetaValidate } from '@/nodes-v2/materials/node-meta-validate';
import {
  createDatabaseValidator,
  createSelectAndSetFieldsValidator,
} from '@/node-registries/database/common/validators';
import { getOutputsDefaultValue } from '@/node-registries/database/common/utils';
import { createSelectAndSetFieldsFieldName } from '@/constants/database-field-names';

import { DatabaseCreateForm } from './database-create-form';

export const DatabaseCreateFormMeta: WorkflowNodeRegistry['formMeta'] = {
  render: () => <DatabaseCreateForm />,
  validateTrigger: ValidateTrigger.onChange,
  validate: {
    nodeMeta: nodeMetaValidate,
    ...createDatabaseValidator(),
    ...createSelectAndSetFieldsValidator(),
  },
  defaultValues: {
    inputs: {
      databaseInfoList: [],
    },
    outputs: getOutputsDefaultValue(),
  },
  formatOnInit: (value, context) => {
    const databaseNodeService =
      context.node.getService<DatabaseNodeService>(DatabaseNodeService);

    value = databaseNodeService.convertSettingFieldDTOToField(
      createSelectAndSetFieldsFieldName,
      value,
    );

    return value;
  },

  formatOnSubmit: (value, context) => {
    const databaseNodeService =
      context.node.getService<DatabaseNodeService>(DatabaseNodeService);

    value = databaseNodeService.convertSettingFieldToDTO(
      createSelectAndSetFieldsFieldName,
      value,
      context.node,
    );

    return value;
  },
  effect: {
    outputs: provideNodeOutputVariablesEffect,
  },
};
