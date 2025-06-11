import { useEffect, useState } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { useModelStore } from '@coze-studio/bot-detail-store/model';
import { useBotDetailIsReadonly } from '@coze-studio/bot-detail-store';
import { useSpaceStore } from '@coze-arch/bot-studio-store';
import { type Model } from '@coze-arch/bot-api/developer_api';
import { ModelSelect } from '@coze-agent-ide/model-manager/model-select-v2';
import {
  useModelCapabilityCheckModal,
  useGetSingleAgentCurrentModel,
  getModelOptionList,
} from '@coze-agent-ide/model-manager';
import { useBotEditor } from '@coze-agent-ide/bot-editor-context-store';
import {
  useBotCreatorContext,
  BotCreatorScene,
} from '@coze-agent-ide/bot-creator-context';

export interface SingleAgentModelViewProps {
  modelListExtraHeaderSlot?: React.ReactNode;
  triggerRender?: (model?: Model, popoverVisible?: boolean) => React.ReactNode;
}

export function SingleAgentModelView(props: SingleAgentModelViewProps) {
  const { modelListExtraHeaderSlot, triggerRender } = props;
  const spaceId = useSpaceStore(store => store.space.id);
  const { scene } = useBotCreatorContext();
  const currentModel = useGetSingleAgentCurrentModel();
  const currentModelId = currentModel?.model_type
    ? String(currentModel.model_type)
    : undefined;

  const { storeSet } = useBotEditor();
  const modelStore = storeSet.useModelStore(
    useShallow(state => ({
      onlineModelList: state.onlineModelList,
      offlineModelMap: state.offlineModelMap,
      getModelPreset: state.getModelPreset,
    })),
  );
  // 不知为何 save-manager 没有 debounce，切换模型及其产生的初始配置更新会触发两次保存请求
  // 这里通过在业务侧维护一个 state，切换模型时只临时修改 state，不直接修改 store，来规避首次保存请求
  // ！！不能用 modelSaveManager.handleWithoutAutosave
  // 因为如果第一次就在 store 中修改了 modelId，则第二次修改 store 可能会没有 diff 被 auto-save 拦截，导致两次保存都不触发请求
  const [currentModelIdState, setCurrentModelIdState] = useState<
    string | undefined
  >(currentModelId);

  const { modelConfig, setModelByImmer } = useModelStore(
    useShallow(state => ({
      modelConfig: state.config,
      setModelByImmer: state.setModelByImmer,
    })),
  );

  const { modalNode, checkAndOpenModal } = useModelCapabilityCheckModal({
    onOk: modelId => {
      setCurrentModelIdState(modelId);
    },
  });

  const isReadonly = useBotDetailIsReadonly();

  const modelList = getModelOptionList({
    onlineModelList: modelStore.onlineModelList,
    offlineModelMap: modelStore.offlineModelMap,
    currentModelId: String(currentModel?.model_type),
  });

  useEffect(() => {
    setCurrentModelIdState(currentModelId);
  }, [currentModelId]);

  return currentModelIdState ? (
    <>
      <ModelSelect
        popoverClassName="h-auto !max-h-[70vh]"
        disabled={isReadonly}
        enableJumpDetail={
          scene === BotCreatorScene.Bot && spaceId && !IS_OPEN_SOURCE
            ? { spaceId }
            : undefined
        }
        modelListExtraHeaderSlot={modelListExtraHeaderSlot}
        selectedModelId={currentModelIdState}
        modelList={modelList}
        onModelChange={m => {
          const modelId = String(m.model_type);
          const checkPassed = checkAndOpenModal(modelId);
          if (checkPassed) {
            setCurrentModelIdState(modelId);
          }
          return checkPassed;
        }}
        modelConfigProps={{
          hideDiversityCollapseButton: true,
          agentType: 'single',
          currentConfig: modelConfig,
          onConfigChange: v => {
            setModelByImmer(draft => {
              draft.config = {
                model: currentModelIdState,
                ...v,
              };
            });
          },
          modelStore,
        }}
        triggerRender={triggerRender}
        modalSlot={modalNode}
      />
    </>
  ) : null;
}
