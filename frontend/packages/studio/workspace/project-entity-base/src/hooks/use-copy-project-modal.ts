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

import { type ReactNode } from 'react';

import { type DraftProjectCopyRequest } from '@coze-arch/idl/intelligence_api';
import { type RenderAutoGenerateParams } from '@coze-common/biz-components/picture-upload';

import {
  type ModifyUploadValueType,
  type RequireCopyProjectRequest,
} from '../type';
import {
  type CopyProjectSuccessCallbackParam,
  useBaseUpdateOrCopyProjectModal,
} from './use-base-update-or-copy-project-modal';

export const useCopyProjectModalBase = ({
  onSuccess,
  renderAutoGenerate,
}: {
  onSuccess?: (param: CopyProjectSuccessCallbackParam) => void;
  renderAutoGenerate?: (params: RenderAutoGenerateParams) => React.ReactNode;
}): {
  modalContextHolder: ReactNode;
  openModal: (param: {
    initialValue: ModifyUploadValueType<
      RequireCopyProjectRequest<DraftProjectCopyRequest>
    >;
  }) => void;
} =>
  useBaseUpdateOrCopyProjectModal({
    scene: 'copy',
    onSuccess,
    renderAutoGenerate,
  });
