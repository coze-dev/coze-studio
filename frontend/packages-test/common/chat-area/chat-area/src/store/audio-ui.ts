import { devtools } from 'zustand/middleware';
import { create } from 'zustand';

export type RecordingInteractionType = 'keyboard' | 'clickOrTouch' | null;

export interface AudioUIState {
  isRecording: boolean;
  isPointerMoveOut: boolean;
  audioLeftTime: number | null;
  recordingInteractionType: RecordingInteractionType;
}

export interface AudioUIAction {
  setIsRecording: (isRecording: boolean) => void;
  setIsPointerMoveOut: (isPointerMoveOut: boolean) => void;
  setAudioLeftTime: (time: number) => void;
  clearAudioLeftTime: () => void;
  setRecordingInteractionType: (
    interactionType: RecordingInteractionType,
  ) => void;
  clear: () => void;
}

const getDefaultState = (): AudioUIState => ({
  isRecording: false,
  isPointerMoveOut: false,
  audioLeftTime: null,
  recordingInteractionType: null,
});

export const createAudioUIStore = (mark: string) =>
  create<AudioUIState & AudioUIAction>()(
    devtools(
      set => ({
        ...getDefaultState(),
        setIsRecording: isRecording => {
          set({ isRecording }, false, 'setIsRecording');
        },
        setIsPointerMoveOut: isPointerMoveOut => {
          set({ isPointerMoveOut }, false, 'setIsPointerMoveOut');
        },
        setAudioLeftTime: audioLeftTime => {
          set({ audioLeftTime }, false, 'setAudioLeftTime');
        },
        clearAudioLeftTime: () => {
          set({ audioLeftTime: null }, false, 'clearAudioLeftTime');
        },
        setRecordingInteractionType: recordingInteractionType => {
          set(
            { recordingInteractionType },
            false,
            'setRecordingInteractionType',
          );
        },
        clear: () => set(getDefaultState(), false, 'clear'),
      }),
      {
        name: `botStudio.ChatAreaAudioUIStore.${mark}`,
        enabled: IS_DEV_MODE,
      },
    ),
  );

export type AudioUIStore = ReturnType<typeof createAudioUIStore>;
