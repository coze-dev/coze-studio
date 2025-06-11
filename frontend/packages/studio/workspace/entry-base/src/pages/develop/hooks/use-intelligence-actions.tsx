import { useNavigate } from 'react-router-dom';
import { type SetStateAction, type Dispatch, type ReactNode } from 'react';

import { I18n } from '@coze-arch/i18n';
import {
  type DeleteIntelligenceParam,
  useCreateProjectModal,
  useDeleteIntelligence,
  type CreateProjectHookProps,
} from '@coze-studio/project-entity-adapter';
import { cozeMitt } from '@coze-common/coze-mitt';
import { Toast } from '@coze/coze-design';

import { type DraftIntelligenceList } from '../type';

const showCreateSuccessToast = () => {
  Toast.success({
    content: I18n.t('creat_project_toast_success'),
    showClose: false,
  });
};

export const useIntelligenceActions = ({
  spaceId,
  mutateList,
  reloadList,
  extraGuideButtonConfigs,
}: {
  spaceId: string;
  reloadList: () => void;
  mutateList: Dispatch<SetStateAction<DraftIntelligenceList | undefined>>;
  extraGuideButtonConfigs?: CreateProjectHookProps['extraGuideButtonConfigs'];
}): {
  contextHolder: ReactNode;
  actions: {
    createIntelligence: () => void;
    deleteIntelligence: (param: DeleteIntelligenceParam) => void;
  };
} => {
  const navigate = useNavigate();

  const navigateToProjectIDE = (inputProjectId: string) =>
    navigate(`/space/${spaceId}/project-ide/${inputProjectId}`);

  const {
    modalContextHolder: createModalContextHolder,
    createProject: createIntelligence,
  } = useCreateProjectModal({
    selectSpace: false,
    bizCreateFrom: 'space',
    initialSpaceId: spaceId,
    extraGuideButtonConfigs,
    onCreateBotSuccess: botId => {
      if (botId) {
        navigate(`/space/${spaceId}/bot/${botId}`);
      }
    },
    onCreateProjectSuccess: ({ projectId }) => {
      showCreateSuccessToast();
      navigateToProjectIDE(projectId);
    },
    onCopyProjectTemplateSuccess: () => {
      reloadList();
    },
  });

  const handleDeleteIntelligenceAndMutate = (mutateDeleteId: string) => {
    Toast.success({
      content: I18n.t('project_ide_toast_delete_success'),
      showClose: false,
    });
    cozeMitt.emit('refreshFavList', { id: mutateDeleteId, numDelta: -1 });
    mutateList(prev =>
      prev
        ? {
            ...prev,
            list: prev.list.filter(
              item => item.basic_info?.id !== mutateDeleteId,
            ),
          }
        : undefined,
    );
  };

  const { modalContextHolder: deleteModalContextHolder, deleteIntelligence } =
    useDeleteIntelligence({
      onDeleteAgentSuccess: agentParam => {
        handleDeleteIntelligenceAndMutate(agentParam.agentId);
      },
      onDeleteProjectSuccess: projectParam => {
        handleDeleteIntelligenceAndMutate(projectParam.projectId);
      },
    });

  return {
    contextHolder: (
      <>
        {createModalContextHolder}
        {deleteModalContextHolder}
      </>
    ),
    actions: {
      createIntelligence,
      deleteIntelligence,
    },
  };
};
