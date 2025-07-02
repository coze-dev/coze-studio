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
