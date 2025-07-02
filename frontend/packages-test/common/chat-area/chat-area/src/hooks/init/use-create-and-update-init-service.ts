import { type MutableRefObject, useRef } from 'react';

import { merge } from 'lodash-es';

import { InitService } from '../../service/init-service';
import {
  recordInitServiceController,
  retrieveAndClearInitService,
} from '../../service/extend-data-lifecycle';
import { type ChatAreaProviderProps } from '../../context/chat-area-context/type';
import { defaultConfigs } from '../../context/chat-area-context/default-props';

export const useCreateAndUpdateInitService = ({
  spaceId,
  botId,
  userInfo,
  presetBot,
  requestToInit,
  scene,
  eventCallback,
  reporter: inputReporter,
  configs: userConfigs,
  createChatCoreOverrideConfig,
  enableChatCoreDebug,
  enableChatActionLock,
  extendDataLifecycle,
  pluginRegistryList,
  enableTwoWayLoad,
  enableMarkRead,
}: ChatAreaProviderProps) => {
  const configs = merge({}, defaultConfigs, userConfigs);

  const flagRef = useRef({
    enableTwoWayLoad: enableTwoWayLoad ?? false,
    enableMarkRead: enableMarkRead ?? false,
  });

  flagRef.current = {
    enableTwoWayLoad: enableTwoWayLoad ?? false,
    enableMarkRead: enableMarkRead ?? false,
  };

  const initControllerRef = useRef<InitService | null>(null);

  if (!initControllerRef.current) {
    const isFullSite = extendDataLifecycle === 'full-site';

    const preInitController = retrieveAndClearInitService(scene);

    if (isFullSite && preInitController) {
      initControllerRef.current = preInitController;
      recordInitServiceController(scene, preInitController);
    } else {
      initControllerRef.current = new InitService({
        spaceId,
        botId,
        userInfo,
        presetBot,
        requestToInit,
        scene,
        eventCallback,
        reporter: inputReporter,
        configs,
        createChatCoreOverrideConfig,
        enableChatCoreDebug,
        enableChatActionLock,
        loadMoreFlagRef: flagRef,
        extendDataLifecycle,
        pluginRegistryList,
      });
    }
  }

  /**
   * 动态更新 initService 中的 context 信息，便于业务方调用 refreshMessageList 的动态更新
   */
  initControllerRef.current.updateContext({
    requestToInit,
    userInfo,
    createChatCoreOverrideConfig,
  });
  initControllerRef.current.immediatelyUpdateContext({
    userInfo,
    createChatCoreOverrideConfig,
  });

  return {
    initControllerRef:
      initControllerRef as unknown as MutableRefObject<InitService>,
    configs,
  };
};
