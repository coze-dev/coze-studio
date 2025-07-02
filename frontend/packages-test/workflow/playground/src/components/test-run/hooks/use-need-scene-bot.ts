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
