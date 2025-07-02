export {
  useDeleteIntelligence,
  type ProjectFormValues,
  type UpdateProjectSuccessCallbackParam,
  type CreateProjectHookProps,
  type CopyProjectSuccessCallbackParam,
  type ModifyUploadValueType,
  type RequireCopyProjectRequest,
  type DeleteIntelligenceParam,
} from '@coze-studio/project-entity-base';
import { type ReactNode } from 'react';

import { type DraftProjectCopyRequest } from '@coze-arch/idl/intelligence_api';
import {
  useCreateProjectModalBase,
  useUpdateProjectModalBase,
  useCopyProjectModalBase,
  type ProjectFormValues,
  type UpdateProjectSuccessCallbackParam,
  type CreateProjectHookProps,
  type CopyProjectSuccessCallbackParam,
  type ModifyUploadValueType,
  type RequireCopyProjectRequest,
} from '@coze-studio/project-entity-base';

export const useCreateProjectModal = (
  params: CreateProjectHookProps,
): {
  modalContextHolder: ReactNode;
  createProject: () => void;
} => useCreateProjectModalBase(params);

export const useUpdateProjectModal = (params: {
  onSuccess?: (param: UpdateProjectSuccessCallbackParam) => void;
}): {
  modalContextHolder: ReactNode;
  openModal: (params: { initialValue: ProjectFormValues }) => void;
} => useUpdateProjectModalBase(params);

export const useCopyProjectModal = (params: {
  onSuccess?: (param: CopyProjectSuccessCallbackParam) => void;
}): {
  modalContextHolder: ReactNode;
  openModal: (param: {
    initialValue: ModifyUploadValueType<
      RequireCopyProjectRequest<DraftProjectCopyRequest>
    >;
  }) => void;
} => useCopyProjectModalBase(params);
