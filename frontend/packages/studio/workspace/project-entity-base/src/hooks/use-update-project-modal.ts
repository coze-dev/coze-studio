import { type ReactNode } from 'react';

import { type DraftProjectUpdateRequest } from '@coze-arch/idl/intelligence_api';
import { type RenderAutoGenerateParams } from '@coze-common/biz-components/picture-upload';

import { type ModifyUploadValueType } from '../type';
import {
  type UpdateProjectSuccessCallbackParam,
  useBaseUpdateOrCopyProjectModal,
} from './use-base-update-or-copy-project-modal';

export const useUpdateProjectModalBase = ({
  onSuccess,
  renderAutoGenerate,
}: {
  onSuccess?: (param: UpdateProjectSuccessCallbackParam) => void;
  renderAutoGenerate?: (params: RenderAutoGenerateParams) => React.ReactNode;
}): {
  modalContextHolder: ReactNode;
  openModal: (param: {
    initialValue: ModifyUploadValueType<DraftProjectUpdateRequest>;
  }) => void;
} =>
  useBaseUpdateOrCopyProjectModal({
    scene: 'update',
    onSuccess,
    renderAutoGenerate,
  });
