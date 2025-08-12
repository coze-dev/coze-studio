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

import { useEffect, useRef } from 'react';

import { EVENT_NAMES, sendTeaEvent } from '@coze-arch/bot-tea';
import { useCreateProjectModal } from '@coze-studio/project-entity-adapter';
import { cozeMitt } from '@coze-common/coze-mitt';

export const useCreateBotAction = ({
  autoCreate,
  urlSearch,
  currentSpaceId,
}: {
  autoCreate?: boolean;
  urlSearch?: string;
  currentSpaceId?: string;
}) => {
  // Create bot function
  const newWindowRef = useRef<Window | null>(null);
  const openWindow = () => {
    newWindowRef.current = window.open();
  };
  const destroyWindow = () => {
    if (!newWindowRef.current) {
      return;
    }
    newWindowRef.current.close();
  };
  const { modalContextHolder, createProject } = useCreateProjectModal({
    bizCreateFrom: 'navi',
    selectSpace: true,
    onCreateBotSuccess: (botId, targetSpaceId) => {
      let url = `/space/${targetSpaceId}/bot/${botId}`;
      if (autoCreate) {
        url += urlSearch;
      }
      if (botId && newWindowRef.current) {
        newWindowRef.current.location = url;
      } else {
        destroyWindow();
      }
    },
    onBeforeCreateBot: () => {
      sendTeaEvent(EVENT_NAMES.create_bot_click, {
        source: 'menu_bar',
      });
      openWindow();
    },
    onCreateBotError: () => {
      destroyWindow();
    },
    onBeforeCreateProject: () => {
      openWindow();
    },
    onCreateProjectError: () => {
      destroyWindow();
    },
    onBeforeCopyProjectTemplate: ({ toSpaceId }) => {
      if (toSpaceId !== currentSpaceId) {
        openWindow();
      }
    },
    onProjectTemplateCopyError: () => {
      destroyWindow();
    },
    onCreateProjectSuccess: ({ projectId, spaceId }) => {
      const baseUrl = `/space/${spaceId}/project-ide/${projectId}`;

      if (!newWindowRef.current) {
        return;
      }
      if (autoCreate) {
        newWindowRef.current.location = baseUrl + urlSearch;
      }
      newWindowRef.current.location = baseUrl;
    },
    onCopyProjectTemplateSuccess: param => {
      cozeMitt.emit('createProjectByCopyTemplateFromSidebar', param);
      if (newWindowRef.current) {
        newWindowRef.current.location = `/space/${param.toSpaceId}/develop`;
      }
    },
  });

  useEffect(() => {
    if (autoCreate) {
      createProject();
    }
  }, [autoCreate]);

  return {
    createBot: createProject,
    createBotModal: modalContextHolder,
  };
};
