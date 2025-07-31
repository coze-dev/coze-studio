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
   * Dynamically update the context information in initService, which is convenient for the business party to call the dynamic update of refreshMessageList
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
