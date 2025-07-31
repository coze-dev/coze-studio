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
import { I18n } from '@coze-arch/i18n';

import { DatabaseNodeService } from '@/services';
import { provideNodeOutputVariablesEffect } from '@/nodes-v2/materials/provide-node-output-variables';
import { nodeMetaValidate } from '@/nodes-v2/materials/node-meta-validate';
import {
  createConditionValidator,
  createDatabaseValidator,
} from '@/node-registries/database/common/validators';
import { getOutputsDefaultValue } from '@/node-registries/database/common/utils';
import {
  queryConditionListFieldName,
  queryLimitFieldName,
  queryConditionLogicFieldName,
} from '@/constants/database-field-names';

import { DatabaseQueryForm } from './database-query-form';

export const DatabaseQueryFormMeta: WorkflowNodeRegistry['formMeta'] = {
  render: () => <DatabaseQueryForm />,
  validateTrigger: ValidateTrigger.onChange,
  validate: {
    nodeMeta: nodeMetaValidate,
    [queryLimitFieldName]: ({ value }) => {
      if (value < 1 || value > 1000) {
        return I18n.t('workflow_database_query_limit');
      }
    },
    ...createConditionValidator(queryConditionListFieldName),
    ...createDatabaseValidator(),
  },
  defaultValues: {
    inputs: {
      databaseInfoList: [],
    },
    outputs: getOutputsDefaultValue(),
  },
  effect: {
    outputs: provideNodeOutputVariablesEffect,
  },
  formatOnInit: (value, context) => {
    const databaseNodeService =
      context.node.getService<DatabaseNodeService>(DatabaseNodeService);

    value = databaseNodeService.convertConditionDTOToCondition(
      queryConditionListFieldName,
      value,
    );

    value = databaseNodeService.convertConditionLogicDTOToConditionLogic(
      queryConditionLogicFieldName,
      value,
    );

    return value;
  },
  formatOnSubmit: (value, context) => {
    const databaseNodeService =
      context.node.getService<DatabaseNodeService>(DatabaseNodeService);

    value = databaseNodeService.convertConditionToDTO(
      queryConditionListFieldName,
      value,
      context.node,
    );

    value = databaseNodeService.convertConditionLogicToConditionLogicDTO(
      queryConditionLogicFieldName,
      value,
    );

    return value;
  },
};
