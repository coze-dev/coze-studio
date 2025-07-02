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
        // 编辑模式：比对本地和远程schema并尝试赋值
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
        // 创建模式：赋默认值
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
