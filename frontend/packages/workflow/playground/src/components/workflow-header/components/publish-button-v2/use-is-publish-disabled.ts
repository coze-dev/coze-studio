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
 
import { useMemo } from 'react';

import { I18n } from '@coze-arch/i18n';
import { VCSCanvasType } from '@coze-arch/bot-api/workflow_api';

import { useGlobalState } from '@/hooks';

/**
 * 总结发布按钮不可用的 case：
 * 1. 流程处于运行中或保存中，不可发布
 * 2. 多人模式下，流程未提交，不可发布
 * 3. vcs 模式下，流程已经发布过了，不可发布
 * 4. db 模式无其他限制，可随意发布
 */
export const useIsPublishDisabled = () => {
  const { isCollaboratorMode, isExecuting, isVcsMode, config, info } =
    useGlobalState();
  const { vcsData } = info;
  const { saving } = config;

  const disabled = useMemo(() => {
    // 执行中或保存中的流程不能发布
    if (isExecuting || saving) {
      return true;
    }
    // 多人协作模式：流程处于提交态且流程处于可发布状态
    if (isCollaboratorMode) {
      const canPublish = vcsData?.type === VCSCanvasType.Submit;
      return !canPublish;
    }
    if (isVcsMode && vcsData?.type === VCSCanvasType.Publish) {
      return true;
    }

    return false;
  }, [isExecuting, saving, isVcsMode, isCollaboratorMode, vcsData]);

  const tooltip = useMemo(() => {
    if (isCollaboratorMode) {
      return I18n.t('workflow_publish_multibranch_publish_disabled_tooltip');
    }
    if (isVcsMode && vcsData?.type === VCSCanvasType.Publish) {
      return I18n.t('workflow_no_change_tooltip');
    }
  }, [vcsData, isCollaboratorMode, isVcsMode]);

  return { disabled, tooltip };
};
