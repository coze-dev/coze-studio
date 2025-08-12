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

import { useEffect, type RefObject } from 'react';

import { useBotEditor } from '@coze-agent-ide/bot-editor-context-store';

import { useBotEditorService } from '../context/bot-editor-service';

export const useFreeDragModalHierarchy = ({
  key,
  ref,
}: {
  key: string;
  ref: RefObject<HTMLDivElement>;
}) => {
  const { freeGrabModalHierarchyService } = useBotEditorService();
  const {
    storeSet: { useFreeGrabModalHierarchyStore },
  } = useBotEditor();

  const zIndex = useFreeGrabModalHierarchyStore(state =>
    freeGrabModalHierarchyService.getModalZIndex(state.getModalIndex(key)),
  );

  useEffect(() => {
    freeGrabModalHierarchyService.registerModal(key);
    const target = ref.current;
    if (!target) {
      return;
    }
    const onFocus = () => {
      freeGrabModalHierarchyService.onFocus(key);
    };

    target.addEventListener('focus', onFocus);

    return () => {
      freeGrabModalHierarchyService.removeModal(key);
      target.removeEventListener('focus', onFocus);
    };
  }, [key]);

  return zIndex;
};
