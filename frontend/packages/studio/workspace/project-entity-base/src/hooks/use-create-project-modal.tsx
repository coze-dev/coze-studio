import { useState } from 'react';

import { useRequest } from 'ahooks';
import { type DraftProjectCreateRequest } from '@coze-arch/idl/intelligence_api';
import { I18n } from '@coze-arch/i18n';
import { intelligenceApi } from '@coze-arch/bot-api';
import { type RenderAutoGenerateParams } from '@coze-common/biz-components/picture-upload';
import { useCreateAgent } from '@coze-studio/entity-adapter';

import { commonProjectFormValid } from '../utils/common-project-form-valid';
import { ProjectTemplateModal } from '../components/project-template-modal';
import {
  type BizProjectFormModalProps,
  ProjectFormModal,
} from '../components/project-form-modal';
import { type ProjectFormValues } from '../components/project-form';
import {
  type CreateType,
  GuideModal,
  type GuideModalProps,
} from '../components/guide-modal';
import {
  type BeforeProjectTemplateCopyCallback,
  type ProjectTemplateCopySuccessCallback,
} from './use-project-template-copy-modal';

type CreateBotParam = Parameters<typeof useCreateAgent>[0];
export interface CreateProjectSuccessCallbackParam {
  projectId: string;
  spaceId: string;
}
export interface CreateProjectHookProps
  extends Pick<BizProjectFormModalProps, 'selectSpace'> {
  onBeforeCreateBot?: CreateBotParam['onBefore'];
  onCreateBotSuccess?: CreateBotParam['onSuccess'];
  onCreateBotError?: CreateBotParam['onError'];
  initialSpaceId?: string;
  onBeforeCreateProject?: () => void;
  onCreateProjectError?: () => void;
  onCreateProjectSuccess?: (param: CreateProjectSuccessCallbackParam) => void;
  onCopyProjectTemplateSuccess?: ProjectTemplateCopySuccessCallback;
  onBeforeCopyProjectTemplate?: BeforeProjectTemplateCopyCallback;
  onProjectTemplateCopyError?: () => void;
  /**
   * navi 导航栏
   * space workspace 右上角的按钮
   * */
  bizCreateFrom: 'navi' | 'space';
  renderAutoGenerate?: (params: RenderAutoGenerateParams) => React.ReactNode;
  extraGuideButtonConfigs?: GuideModalProps['extraButtonConfigs'];
}

// eslint-disable-next-line @coze-arch/max-line-per-function
export const useCreateProjectModalBase = ({
  selectSpace,
  onBeforeCreateBot,
  onCreateBotError,
  onCreateBotSuccess,
  initialSpaceId,
  onCreateProjectSuccess,
  onCopyProjectTemplateSuccess,
  onBeforeCreateProject,
  onCreateProjectError,
  onBeforeCopyProjectTemplate,
  onProjectTemplateCopyError,
  bizCreateFrom,
  renderAutoGenerate,
  extraGuideButtonConfigs,
}: CreateProjectHookProps) => {
  const [guideModalVisible, setGuideModalVisible] = useState(false);
  const [projectModalVisible, setProjectModalVisible] = useState(false);
  const [projectTemplateModalVisible, setProjectTemplateModalVisible] =
    useState(false);
  const { modal, startEdit } = useCreateAgent({
    showSpace: selectSpace,
    onBefore: onBeforeCreateBot,
    onError: onCreateBotError,
    onSuccess: onCreateBotSuccess,
    spaceId: initialSpaceId,
    bizCreateFrom,
  });

  const onGuideChange = (guideType: CreateType) => {
    setGuideModalVisible(false);

    if (guideType === 'project') {
      if (IS_OVERSEA) {
        setProjectModalVisible(true);
        return;
      }
      setProjectTemplateModalVisible(true);
      return;
    }
    if (guideType === 'agent') {
      startEdit();
      return;
    }
  };

  const onCreateEmptyProject = () => {
    setProjectModalVisible(true);
    setProjectTemplateModalVisible(false);
  };

  const onGuideCancel = () => {
    setGuideModalVisible(false);
  };

  const projectTemplateCancel = () => {
    setProjectTemplateModalVisible(false);
  };

  const onCopyProjectTemplateOk: ProjectTemplateCopySuccessCallback =
    params => {
      setProjectTemplateModalVisible(false);
      onCopyProjectTemplateSuccess?.(params);
    };

  const onCreateProjectOk = (param: CreateProjectSuccessCallbackParam) => {
    setProjectModalVisible(false);
    onCreateProjectSuccess?.(param);
  };

  const onCreateProjectCancel = () => {
    setProjectModalVisible(false);
  };

  const { runAsync: createProjectRequest } = useRequest(
    async (param: ProjectFormValues) => {
      const { icon_uri: uriList, enableMonetize, ...restValues } = param;
      const requestFormValues: DraftProjectCreateRequest = {
        ...restValues,
        icon_uri: uriList?.at(0)?.uid,
        ...(IS_OVERSEA && {
          monetization_conf: {
            is_enable: enableMonetize ?? true,
          },
        }),
        create_from: bizCreateFrom,
      };
      const response =
        await intelligenceApi.DraftProjectCreate(requestFormValues);
      const { project_id, audit_data } = response.data ?? {};
      return {
        ...audit_data,
        project_id: project_id ?? '',
      };
    },
    {
      manual: true,
      onBefore: onBeforeCreateProject,
      onError: onCreateProjectError,
      onSuccess: (data, [inputParam]) => {
        if (data.check_not_pass) {
          return;
        }
        onCreateProjectOk({
          projectId: data.project_id,
          spaceId: inputParam.space_id ?? '',
        });
      },
    },
  );

  return {
    modalContextHolder: (
      <>
        {modal}
        <ProjectTemplateModal
          maskClosable={false}
          onCreateProject={onCreateEmptyProject}
          onBeforeCopy={onBeforeCopyProjectTemplate}
          onCopyError={onProjectTemplateCopyError}
          onCopyOk={onCopyProjectTemplateOk}
          isSelectSpaceOnCopy={Boolean(selectSpace)}
          spaceId={initialSpaceId}
          visible={projectTemplateModalVisible}
          onCancel={projectTemplateCancel}
        />
        {guideModalVisible ? (
          <GuideModal
            visible={guideModalVisible}
            onChange={onGuideChange}
            onCancel={onGuideCancel}
            extraButtonConfigs={extraGuideButtonConfigs}
          />
        ) : null}
        {projectModalVisible ? (
          <ProjectFormModal
            showMonetizeConfig={IS_OVERSEA}
            isFormValid={values =>
              commonProjectFormValid(values) && Boolean(values.space_id)
            }
            maskClosable={false}
            title={I18n.t('creat_project_title')}
            formProps={{
              initValues: {
                space_id: initialSpaceId,
                project_id: '',
              },
            }}
            request={createProjectRequest}
            selectSpace={selectSpace}
            visible={projectModalVisible}
            onCancel={onCreateProjectCancel}
            renderAutoGenerate={renderAutoGenerate}
          />
        ) : null}
      </>
    ),
    createProject: () => {
      setGuideModalVisible(true);
    },
  };
};
