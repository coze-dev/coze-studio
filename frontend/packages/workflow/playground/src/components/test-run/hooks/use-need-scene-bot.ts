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
 
import { type StandardNodeType } from '@coze-workflow/base/types';
import { I18n } from '@coze-arch/i18n';

import { FieldName } from '../constants';
import { useGetSceneFlowBot } from '../../../hooks/use-get-scene-flow-params';
import { useGetWorkflowMode } from '../../../hooks';

/**
 * 场景工作流下，判断testrun是否需要关联的bot_id
 */
export const useNeedSceneBot = (nodeType: StandardNodeType) => {
  const { isSceneFlow } = useGetWorkflowMode();
  const sceneFlowHost = useGetSceneFlowBot();

  return {
    needSceneBot: isSceneFlow,
    sceneBotSchema: {
      type: 'FormString',
      name: FieldName.Bot,
      initialValue: sceneFlowHost?.participantId,
      title: I18n.t('workflow_detail_testrun_bot', {}, '关联 Bot'),
      disabled: true,
      // 没有 nodeType，说明是整个试运行，隐藏 bot
      hidden: !nodeType,
      decorator: {
        type: 'FormItem',
      },
      component: {
        type: 'Select',
        props: {
          optionList: [
            {
              label: sceneFlowHost?.name,
              value: sceneFlowHost?.participantId,
            },
          ],
          disabled: true,
        },
      },
    },
  };
};
