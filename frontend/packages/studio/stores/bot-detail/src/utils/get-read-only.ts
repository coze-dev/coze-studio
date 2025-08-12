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

import { usePageRuntimeStore } from '../store/page-runtime';
import { useCollaborationStore, EditLockStatus } from '../store/collaboration';

/**
 * Non-responsive; reference useBotDetailIsReadonly method
 */
export function getBotDetailIsReadonly() {
  const pageRuntime = usePageRuntimeStore.getState();
  const collaboration = useCollaborationStore.getState();
  return getBotDetailIsReadonlyByState({
    editable: pageRuntime.editable,
    isPreview: pageRuntime.isPreview,
    editLockStatus: collaboration.editLockStatus,
  });
}

export const getBotDetailIsReadonlyByState = ({
  editable,
  isPreview,
  editLockStatus,
}: {
  editable: boolean;
  isPreview: boolean;
  editLockStatus?: EditLockStatus;
}) => !editable || isPreview || editLockStatus === EditLockStatus.Lose;
