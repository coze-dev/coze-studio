/* eslint-disable @typescript-eslint/no-explicit-any -- TODO: 临时处理，后面会换个组件 @jiangxujin */
import {
  TestsetManageEventName,
  TestsetManageProvider,
  FormItemSchemaType,
} from '@coze-devops/testset-manage';
import { EVENT_NAMES, sendTeaEvent } from '@coze-arch/bot-tea';
import { ComponentType } from '@coze-arch/bot-api/debugger_api';

import { JsonEditorSemi } from '../test-form-materials/json-editor';
import { BotSelectTestset } from '../test-form-materials/bot-select';
import { useTestsetBizCtx } from '../hooks/use-testset-biz-ctx';
import { useGetStartNode } from '../hooks/use-get-start-node';
import { useGlobalState } from '../../../hooks';

/** 上报埋点 */
function reportEvent(
  evtName: TestsetManageEventName,
  payload?: Record<string, unknown>,
) {
  switch (evtName) {
    case TestsetManageEventName.CREATE_TESTSET_SUCCESS:
      sendTeaEvent(EVENT_NAMES.workflow_create_testset, payload);
      break;
    case TestsetManageEventName.AIGC_PARAMS_CLICK:
      sendTeaEvent(EVENT_NAMES.workflow_aigc_params, payload);
      break;
    default:
      break;
  }
}

export const Provider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const globalState = useGlobalState();
  const bizCtx = useTestsetBizCtx();
  const { getNode } = useGetStartNode();
  return (
    <TestsetManageProvider
      bizCtx={bizCtx}
      bizComponentSubject={{
        // 目前只有start节点有Testset管理
        componentID: getNode()?.id,
        componentType: ComponentType.CozeStartNode,
        parentComponentID: globalState.workflowId,
        parentComponentType: ComponentType.CozeWorkflow,
      }}
      editable={!globalState.config.preview}
      formRenders={{
        [FormItemSchemaType.BOT]: BotSelectTestset as any,
        [FormItemSchemaType.LIST]: JsonEditorSemi as any,
        [FormItemSchemaType.OBJECT]: JsonEditorSemi as any,
      }}
      reportEvent={reportEvent}
    >
      {children}
    </TestsetManageProvider>
  );
};
