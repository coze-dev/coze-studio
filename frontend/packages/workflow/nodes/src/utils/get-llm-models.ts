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

import { QueryClient } from '@tanstack/react-query';
import {
  captureException,
  RESPONSE_FORMAT_NAME,
  ResponseFormat,
} from '@coze-workflow/base';
import { logger } from '@coze-arch/logger';
import { I18n } from '@coze-arch/i18n';
import { ModelScene } from '@coze-arch/bot-api/playground_api';
import {
  type GetTypeListRequest,
  type Model,
  type ModelParameter,
} from '@coze-arch/bot-api/developer_api';
import { DeveloperApi as developerApi } from '@coze-arch/bot-api';

import { getLLMModelIds } from './get-llm-model-ids';

/** Default response format value */
export const getDefaultResponseFormat = () => ({
  name: RESPONSE_FORMAT_NAME,
  label: I18n.t('model_config_response_format'),
  desc: I18n.t('model_config_response_format_explain'),
  type: 2,
  min: '',
  max: '',
  precision: 0,
  default_val: {
    default_val: '0',
  },
  options: [
    {
      label: I18n.t('model_config_history_text'),
      value: '0',
    },
    {
      label: I18n.t('model_config_history_markdown'),
      value: '1',
    },
  ],
  param_class: {
    class_id: 2,
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
    },
  },
});

/**
 * 1. Complete the response_format parameter items for each model in the model list
 * 2. hardcoding settings response_format default value is JSON
 * @param modelList
 * @Returns List of models after completing response_format parameters
 */
const repairResponseFormatInModelList = (modelList: Model[]) => {
  // Find the first response_format item model_params in the model list
  // This code is taken from the following loop and does not need to be evaluated every time
  const modelHasResponseFormatItem = modelList
    .find(_m => _m.model_params?.find(p => p.name === RESPONSE_FORMAT_NAME))
    ?.model_params?.find(p => p.name === RESPONSE_FORMAT_NAME);

  return modelList.map(m => {
    // Compatible with unflashed data on the backend, it will be added without responseFormat.
    const responseFormat = m.model_params?.find(
      p => p?.name === RESPONSE_FORMAT_NAME,
    ) as ModelParameter;

    if (!responseFormat) {
      if (modelHasResponseFormatItem) {
        m.model_params?.push(modelHasResponseFormatItem as ModelParameter);
      } else {
        // Fill in a default response_format parameter
        m.model_params?.push(getDefaultResponseFormat());
      }
    }

    // At this point, find the responseFormat again, because the responseFormat is completed above.
    const newResponseFormat = m.model_params?.find(
      p => p?.name === RESPONSE_FORMAT_NAME,
    ) as ModelParameter;

    // Reset the default value to JSON
    Object.keys(newResponseFormat?.default_val ?? {}).forEach(k => {
      newResponseFormat.default_val[k] = ResponseFormat.JSON;
    });

    if (newResponseFormat) {
      // Reset options, text markdown json must be supported
      newResponseFormat.options = [
        {
          label: I18n.t('model_config_history_text'),
          value: ResponseFormat.Text,
        },
        {
          label: I18n.t('model_config_history_markdown'),
          value: ResponseFormat.Markdown,
        },
        {
          label: I18n.t('model_config_history_json'),
          value: ResponseFormat.JSON,
        },
      ] as unknown as ModelParameter[];
    }

    return m;
  });
};

export const getLLMModels = async ({
  info,
  spaceId,
  document,
  isBindDouyin,
}): Promise<Model[]> => {
  try {
    const modelList = await queryClient.fetchQuery({
      queryKey: ['llm-model'],
      queryFn: async () => {
        const schema = JSON.parse(info?.schema_json || '{}');

        const llmModelIds = getLLMModelIds(schema, document);

        const getTypeListParams: GetTypeListRequest = {
          space_id: spaceId,
          model: true,
          cur_model_ids: llmModelIds,
        };

        if (isBindDouyin) {
          getTypeListParams.model_scene = ModelScene.Douyin;
        }

        const resp = await developerApi.GetTypeList(getTypeListParams);
        const _modelList: Model[] = resp?.data?.model_list ?? [];

        // From here to return modelList is all about wiping the butt of the backend
        // There is hard code here, you need to set the default value of the output format to JSON
        return repairResponseFormatInModelList(_modelList);
      },
      staleTime: 3000,
    });
    return modelList;
  } catch (error) {
    logger.error({
      error: error as Error,
      eventName: 'api/bot/get_type_list fetch error',
    });
    // Report a js error
    captureException(
      new Error(
        I18n.t('workflow_detail_error_message', {
          msg: 'fetch error',
        }),
      ),
    );
    // Return empty array
    return [];
  }
};
