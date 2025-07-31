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

import { vi } from 'vitest';
import { noop } from 'lodash-es';

vi.mock('@byted-sami/speech-sdk', () => ({
  ServerEventName: '',
  ClientEventName: '',
  EventType: '',
  TTSPlayer: vi.fn(() => ({
    playerAudioClient: {
      onAudioData(_: unknown) {
        noop();
      },
    },
  })),
  PlayerAudioClient: vi.fn(() => {
    noop();
  }),
  AssistantSpeechClient: vi.fn(() => {
    noop();
  }),
  RecorderAudioClient: vi.fn(() => {
    noop();
  }),
}));

vi.stubGlobal('AudioWorkletNode', vi.fn());
vi.stubGlobal('AudioContext', vi.fn());
vi.stubGlobal('RecorderAudioClient', vi.fn());
vi.stubGlobal('SAMI_WS_ORIGIN', vi.fn());
vi.stubGlobal('SAMI_CHAT_WS_URL', vi.fn());
vi.stubGlobal('SAMI_APP_KEY', vi.fn());
vi.stubGlobal('IS_DEV_MODE', false);
vi.stubGlobal('REGION', 'cn');
vi.stubGlobal('IS_RELEASE_VERSION', false);
vi.stubGlobal('IS_OVERSEA', true);
vi.stubGlobal('IS_CN_REGION', true);
