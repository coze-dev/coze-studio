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

import { type ReactNode, useState } from 'react';

import { useRegisteredToolKeyConfigList } from '@coze-agent-ide/tool';
import { type Agent } from '@coze-studio/bot-detail-store';
import { useBotEditor } from '@coze-agent-ide/bot-editor-context-store';
import { Modal } from '@coze-arch/coze-design';

import { agentModelFuncConfigCheck } from '../../utils/model-func-config-check/agent-check';
import {
  checkModelAbility,
  DONT_SHOW_TIPS_LOCAL_CACHE_KEY,
  confirm,
  ModelCapabilityAlertModelContent,
  mapConfigTypeToAlertItem,
  type AlertItem,
} from './base';

export const useModelCapabilityCheckAndConfirm = () => {
  const toolKeyConfigList = useRegisteredToolKeyConfigList();
  const {
    storeSet: { useModelStore },
  } = useBotEditor();

  return async (modelId: string): Promise<boolean> => {
    if (localStorage.getItem(DONT_SHOW_TIPS_LOCAL_CACHE_KEY)) {
      return true;
    }
    const model = useModelStore.getState().getModelById(modelId);
    const functionConfig = model?.func_config;
    if (!functionConfig) {
      return true;
    }
    const [notSupported, poorSupported] = checkModelAbility(
      toolKeyConfigList,
      functionConfig,
    );
    return confirm({
      notSupported,
      poorSupported,
      modelName: model.name ?? '',
    });
  };
};

export function useModelCapabilityCheckModal({
  onOk,
}: {
  /** When the new model does not meet the configuration, the pop-up window will automatically confirm. This parameter is the callback to confirm the pop-up window. */
  onOk: (modelId: string) => void;
}): {
  modalNode: ReactNode;
  /**
   * Check whether the new model capability meets the configuration. If not, a confirmation modal will automatically pop up.
   * @Returns true for satisfied
   */
  checkAndOpenModal: (modelId: string) => boolean;
} {
  const toolKeyConfigList = useRegisteredToolKeyConfigList();
  const {
    storeSet: { useModelStore },
  } = useBotEditor();
  const [modalVisible, setModalVisible] = useState(false);
  // Q: Is it possible to determine whether modal needs to be displayed simply by modalState, and modalVisible is a bit redundant?
  // A: The visible and state are split here to avoid the pop-up window content jumping due to the change of state data during the closing animation
  const [modalState, setModalState] = useState<
    | {
        notSupported: AlertItem[];
        poorSupported: AlertItem[];
        modelName: string;
        modelId: string;
      }
    | undefined
  >();

  return {
    modalNode: modalState ? (
      <Modal
        visible={modalVisible}
        // It needs to be higher than the default z-index 1030 of the popover configured by the model.
        zIndex={1031}
        width={480}
        header={null}
        footer={null}
        onCancel={() => setModalVisible(false)}
      >
        <ModelCapabilityAlertModelContent
          notSupported={modalState.notSupported}
          poorSupported={modalState.poorSupported}
          modelName={modalState.modelName}
          onOk={() => {
            onOk(modalState.modelId);
            setModalVisible(false);
          }}
          onCancel={() => {
            setModalVisible(false);
          }}
        />
      </Modal>
    ) : null,
    checkAndOpenModal: modelId => {
      if (localStorage.getItem(DONT_SHOW_TIPS_LOCAL_CACHE_KEY)) {
        return true;
      }
      const model = useModelStore.getState().getModelById(modelId);
      const functionConfig = model?.func_config;
      if (!functionConfig) {
        return true;
      }

      const [notSupported, poorSupported] = checkModelAbility(
        toolKeyConfigList,
        functionConfig,
      );
      if (notSupported.length === 0 && poorSupported.length === 0) {
        return true;
      }

      setModalVisible(true);
      setModalState({
        notSupported,
        poorSupported,
        modelId,
        modelName: model?.name ?? '',
      });
      return false;
    },
  };
}

