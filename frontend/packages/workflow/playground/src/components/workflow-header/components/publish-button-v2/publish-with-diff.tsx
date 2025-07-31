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

import { useRef } from 'react';

import { useMemoizedFn } from 'ahooks';
import {
  OperateType,
  type PublishWorkflowRequest,
} from '@coze-arch/bot-api/workflow_api';

import { useGlobalState } from '@/hooks';

import { usePublishReferenceConfirm, useDiffConfirm } from '../../hooks';
import { PublishWithVersionV2 } from './publish-with-version-v2';
import { PublishWithVersion } from './publish-with-version';

interface PublishWithDiffProps {
  disabled?: boolean;
  className?: string;
  step: string;
  setStep: (v: string) => void;
  onPublish: (obj?: Partial<PublishWorkflowRequest>) => Promise<boolean>;
}

export const PublishWithDiff: React.FC<PublishWithDiffProps> = ({
  onPublish,
  ...props
}) => {
  const { setStep } = props;
  const { isCollaboratorMode, isInIDE } = useGlobalState();
  const { publishUpdateReferencedConfirm } = usePublishReferenceConfirm();
  // Cache the data that needs to be given to the publishing interface and use it after the user confirms the diff. Because the design of the diff pop-up window is not scalable, it will be handled like this for the time being.
  const publishDataRef = useRef<Partial<PublishWorkflowRequest>>({});

  const useNewGlobalVariableCache = !isInIDE;

  const passPublish = useMemoizedFn(async () => {
    const res = await onPublish(publishDataRef.current);
    publishDataRef.current = {};
    return res;
  });

  const { diffConfirm, modal: diffConfirmModal } = useDiffConfirm({
    submitHandle: passPublish,
    operateType: OperateType.PublishOperate,
  });

  const handlePublish = async (obj?: Partial<PublishWorkflowRequest>) => {
    setStep('diff');
    publishDataRef.current = obj || {};
    if (isCollaboratorMode) {
      await diffConfirm();
    } else {
      if (await publishUpdateReferencedConfirm()) {
        await onPublish(obj);
      }
    }
    publishDataRef.current = {};
  };

  return (
    <>
      {useNewGlobalVariableCache ? (
        <PublishWithVersionV2 onPublish={handlePublish} {...props} />
      ) : (
        <PublishWithVersion onPublish={handlePublish} {...props} />
      )}
      {diffConfirmModal}
    </>
  );
};
