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
 
import { uniq } from 'lodash-es';
import { useRequest } from 'ahooks';
import { useMultiAgentStore } from '@coze-studio/bot-detail-store/multi-agent';
import { useModelStore as useBotDetailModelStore } from '@coze-studio/bot-detail-store/model';
import { useBotInfoStore } from '@coze-studio/bot-detail-store/bot-info';
import { SpaceApi } from '@coze-arch/bot-space-api';
import { CustomError } from '@coze-arch/bot-error';
import { BotMode, ModelScene } from '@coze-arch/bot-api/developer_api';
import { useBotEditor } from '@coze-agent-ide/bot-editor-context-store';
import {
  useBotCreatorContext,
  BotCreatorScene,
} from '@coze-agent-ide/bot-creator-context';

import { ReportEventNames } from '../../report-events/report-event-names';

export const useGetModelList = () => {
  const {
    storeSet: { useModelStore },
  } = useBotEditor();
  const mode = useBotInfoStore(state => state.mode);

  const { scene } = useBotCreatorContext();

  const getModelList = async () => {
    const model = useBotDetailModelStore.getState();
    const multiAgent = useMultiAgentStore.getState();
    const agentList = multiAgent.agents;

    const singleAgentModelId = model.config.model ?? '';

    const agentModelIdList = uniq(
      agentList
        .map(agent => agent.model.model)
        .filter((id): id is string => Boolean(id)),
    );

    const expectedIdList: string[] = {
      [BotMode.SingleMode]: [singleAgentModelId],
      [BotMode.MultiMode]: agentModelIdList,
      [BotMode.WorkflowMode]: [],
    }[mode];

    const res = await SpaceApi.GetTypeList({
      cur_model_ids: expectedIdList,
      model: true,
      // 开源版暂不支持该功能
      ...(scene === BotCreatorScene.DouyinBot && {
        model_scene: ModelScene.Douyin,
      }),
    });

    const modelList = res.data.model_list;

    if (!modelList) {
      throw new CustomError(
        ReportEventNames.GetTypeListError,
        'get model list undefined',
      );
    }

    return modelList;
  };

  useRequest(getModelList, {
    onSuccess: modelList => {
      const { setOnlineModelList, setOfflineModelMap } =
        useModelStore.getState();

      setOnlineModelList(modelList.filter(model => !model.is_offline));

      setOfflineModelMap(
        Object.fromEntries(
          modelList
            .filter(model => model.is_offline)
            .map(model => [model.model_type, model]),
        ),
      );
    },
    refreshDeps: [mode],
  });
};
