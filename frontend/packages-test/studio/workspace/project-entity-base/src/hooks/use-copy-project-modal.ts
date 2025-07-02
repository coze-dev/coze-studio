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
