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

/* eslint-disable @coze-arch/no-empty-catch */
/* eslint-disable @typescript-eslint/no-explicit-any */
import dayjs from 'dayjs';
import {
  type IFormSchema,
  TestFormFieldName,
} from '@coze-workflow/test-run-next';
import { FormItemSchemaType } from '@coze-workflow/test-run';
import { ViewVariableType } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { ComponentType } from '@coze-arch/bot-api/debugger_api';
import { debuggerApi } from '@coze-arch/bot-api';
import { Toast } from '@coze-arch/coze-design';

import { type WorkflowNodeEntity } from '@/test-run-kit';

import { TESTSET_BOT_NAME } from '../../constants';

interface TrySaveTestsetOptions {
  schema: IFormSchema;
  node: WorkflowNodeEntity;
  workflowId: string;
  bizCtx: any;
  values: any;
  bot: any;
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

const checkName = async (data: any) => {
  let count = 0;
  let caseName = genDefaultCaseName();

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
    return {
      isPass: false,
      caseName,
    };
  }
};

export const trySaveTestset = async (options: TrySaveTestsetOptions) => {
  const { schema, node, workflowId, bizCtx, values, bot } = options;
  const inputProperties =
    schema.properties?.[TestFormFieldName.Node]?.properties?.[
      TestFormFieldName.Input
    ]?.properties;
  if (!inputProperties) {
    return;
  }
  const inputFields = Object.entries(inputProperties || {}).map(
    ([key, value]) => ({
      name: key,
      required: value.required,
      value: values[key],
      type: variableType2TestsetType(value['x-origin-type'] as any),
    }),
  );
  const input = {
    component_id: node?.id,
    component_type: ComponentType.CozeStartNode,
    inputs: inputFields,
  };
  const inputs = [input];
  if (bot) {
    inputs.push({
      component_id: `${ComponentType.CozeVariableBot}`,
      component_type: ComponentType.CozeVariableBot,
      inputs: [
        {
          name: TESTSET_BOT_NAME,
          required: true,
          type: FormItemSchemaType.BOT,
          value: bot,
        },
      ],
    });
  }

  try {
    const { caseName, isPass, failReason, failCode } = await checkName({
      bizCtx,
      bizComponentSubject: {
        componentID: node?.id,
        componentType: ComponentType.CozeStartNode,
        parentComponentID: workflowId,
        parentComponentType: ComponentType.CozeWorkflow,
      },
    });

    if (!isPass) {
      Toast.error({
        content:
          failCode === CASE_NAME_DUPLICATE
            ? I18n.t('workflow_testset_name_duplicated')
            : failReason,
        duration: 2,
      });

      return {
        checkError: true,
      };
    }

    debuggerApi.SaveCaseData({
      bizCtx,
      bizComponentSubject: {
        componentID: node?.id,
        componentType: ComponentType.CozeStartNode,
        parentComponentID: workflowId,
        parentComponentType: ComponentType.CozeWorkflow,
      },
      caseBase: {
        name: caseName,
        input: JSON.stringify(inputs),
      },
    });
  } catch {
    // No need to deal with
  }
};
