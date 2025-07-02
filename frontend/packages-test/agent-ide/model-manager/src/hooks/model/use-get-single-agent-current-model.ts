import { useShallow } from 'zustand/react/shallow';
import { useModelStore as useBotDetailModelStore } from '@coze-studio/bot-detail-store/model';
import {
  getModelById,
  useBotEditor,
} from '@coze-agent-ide/bot-editor-context-store';

export const useGetSingleAgentCurrentModel = () => {
  const {
    storeSet: { useModelStore },
  } = useBotEditor();

  const { onlineModelList, offlineModelMap } = useModelStore(
    useShallow(state => ({
      onlineModelList: state.onlineModelList,
      offlineModelMap: state.offlineModelMap,
    })),
  );
  const { model } = useBotDetailModelStore(state => state.config);
  return getModelById({
    onlineModelList,
    offlineModelMap,
    id: model ?? '',
  });
};
