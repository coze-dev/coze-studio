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

import { useState } from 'react';

import { useRequest } from 'ahooks';
import { appendCopySuffix } from '@coze-studio/components';
import {
  type IntelligenceBasicInfo,
  type User,
} from '@coze-arch/idl/intelligence_api';
import { I18n } from '@coze-arch/i18n';
import { intelligenceApi } from '@coze-arch/bot-api';
import { type RenderAutoGenerateParams } from '@coze-common/biz-components/picture-upload';
import { botInputLengthService } from '@coze-agent-ide/bot-input-length-limit';

import { commonProjectFormValid } from '../utils/common-project-form-valid';
import { ProjectFormModal } from '../components/project-form-modal';
import { type ProjectFormValues } from '../components/project-form';

export interface CopyProjectSuccessCallbackParam {
  basicInfo: IntelligenceBasicInfo;
  templateId: string;
  ownerInfo?: User;
}

export interface UpdateProjectSuccessCallbackParam {
  projectId: string;
  spaceId: string;
}

type UseBaseUpdateOrCopyProjectModalProps = {
  renderAutoGenerate?: (params: RenderAutoGenerateParams) => React.ReactNode;
} & (
  | {
      scene: 'update';
      onSuccess?: (params: UpdateProjectSuccessCallbackParam) => void;
    }
  | {
      scene: 'copy';
      onSuccess?: (param: CopyProjectSuccessCallbackParam) => void;
    }
);

export const useBaseUpdateOrCopyProjectModal = ({
  scene,
  onSuccess: inputOnSuccess,
  renderAutoGenerate,
}: UseBaseUpdateOrCopyProjectModalProps) => {
  const [projectModalVisible, setProjectModalVisible] = useState(false);
  const [initialValues, setInitialValues] = useState<ProjectFormValues>();

  const onModalClose = () => {
    setInitialValues(undefined);
    setProjectModalVisible(false);
  };

  const onUpdateOk = (param: UpdateProjectSuccessCallbackParam) => {
    onModalClose();
    if (scene !== 'update') {
      throw new Error('update project error scene');
    }
    inputOnSuccess?.(param);
  };

  const onCopyOK = (param: CopyProjectSuccessCallbackParam) => {
    onModalClose();
    if (scene !== 'copy') {
      throw new Error('copy project error scene');
    }
    inputOnSuccess?.(param);
  };

  const onCancel = () => {
    onModalClose();
  };

  const sharedProps = {
    formProps: {
      initValues: initialValues,
    },
    visible: projectModalVisible,
    onCancel,
    maskClosable: false,
  };

  const { runAsync: updateProjectRequest } = useRequest(
    async (param: ProjectFormValues) => {
      const { icon_uri: uriList, description = '', ...restValues } = param;
      const requestFormValues = {
        ...restValues,
        icon_uri: uriList?.at(0)?.uid,
        description,
      };
      const response = await intelligenceApi.DraftProjectUpdate(
        requestFormValues,
      );
      const { audit_data } = response.data ?? {};
      return {
        ...audit_data,
      };
    },
    {
      manual: true,
      onSuccess: (data, [inputParam]) => {
        if (data.check_not_pass) {
          return;
        }
        onUpdateOk({
          projectId: inputParam.project_id,
          spaceId: inputParam.space_id ?? '',
        });
      },
    },
  );

  const { runAsync: copyProjectRequest } = useRequest(
    async (param: ProjectFormValues) => {
      const { icon_uri: uriList, ...restValues } = param;
      const requestFormValues = {
        ...restValues,
        icon_uri: uriList?.at(0)?.uid,
      };
      const response = await intelligenceApi.DraftProjectCopy(
        requestFormValues,
      );
      const { audit_data, basic_info, user_info } = response.data ?? {};
      return {
        ...audit_data,
        basic_info,
        user_info,
      };
    },
    {
      manual: true,
      onSuccess: (data, [inputParam]) => {
        if (!data.basic_info) {
          return;
        }
        if (data.check_not_pass) {
          return;
        }
        onCopyOK({
          templateId: inputParam.project_id,
          basicInfo: data.basic_info,
          ownerInfo: data.user_info,
        });
      },
    },
  );

  const getModalTitle = () => {
    if (scene === 'copy') {
      return I18n.t('project_ide_create_duplicate');
    }
    if (scene === 'update') {
      return I18n.t('project_ide_edit_project');
    }
  };

  return {
    modalContextHolder: projectModalVisible ? (
      <ProjectFormModal
        {...sharedProps}
        isFormValid={commonProjectFormValid}
        title={getModalTitle()}
        request={scene === 'update' ? updateProjectRequest : copyProjectRequest}
        renderAutoGenerate={renderAutoGenerate}
      />
    ) : null,
    openModal: ({ initialValue }: { initialValue: ProjectFormValues }) => {
      setProjectModalVisible(true);
      if (scene === 'update') {
        setInitialValues(initialValue);
        return;
      }
      if (scene === 'copy') {
        setInitialValues({
          ...initialValue,
          name: botInputLengthService.sliceStringByMaxLength({
            value: appendCopySuffix(initialValue.name ?? ''),
            field: 'projectName',
          }),
        });
      }
    },
  };
};
