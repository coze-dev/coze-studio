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
  // 创建 bot 功能
  const newWindowRef = useRef<Window | null>(null);
  // const newWindowRef = use
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
