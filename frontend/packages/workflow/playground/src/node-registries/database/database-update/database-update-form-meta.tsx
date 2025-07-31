/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ValidateTrigger } from '@flowgram-adapter/free-layout-editor';
import { type WorkflowNodeRegistry } from '@coze-workflow/nodes';

import { DatabaseNodeService } from '@/services/database-node-service';
import { provideNodeOutputVariablesEffect } from '@/nodes-v2/materials/provide-node-output-variables';
import { nodeMetaValidate } from '@/nodes-v2/materials/node-meta-validate';
import {
  createConditionValidator,
  createDatabaseValidator,
  createSelectAndSetFieldsValidator,
} from '@/node-registries/database/common/validators';
import { getOutputsDefaultValue } from '@/node-registries/database/common/utils';
import {
  updateSelectAndSetFieldsFieldName,
  updateConditionListFieldName,
  updateConditionLogicFieldName,
} from '@/constants/database-field-names';

import { DatabaseUpdateForm } from './database-update-form';

export const DatabaseUpdateFormMeta: WorkflowNodeRegistry['formMeta'] = {
  render: () => <DatabaseUpdateForm />,
  validateTrigger: ValidateTrigger.onChange,
  validate: {
    nodeMeta: nodeMetaValidate,
    ...createDatabaseValidator(),
    ...createConditionValidator(updateConditionListFieldName),
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
      updateSelectAndSetFieldsFieldName,
      value,
    );

    value = databaseNodeService.convertConditionDTOToCondition(
      updateConditionListFieldName,
      value,
    );

    value = databaseNodeService.convertConditionLogicDTOToConditionLogic(
      updateConditionLogicFieldName,
      value,
    );

    return value;
  },

  formatOnSubmit: (value, context) => {
    const databaseNodeService =
      context.node.getService<DatabaseNodeService>(DatabaseNodeService);

    value = databaseNodeService.convertSettingFieldToDTO(
      updateSelectAndSetFieldsFieldName,
      value,
      context.node,
    );

    value = databaseNodeService.convertConditionToDTO(
      updateConditionListFieldName,
      value,
      context.node,
    );

    value = databaseNodeService.convertConditionLogicToConditionLogicDTO(
      updateConditionLogicFieldName,
      value,
    );

    return value;
  },
  effect: {
    outputs: provideNodeOutputVariablesEffect,
  },
};
