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
