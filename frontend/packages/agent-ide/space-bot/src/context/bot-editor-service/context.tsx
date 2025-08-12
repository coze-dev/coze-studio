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

import { type PropsWithChildren, createContext } from 'react';

import { useCreation } from 'ahooks';
import { sendTeaEvent } from '@coze-arch/bot-tea';
import { useBotEditor } from '@coze-agent-ide/bot-editor-context-store';

import { EditorSharedApplyRecordService } from '../../service/shared-apply-record-service';
import { NLPromptModalVisibilityService } from '../../service/nl-prompt-modal-visibility-service';
import { FreeGrabModalHierarchyService } from '../../service/free-grab-modal-hierarchy-service';
import { type BotEditorServiceContextProps } from './type';

export const BotEditorServiceContext =
  createContext<BotEditorServiceContextProps | null>(null);

export const BotEditorServiceProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const {
    storeSet: { useNLPromptModalStore, useFreeGrabModalHierarchyStore },
  } = useBotEditor();

  const nLPromptModalVisibilityService = useCreation(() => {
    const { setVisible, updatePosition } = useNLPromptModalStore.getState();
    return new NLPromptModalVisibilityService({
      setVisible,
      updateModalPosition: updatePosition,
      getIsVisible: () => useNLPromptModalStore.getState().visible,
      sendTeaEvent,
    });
  }, []);

  const freeGrabModalHierarchyService = useCreation(() => {
    const { setModalToTopLayer, getModalIndex, registerModal, removeModal } =
      useFreeGrabModalHierarchyStore.getState();
    return new FreeGrabModalHierarchyService({
      registerModal,
      removeModal,
      setModalToTopLayer,
      getModalIndex,
    });
  }, []);

  const editorSharedApplyRecordService = useCreation(
    () => new EditorSharedApplyRecordService(),
    [],
  );

  return (
    <BotEditorServiceContext.Provider
      value={{
        nLPromptModalVisibilityService,
        freeGrabModalHierarchyService,
        editorSharedApplyRecordService,
      }}
    >
      {children}
    </BotEditorServiceContext.Provider>
  );
};
