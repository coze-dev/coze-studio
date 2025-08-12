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

/* eslint-disable complexity */

import { isUndefined, omit } from 'lodash-es';
import { QueryClient } from '@tanstack/react-query';
import {
  ValueExpression,
  ValueExpressionType,
  type OutputValueVO,
} from '@coze-workflow/base/types';
import { TriggerSetType, TriggerStatus } from '@coze-workflow/base/api';
import { workflowApi } from '@coze-workflow/base';
import { logger } from '@coze-arch/logger';

import { CronJobType, TriggerForm } from '../types';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
    },
  },
});

interface ResponseData {
  [k: string]: TriggerForm.FormItemMeta & { order: number };
}

const responseFormat = (data: ResponseData): TriggerForm.FormMeta =>
  Object.entries(data)
    .map(([k, v]) => ({
      ...v,
      name: k,
    }))
    .sort((a, b) => a.order - b.order);

export interface TriggerFormMeta {
  startNodeFormMeta: TriggerForm.FormMeta;
  startNodeDefaultFormValue: Record<string, unknown>;
  triggerNodeFormMeta: TriggerForm.FormMeta;
  triggerNodeDefaultFormValue: Record<string, unknown>;
  [TriggerForm.TriggerFormEventIdName]?: string;
  [TriggerForm.TriggerFormAppIdName]?: string;
}

export const fetchTriggerFormMeta = async ({
  spaceId,
  projectId,
}: {
  spaceId?: string;
  projectId?: string;
  workflowId?: string;
  outputs?: OutputValueVO[];
}): Promise<TriggerFormMeta> => {
  try {
    const data = await queryClient.fetchQuery({
      queryKey: ['get-trigger-form'],
      queryFn: async () => {
        const metaResponse = await workflowApi.ListTriggerAppEvents({
          space_id: spaceId ?? '',
          project_id: projectId ?? '',
        });

        const metas = JSON.parse(
          metaResponse.data?.trigger_apps?.[0]?.events?.[0].input_schema ??
            '{}',
        );

        const startNodeFormMeta = responseFormat(
          metas?.schema?.properties?.start_node,
        );

        const triggerNodeFormMeta = responseFormat(
          metas?.schema?.properties?.trigger_node,
        );

        const getDefaultValue = (k, v) => {
          if (k === TriggerForm.TriggerFormCronjobName) {
            return {
              type: CronJobType.Selecting,
              content: {
                type: ValueExpressionType.LITERAL,
                content: v ?? '0 0 0 * * *',
              },
            };
          } else {
            return {
              type: ValueExpressionType.LITERAL,
              content: v,
            };
          }
        };

        const startNodeDefaultFormValue: Record<string, unknown> = {};
        startNodeFormMeta.forEach(item => {
          startNodeDefaultFormValue[item.name] = getDefaultValue(
            item.name,
            item.setterProps?.defaultValue as string,
          );
        });

        const triggerNodeDefaultFormValue: Record<string, unknown> = {};
        triggerNodeFormMeta.forEach(item => {
          if (!isUndefined(item.setterProps?.defaultValue)) {
            triggerNodeDefaultFormValue[item.name] = getDefaultValue(
              item.name,
              item.setterProps.defaultValue as string,
            );
          }
        });

        return {
          startNodeFormMeta,
          startNodeDefaultFormValue,
          triggerNodeFormMeta,
          triggerNodeDefaultFormValue,
          [TriggerForm.TriggerFormEventIdName]:
            metaResponse.data?.trigger_apps?.[0]?.events?.[0].id,
          [TriggerForm.TriggerFormAppIdName]:
            metaResponse.data?.trigger_apps?.[0]?.app_id,
        };
      },
    });
    return data;
  } catch (error) {
    console.error(error);
    logger.error({
      error: error as Error,
      eventName: '/api/workflow_api/list_trigger_events fetch error',
    });
    return {
      startNodeFormMeta: [],
      startNodeDefaultFormValue: {},
      triggerNodeFormMeta: [],
      triggerNodeDefaultFormValue: {},
      [TriggerForm.TriggerFormEventIdName]: '',
      [TriggerForm.TriggerFormAppIdName]: '',
    };
  }
};

export const fetchStartNodeTriggerFormValue = async ({
  spaceId,
  projectId,
  workflowId,
  outputs,
  projectVersion,
}: {
  spaceId?: string;
  projectId?: string;
  workflowId?: string;
  projectVersion?: string;
  outputs?: OutputValueVO[];
}): Promise<{
  formValue: Record<string, unknown>;
  triggerId?: string;
}> => {
  try {
    const formValueResponse = await workflowApi.GetTrigger({
      space_id: spaceId ?? '',
      project_id: projectId ?? '',
      workflow_id: workflowId ?? '',
      project_version: projectVersion,
      /** Delivery DEBUG_PRESET */
      set_type: TriggerSetType.DEBUG_PRESET,
    });

    const config = JSON.parse(formValueResponse?.data?.config ?? '{}');

    const formValue = {
      isOpen: formValueResponse.data?.status === TriggerStatus.Open,
      // ...config,
    };
    Object.keys(
      omit(config, [
        TriggerForm.TriggerFormCronjobName,
        TriggerForm.TriggerFormCronjobTypeName,
      ]),
    ).forEach(k => {
      formValue[k] = {
        type: ValueExpressionType.LITERAL,
        content: config[k],
      };
    });

    /**
     * The cronjob data structure needs to be transformed
     *
     * {crontab:'0 0 0 * * *',crontabType:'selecting'}
     *
     * to
     *
     * {
     *   type:"selecting",
     *   content:{
     *     type:ValueExpressionType.LITERAL,
     *     content:"0 0 0 * * *"
     *   }
     * }
     */
    if (config[TriggerForm.TriggerFormCronjobName]) {
      formValue[TriggerForm.TriggerFormCronjobName] = {
        type: config[TriggerForm.TriggerFormCronjobTypeName],
        content: {
          type: ValueExpressionType.LITERAL,
          content: config[TriggerForm.TriggerFormCronjobName],
        },
      };
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    const _parameters = JSON.parse(formValueResponse?.data?.payload ?? '{}');
    const parameters: Record<string, unknown> = {};
    outputs?.forEach(d => {
      if (!isUndefined(_parameters[d.name])) {
        parameters[d.name] = {
          type: ValueExpressionType.LITERAL,
          content: _parameters[d.name],
        };
      }
    });
    formValue[TriggerForm.TriggerFormParametersName] = parameters;

    return {
      formValue,
      triggerId: formValueResponse?.data?.trigger_id,
    };
  } catch (error) {
    logger.error({
      error: error as Error,
      eventName: 'api/workflow_api/get_trigger fetch error',
    });
    return {
      formValue: {},
    };
  }
};

export const getInputIsEmpty = v =>
  (!v || ValueExpression.isEmpty(v as ValueExpression)
    ? undefined
    : v) as ValueExpression;
