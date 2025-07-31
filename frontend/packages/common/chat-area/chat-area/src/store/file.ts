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

import { devtools } from 'zustand/middleware';
import { create } from 'zustand';
import { produce } from 'immer';
import { type SendFileMessagePayload } from '@coze-common/chat-uikit-shared';

export interface FileState {
  /**
   * Temporary storage of files
   * key: local_message_id
   */
  temporaryFile: Record<string, SendFileMessagePayload | null>;
  previewURL: string;
  audioFileMap: Record<string, File>;
  audioProcessMap: Record<string, 'processing'>;
}

export interface FileAction {
  /**
   * Update temporarily stored files
   */
  updateTemporaryFile: (
    localMessageId: string,
    payload: SendFileMessagePayload,
  ) => void;
  /**
   * Delete temporarily stored files (via localMessageId)
   * @param localMessageId
   * @returns
   */
  deleteTemporaryFile: (localMessageId: string) => void;
  updatePreviewURL: (url: string) => void;
  addAudioFile: (params: { localMessageId: string; audioFile: File }) => void;
  getAudioFileByLocalId: (localMessageId: string) => File | undefined;
  getAudioProcessStateByLocalId: (
    localMessageId: string,
  ) => 'processing' | undefined;
  removeAudioFileByLocalId: (localMessageId: string) => void;
  updateAudioProcessState: (params: {
    localMessageId: string;
    state: 'processing' | 'finish';
  }) => void;
  clearAudioStore: () => void;
  clear: () => void;
}

const getDefaultState = (): FileState => ({
  temporaryFile: {},
  previewURL: '',
  audioFileMap: {},
  audioProcessMap: {},
});

export const createFileStore = (mark: string) =>
  create<FileState & FileAction>()(
    devtools(
      (set, get) => ({
        ...getDefaultState(),
        addAudioFile: ({ localMessageId, audioFile }) => {
          set(
            produce<FileState>(draft => {
              draft.audioFileMap[localMessageId] = audioFile;
            }),
            false,
            'addAudioFile',
          );
        },
        getAudioFileByLocalId: id => get().audioFileMap[id],
        getAudioProcessStateByLocalId: id => get().audioProcessMap[id],
        clearAudioStore: () => {
          set(getDefaultState(), false, 'clearAudioStore');
        },
        updateTemporaryFile: (localMessageId, payload) => {
          set(
            produce<FileState>(state => {
              state.temporaryFile[localMessageId] = payload;
            }),
            false,
            'updateTemporaryFile',
          );
        },
        deleteTemporaryFile: localMessageId => {
          set(
            produce<FileState>(state => {
              state.temporaryFile[localMessageId] = null;
            }),
            false,
            'deleteTemporaryFile',
          );
        },
        removeAudioFileByLocalId: localMessageId => {
          set(
            produce<FileState>(draft => {
              if (!draft.audioFileMap[localMessageId]) {
                return;
              }

              delete draft.audioFileMap[localMessageId];
            }),
            false,
            'removeAudioFileByLocalId',
          );
        },
        updateAudioProcessState: ({ localMessageId, state }) => {
          set(
            produce<FileState>(draft => {
              if (state === 'processing') {
                draft.audioProcessMap[localMessageId] = state;
                return;
              }
              if (
                state === 'finish' &&
                draft.audioProcessMap[localMessageId] === 'processing'
              ) {
                delete draft.audioProcessMap[localMessageId];
              }
            }),
            false,
            'updateAudioProcessState',
          );
        },
        updatePreviewURL: url => {
          set(
            {
              previewURL: url,
            },
            false,
            'updatePreviewURL',
          );
        },
        clear: () => set(getDefaultState(), false, 'clear'),
      }),
      {
        name: `botStudio.ChatAreaFileStore.${mark}`,
        enabled: IS_DEV_MODE,
      },
    ),
  );

export type FileStore = ReturnType<typeof createFileStore>;
