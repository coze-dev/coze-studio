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

import { isNil } from 'lodash-es';
import { useRequest } from 'ahooks';
import { type CaseDataDetail } from '@coze-arch/bot-api/debugger_api';
import { debuggerApi } from '@coze-arch/bot-api';

import { useTestsetManageStore } from '../use-testset-manage-store';
import {
  typeSafeJSONParse,
  traverseTestsetNodeFormSchemas,
  getTestsetFormSubFieldName,
  isTestsetFormSameFieldType,
  assignTestsetFormDefaultValue,
} from '../../../utils';
import { type NodeFormSchema, type FormItemSchema } from '../../../types';

export const useEditFormSchemas = (testset?: CaseDataDetail | null) => {
  const { bizCtx, bizComponentSubject } = useTestsetManageStore(store => ({
    bizCtx: store.bizCtx,
    bizComponentSubject: store.bizComponentSubject,
  }));
  const { data: schemas, loading: schemasLoading } = useRequest(
    async () => {
      const localSchemas = (typeSafeJSONParse(testset?.caseBase?.input) ||
        []) as NodeFormSchema[];
      const res = await debuggerApi.GetSchemaByID({
        bizComponentSubject,
        bizCtx,
      });
      const remoteSchemas = (typeSafeJSONParse(res.schemaJson) ||
        []) as NodeFormSchema[];

      if (localSchemas.length) {
        // Edit schema: compare local and remote schemas and try to assign values
        const localSchemaMap: Record<string, FormItemSchema | undefined> = {};
        traverseTestsetNodeFormSchemas(
          localSchemas,
          (schema, ipt) =>
            (localSchemaMap[getTestsetFormSubFieldName(schema, ipt)] = ipt),
        );

        traverseTestsetNodeFormSchemas(remoteSchemas, (schema, ipt) => {
          const subName = getTestsetFormSubFieldName(schema, ipt);
          const field = localSchemaMap[subName];

          if (
            isTestsetFormSameFieldType(ipt.type, field?.type) &&
            !isNil(field?.value)
          ) {
            ipt.value = field?.value;
          }
        });
      } else {
        // Creation mode: assigns default values
        traverseTestsetNodeFormSchemas(remoteSchemas, (schema, ipt) => {
          assignTestsetFormDefaultValue(ipt);
        });
      }

      return remoteSchemas;
    },
    { refreshDeps: [testset] },
  );

  return {
    schemas,
    schemasLoading,
  };
};
