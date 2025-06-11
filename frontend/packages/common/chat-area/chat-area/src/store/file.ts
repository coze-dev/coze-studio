import { devtools } from 'zustand/middleware';
import { create } from 'zustand';
import { produce } from 'immer';
import { type SendFileMessagePayload } from '@coze-common/chat-uikit-shared';

export interface FileState {
  /**
   * 临时存储文件的
   * key: local_message_id
   */
  temporaryFile: Record<string, SendFileMessagePayload | null>;
  previewURL: string;
  audioFileMap: Record<string, File>;
  audioProcessMap: Record<string, 'processing'>;
}

export interface FileAction {
  /**
   * 更新临时存储的文件
   */
  updateTemporaryFile: (
    localMessageId: string,
    payload: SendFileMessagePayload,
  ) => void;
  /**
   * 删除临时存储的文件（通过localMessageId）
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
