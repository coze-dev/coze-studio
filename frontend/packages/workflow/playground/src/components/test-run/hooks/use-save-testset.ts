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

import { useCallback, useState } from 'react';

import dayjs from 'dayjs';
import { useService } from '@flowgram-adapter/free-layout-editor';
import { FormItemSchemaType } from '@coze-workflow/test-run';
import { ViewVariableType } from '@coze-workflow/nodes';
import { logger } from '@coze-arch/logger';
import {
  type flow_devops_debugger_coze,
  type CaseDataDetail,
} from '@coze-arch/idl/debugger_api';
import { I18n } from '@coze-arch/i18n';
import { Toast } from '@coze-arch/bot-semi';
import { ComponentType } from '@coze-arch/bot-api/debugger_api';
import { debuggerApi } from '@coze-arch/bot-api';

import { useGetStartNode } from '../hooks/use-get-start-node';
import { FieldName, TESTSET_BOT_NAME, TESTSET_CHAT_NAME } from '../constants';
import { WorkflowRunService } from '../../../services';
import { useTestsetBizCtx } from './use-testset-biz-ctx';
interface SaveOptions {
  name: string;
  description: string;
  inputValue?: Record<string, string>;
  botId?: string;
  chatId?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema?: any;
}

const CASE_NAME_DUPLICATE = 600303204;

const variableType2TestsetType = (type: ViewVariableType) => {
  if (ViewVariableType.isArrayType(type)) {
    return FormItemSchemaType.LIST;
  }
  switch (type) {
    case ViewVariableType.String:
      return FormItemSchemaType.STRING;
    case ViewVariableType.Boolean:
      return FormItemSchemaType.BOOLEAN;
    case ViewVariableType.Integer:
      return FormItemSchemaType.INTEGER;
    case ViewVariableType.Number:
      return FormItemSchemaType.NUMBER;
    default:
      return FormItemSchemaType.OBJECT;
  }
};

const genDefaultCaseName = () =>
  I18n.t('workflow_testset_creation_time', {
    xxx: dayjs().format('YYYY_MM_DD HH_mm_ss'),
  });

const checkName = async (
  data: flow_devops_debugger_coze.CheckCaseDuplicateReq,
) => {
  let count = 0;
  let caseName = data?.caseName || genDefaultCaseName();

  const check = async () => {
    const res = await debuggerApi.CheckCaseDuplicate({
      ...data,
      caseName,
    });

    if (res.failCode === CASE_NAME_DUPLICATE && count < 1) {
      count++;
      caseName = `${caseName}_1`;

      return await check();
    } else {
      return res;
    }
  };

  try {
    const res = await check();
    return {
      ...res,
      caseName,
    };
  } catch (err) {
    logger.error(err);
    return {
      isPass: false,
      caseName,
    };
  }
};

export const useSaveTestset = () => {
  const [currentSavedCase, setCurrentSavedCase] = useState<
    CaseDataDetail | undefined
  >(undefined);
  const runService = useService<WorkflowRunService>(WorkflowRunService);
  const bizCtx = useTestsetBizCtx();
  const { getNode } = useGetStartNode();
  const isHitOptFg = true;

  const trySave = useCallback(
    async (options: SaveOptions) => {
      const {
        name,
        description,
        inputValue = {},
        botId,
        chatId,
        schema,
      } = options;
      const startNode = getNode();
      const formSchema = schema || runService.testFormState.formSchema;
      if (!formSchema) {
        return;
      }
      const inputFields = (
        formSchema.fields
          .find(i => i.name === FieldName.Node)
          ?.children?.find(i => i.name === FieldName.Input)?.children || []
      ).map(i => ({
        name: i.name,
        required: i.required,
        type: variableType2TestsetType(i.originType),
        value: inputValue[i.name],
      }));
      const input = {
        component_id: startNode?.id,
        component_type: ComponentType.CozeStartNode,
        inputs: inputFields,
      };
      const inputs = [input];
      if (botId) {
        inputs.push({
          component_id: `${ComponentType.CozeVariableBot}`,
          component_type: ComponentType.CozeVariableBot,
          inputs: [
            ...(botId
              ? [
                  {
                    name: TESTSET_BOT_NAME,
                    required: true,
                    type: FormItemSchemaType.BOT,
                    value: botId,
                  },
                ]
              : []),
          ],
        });
      }
      if (chatId) {
        inputs.push({
          component_id: `${ComponentType.CozeVariableChat}`,
          component_type: ComponentType.CozeVariableChat,
          inputs: [
            ...(chatId
              ? [
                  {
                    name: TESTSET_CHAT_NAME,
                    required: true,
                    type: FormItemSchemaType.CHAT,
                    value: chatId,
                  },
                ]
              : []),
          ],
        });
      }

      try {
        const { caseName, isPass, failReason, failCode } = await checkName({
          bizCtx,
          bizComponentSubject: {
            componentID: startNode?.id,
            componentType: ComponentType.CozeStartNode,
            parentComponentID: runService.globalState.config.workflowId,
            parentComponentType: ComponentType.CozeWorkflow,
          },
          caseName: name,
        });

        // FG controls to avoid backend errors in abnormal cases, or checkName logic errors that cause the test run to continue and fail to execute
        if (isHitOptFg && !isPass) {
          if (failCode === CASE_NAME_DUPLICATE) {
            Toast.error({
              content: I18n.t('workflow_testset_name_duplicated'),
              duration: 2,
            });
          } else {
            Toast.error({
              content: failReason,
              duration: 2,
            });
          }

          return {
            checkError: true,
          };
        }

        debuggerApi
          .SaveCaseData({
            bizCtx,
            bizComponentSubject: {
              componentID: startNode?.id,
              componentType: ComponentType.CozeStartNode,
              parentComponentID: runService.globalState.config.workflowId,
              parentComponentType: ComponentType.CozeWorkflow,
            },
            caseBase: {
              name: caseName,
              description,
              input: JSON.stringify(inputs),
            },
          })
          .then(res => {
            setCurrentSavedCase(res.caseDetail);
          });
      } catch (err) {
        logger.warning(err);
      }
    },
    [isHitOptFg],
  );

  return { trySave, currentSavedCase };
};