export const useAgentModelCapabilityCheckAndAlert = () => {
  const toolKeyConfigList = useRegisteredToolKeyConfigList();
  const {
    storeSet: { useModelStore, useDraftBotDataSetStore },
  } = useBotEditor();
  return async (modelId: string, agent: Agent) => {
    if (localStorage.getItem(DONT_SHOW_TIPS_LOCAL_CACHE_KEY)) {
      return true;
    }
    const model = useModelStore.getState().getModelById(modelId);
    const config = model?.func_config;
    if (!config) {
      return true;
    }
    const [commonNotSupported, commonPoorSupported] = checkModelAbility(
      toolKeyConfigList,
      config,
    );

    const { notSupported, poorSupported } = agentModelFuncConfigCheck({
      config,
      agent,
      context: {
        getDatasetById: id =>
          useDraftBotDataSetStore.getState().datasetsMap[id],
        config,
      },
    });
    return confirm({
      notSupported: [
        ...commonNotSupported,
        ...notSupported.map(mapConfigTypeToAlertItem),
      ],
      poorSupported: [
        ...commonPoorSupported,
        ...poorSupported.map(mapConfigTypeToAlertItem),
      ],
      modelName: model.name ?? '',
    });
  };
};

export function useAgentModelCapabilityCheckModal({
  onOk,
}: {
  /** When the new model does not meet the configuration, the pop-up window will automatically confirm. This parameter is the callback to confirm the pop-up window. */
  onOk: (modelId: string) => void;
}): {
  modalNode: ReactNode;
  /**
   * Check whether the new model capability meets the configuration. If not, a confirmation modal will automatically pop up.
   * @Returns true for satisfied
   */
  checkAndOpenModal: (modelId: string, agent: Agent) => boolean;
} {
  const toolKeyConfigList = useRegisteredToolKeyConfigList();
  const {
    storeSet: { useModelStore, useDraftBotDataSetStore },
  } = useBotEditor();
  const [modalVisible, setModalVisible] = useState(false);
  // Q: Is it possible to determine whether modal needs to be displayed simply by modalState, and modalVisible is a bit redundant?
  // A: The visible and state are split here to avoid the pop-up window content jumping due to the change of state data during the closing animation
  const [modalState, setModalState] = useState<
    | {
        notSupported: AlertItem[];
        poorSupported: AlertItem[];
        modelName: string;
        modelId: string;
      }
    | undefined
  >();

  return {
    modalNode: modalState ? (
      <Modal
        visible={modalVisible}
        // It needs to be higher than the default z-index 1030 of the popover configured by the model.
        zIndex={1031}
        width={480}
        header={null}
        footer={null}
        onCancel={() => setModalVisible(false)}
      >
        <ModelCapabilityAlertModelContent
          notSupported={modalState.notSupported}
          poorSupported={modalState.poorSupported}
          modelName={modalState.modelName}
          onOk={() => {
            onOk(modalState.modelId);
            setModalVisible(false);
          }}
          onCancel={() => {
            setModalVisible(false);
          }}
        />
      </Modal>
    ) : null,
    checkAndOpenModal: (modelId, agent) => {
      if (localStorage.getItem(DONT_SHOW_TIPS_LOCAL_CACHE_KEY)) {
        return true;
      }
      const model = useModelStore.getState().getModelById(modelId);
      const config = model?.func_config;
      if (!config) {
        return true;
      }

      const [commonNotSupported, commonPoorSupported] = checkModelAbility(
        toolKeyConfigList,
        config,
      );

      const { notSupported, poorSupported } = agentModelFuncConfigCheck({
        config,
        agent,
        context: {
          getDatasetById: id =>
            useDraftBotDataSetStore.getState().datasetsMap[id],
          config,
        },
      });

      if (notSupported.length === 0 && poorSupported.length === 0) {
        return true;
      }

      setModalVisible(true);
      setModalState({
        notSupported: [
          ...commonNotSupported,
          ...notSupported.map(mapConfigTypeToAlertItem),
        ],
        poorSupported: [
          ...commonPoorSupported,
          ...poorSupported.map(mapConfigTypeToAlertItem),
        ],
        modelId,
        modelName: model?.name ?? '',
      });
      return false;
    },
  };
}
