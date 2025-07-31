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

import { useParams } from 'react-router-dom';
import { useEffect, useMemo } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { size } from 'lodash-es';
import { usePageRuntimeStore } from '@coze-studio/bot-detail-store/page-runtime';
import { useBotDetailIsReadonly } from '@coze-studio/bot-detail-store';
import {
  messageReportEvent,
  skillKeyToApiStatusKeyTransformer,
} from '@coze-arch/bot-utils';
import { type DynamicParams } from '@coze-arch/bot-typings/teamspace';
import { type TRouteConfigGlobal, useRouteConfig } from '@coze-arch/bot-hooks';
import {
  type TabDisplayItems,
  TabStatus,
} from '@coze-arch/bot-api/developer_api';
import { type SkillKeyEnum } from '@coze-agent-ide/tool-config';

/**hook */
export {
  useAgentPersistence,
  useAgentFormManagement,
  AgentInfoForm,
  type AgentInfoFormProps,
  type UseAgentFormManagementProps,
  type UseAgentPersistenceProps,
  type AgentInfoFormValue,
} from './use-create-bot';
export { useSubscribeOnboardingAndUpdateChatArea } from './use-subscribe-onboarding-and-update-chat-area';
export { useWorkflowPublishedModel } from './tools-publish-back-modal';
export { useEditConfirm } from './use-edit-confirm';
export { useInit, AgentInitCallback, AgentInitProps } from './use-init';
export { useCurrentNodeId } from './use-node-id';
export { useDataSetArea, Setting } from '../component/data-set/data-set-area';

export { useMonetizeConfigReadonly } from './use-monetize-config-readonly';

export { useDatasetAutoChangeConfirm } from './use-dataset-auto-change-confirm';
export { useUnbindPlatformModal } from './use-unbind-platform';
export { useSpaceRole } from './use-space-role';
export {
  useGenerateLink,
  useGetUserQueryCollectOption,
} from './use-query-collect';

export type TBotRouteConfig = (
  | {
      requireBotEditorInit: true;
      pageName: 'bot' | 'analysis' | 'evaluation';
      hasHeader?: true;
    }
  | {
      requireBotEditorInit: false;
      pageName: 'publish';
      hasHeader?: true;
    }
  | {
      requireBotEditorInit: true;
      pageName: 'publish-detail' | 'publish-gray' | 'publish-ppe';
      hasHeader?: false;
    }
) &
  TRouteConfigGlobal;

export const useBotRouteConfig = useRouteConfig<TBotRouteConfig>;

export const useMessageReportEvent = () => {
  const params = useParams<DynamicParams>();
  useEffect(() => {
    if (params.bot_id) {
      messageReportEvent.start(params.bot_id);
    }
    return () => {
      messageReportEvent.interrupt();
    };
  }, [params.bot_id]);
};

/**
 * Used to verify the default expanded and stowed state of the current module
 *
 * @Deprecated, please use the useToolContentBlockDefaultExpand in @code-agent-ide/tool
 * @param blockKey primary key
 * @param configured whether there is configuration content
 * Check when @param
 *
 * @see
 */
export const useDefaultExPandCheck = (
  $params: {
    blockKey: SkillKeyEnum;
    configured: boolean;
  },
  $when = true,
) => {
  const { blockKey, configured = false } = $params;
  const isReadonly = useBotDetailIsReadonly();
  const { init, editable, botSkillBlockCollapsibleState } = usePageRuntimeStore(
    useShallow(store => ({
      init: store.init,
      editable: store.editable,
      botSkillBlockCollapsibleState: store.botSkillBlockCollapsibleState,
    })),
  );
  return useMemo(() => {
    // No verification
    if (!$when) {
      return undefined;
      // Finite-state machine not ready
    } else if (!init || size(botSkillBlockCollapsibleState) === 0) {
      return undefined;
      /**
       * @Description A user behavior record is only valid if the following conditions are met
       *
       * 1. Have editing rights
       * 2. Cannot be a historical preview environment
       * 3. Must be configured
       */
    } else if (editable && !isReadonly && configured) {
      const transformerBlockKey = skillKeyToApiStatusKeyTransformer(blockKey);
      const collapsibleState =
        botSkillBlockCollapsibleState[
          transformerBlockKey as keyof TabDisplayItems
        ];
      if (collapsibleState === TabStatus.Open) {
        return true;
      } else if (collapsibleState === TabStatus.Close) {
        return false;
      }
    }
    return configured;
  }, [
    $when,
    blockKey,
    configured,
    init,
    isReadonly,
    editable,
    botSkillBlockCollapsibleState,
  ]);
};
