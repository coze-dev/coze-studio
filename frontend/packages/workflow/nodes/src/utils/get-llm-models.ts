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

/** 默认的 response format 值 */
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
 * 1. 给模型列表中每个模型的 response_format 参数项补全
 * 2. 硬编码设置 response_format 的默认值为 JSON
 * @param modelList 模型列表
 * @returns 补全 response_format 参数后的模型列表
 */
const repairResponseFormatInModelList = (modelList: Model[]) => {
  // 找到模型列表中 model_params 的第一个 response_format 参数项
  // 这段代码从下边循环中提出来，不需要每次循环计算一次
  const modelHasResponseFormatItem = modelList
    .find(_m => _m.model_params?.find(p => p.name === RESPONSE_FORMAT_NAME))
    ?.model_params?.find(p => p.name === RESPONSE_FORMAT_NAME);

  return modelList.map(m => {
    // 兼容后端未刷带的数据，没有 responseFormat 就补上
    const responseFormat = m.model_params?.find(
      p => p?.name === RESPONSE_FORMAT_NAME,
    ) as ModelParameter;

    if (!responseFormat) {
      if (modelHasResponseFormatItem) {
        m.model_params?.push(modelHasResponseFormatItem as ModelParameter);
      } else {
        // 填充一个默认的 response_format 参数
        m.model_params?.push(getDefaultResponseFormat());
      }
    }

    // 此时再找一次 responseFormat，因为上边补全了 responseFormat
    const newResponseFormat = m.model_params?.find(
      p => p?.name === RESPONSE_FORMAT_NAME,
    ) as ModelParameter;

    // 重置默认值为 JSON
    Object.keys(newResponseFormat?.default_val ?? {}).forEach(k => {
      newResponseFormat.default_val[k] = ResponseFormat.JSON;
    });

    if (newResponseFormat) {
      // 重置选项，text markdown json 都要支持
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

        // 从这里开始到 return modelList 全是给后端擦屁股
        // 这里有 hard code ，需要把输出格式的默认值设置为 JSON
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
    // 上报js错误
    captureException(
      new Error(
        I18n.t('workflow_detail_error_message', {
          msg: 'fetch error',
        }),
      ),
    );
    // 兜底返回空数组
    return [];
  }
};
