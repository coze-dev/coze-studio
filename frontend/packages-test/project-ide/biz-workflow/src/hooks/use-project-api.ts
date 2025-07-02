import { useMemoizedFn } from 'ahooks';
import { type ProjectApi } from '@coze-workflow/playground';
import {
  useSendMessageEvent,
  useIDENavigate,
  useCurrentWidgetContext,
  useIDEGlobalContext,
} from '@coze-project-ide/framework';

/**
 * 注入到 workflow 内 project api 的能力。
 * 注：非响应式
 */
export const useProjectApi = () => {
  const { sendOpen } = useSendMessageEvent();
  const { widget: uiWidget } = useCurrentWidgetContext();
  const navigate = useIDENavigate();
  const ideGlobalContext = useIDEGlobalContext();

  const getProjectAPI = useMemoizedFn(() => {
    const api: ProjectApi = {
      navigate,
      ideGlobalStore: ideGlobalContext,
      setWidgetUIState: (status: string) => uiWidget.setUIState(status as any),
      sendMsgOpenWidget: sendOpen,
    };
    return api;
  });

  return getProjectAPI;
};
