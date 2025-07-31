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

import React, { type FC, useMemo } from 'react';

import { I18n } from '@coze-arch/i18n';
import { WorkflowMode } from '@coze-arch/bot-api/workflow_api';
import { Image, useTheme } from '@coze-arch/coze-design';

import workflowLightImg from './assets/workflow-light.jpg';
import workflowDarkImg from './assets/workflow-dark.jpg';
import chatflowLightImg from './assets/chatflow-light.jpg';
import chatflowDarkImg from './assets/chatflow-dark.jpg';

export interface WorkflowTooltipProps {
  flowMode: WorkflowMode;
}

const ILLUSTRATION_IMG_URL = {
  workflow: {
    dark: workflowDarkImg,
    light: workflowLightImg,
  },
  chatflow: {
    dark: chatflowDarkImg,
    light: chatflowLightImg,
  },
};

export const WorkflowTooltip: FC<WorkflowTooltipProps> = ({ flowMode }) => {
  const { theme } = useTheme();
  const imgUrl = useMemo(() => {
    switch (flowMode) {
      case WorkflowMode.ChatFlow:
        return (
          ILLUSTRATION_IMG_URL.chatflow[theme] ||
          ILLUSTRATION_IMG_URL.chatflow.light
        );
      default:
        return (
          ILLUSTRATION_IMG_URL.workflow[theme] ||
          ILLUSTRATION_IMG_URL.workflow.light
        );
    }
  }, [theme, flowMode]);
  return (
    <div className="flex flex-col gap-1">
      <Image
        src={imgUrl}
        crossOrigin="anonymous"
        imgStyle={{
          width: 200,
          minHeight: 120,
          borderRadius: '7.5px',
          border: '1px solid var(--coz-stroke-primary)',
        }}
        preview={false}
      />
      <div className="px-2 pt-1 pb-2">
        <p className="text-14 font-medium coz-fg-primary leading-5">
          {flowMode === WorkflowMode.Workflow ? 'Workflow' : 'Chatflow'}
        </p>
        <span className="text-[12px] coz-fg-primary leading-4">
          {flowMode === WorkflowMode.Workflow
            ? I18n.t('wf_chatflow_02')
            : I18n.t('wf_chatflow_01')}
        </span>
      </div>
    </div>
  );
};
