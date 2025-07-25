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
  /** 当新模型不满足配置时会自动弹窗确认，该参数是确认弹窗的回调 */
  onOk: (modelId: string) => void;
}): {
  modalNode: ReactNode;
  /**
   * 检查新模型能力是否满足配置，不满足的话会自动弹出确认 modal
   * @returns true 代表满足
   */
  checkAndOpenModal: (modelId: string) => boolean;
} {
  const toolKeyConfigList = useRegisteredToolKeyConfigList();
  const {
    storeSet: { useModelStore },
  } = useBotEditor();
  const [modalVisible, setModalVisible] = useState(false);
  // Q：单纯通过 modalState 是不是就能判断 modal 是否需要展示，modalVisible 有点多余？
  // A：这里将 visible 和 state 拆分是为了避免弹窗在关闭动画期间 state 数据变更导致弹窗内容跳变
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
        // 需要比模型配置的popover默认 z-index 1030 更高，这里进行内卷
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
  /** 当新模型不满足配置时会自动弹窗确认，该参数是确认弹窗的回调 */
  onOk: (modelId: string) => void;
}): {
  modalNode: ReactNode;
  /**
   * 检查新模型能力是否满足配置，不满足的话会自动弹出确认 modal
   * @returns true 代表满足
   */
  checkAndOpenModal: (modelId: string, agent: Agent) => boolean;
} {
  const toolKeyConfigList = useRegisteredToolKeyConfigList();
  const {
    storeSet: { useModelStore, useDraftBotDataSetStore },
  } = useBotEditor();
  const [modalVisible, setModalVisible] = useState(false);
  // Q：单纯通过 modalState 是不是就能判断 modal 是否需要展示，modalVisible 有点多余？
  // A：这里将 visible 和 state 拆分是为了避免弹窗在关闭动画期间 state 数据变更导致弹窗内容跳变
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
        // 需要比模型配置的popover默认 z-index 1030 更高，这里进行内卷
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
