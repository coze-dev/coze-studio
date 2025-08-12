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

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cloneDeep } from 'lodash-es';

import { useBotSkillStore } from '../../../src/store/bot-skill';
import {
  saveFetcher,
  updateBotRequest,
} from '../../../src/save-manager/utils/save-fetcher';
import { ItemTypeExtra } from '../../../src/save-manager/types';
import { saveTTSConfig } from '../../../src/save-manager/manual-save/tts';

// simulated dependency
vi.mock('lodash-es', () => ({
  cloneDeep: vi.fn(obj => JSON.parse(JSON.stringify(obj))),
  merge: vi.fn((target, ...sources) => Object.assign({}, target, ...sources)),
}));

vi.mock('../../../src/store/bot-skill', () => ({
  useBotSkillStore: {
    getState: vi.fn(),
  },
}));

vi.mock('../../../src/save-manager/utils/save-fetcher', () => ({
  saveFetcher: vi.fn(),
  updateBotRequest: vi.fn(),
}));

describe('tts save manager', () => {
  const mockTTS = {
    muted: false,
    close_voice_call: true,
    i18n_lang_voice: { en: 'en-voice', zh: 'zh-voice' },
    autoplay: true,
    autoplay_voice: { default: 'default-voice' },
    i18n_lang_voice_str: { en: 'en-voice', zh: 'zh-voice' },
  };

  const mockVoicesInfo = {
    voices: [{ id: 'voice-1', name: 'Voice 1' }],
  };

  const mockTransformVo2Dto = {
    tts: vi.fn(tts => ({
      muted: tts.muted,
      close_voice_call: tts.close_voice_call,
      i18n_lang_voice: tts.i18n_lang_voice,
      autoplay: tts.autoplay,
      autoplay_voice: tts.autoplay_voice,
      i18n_lang_voice_str: tts.i18n_lang_voice_str,
    })),
    voicesInfo: vi.fn(voicesInfo => ({
      voices: voicesInfo.voices,
    })),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Set default state
    (useBotSkillStore.getState as any).mockReturnValue({
      tts: mockTTS,
      voicesInfo: mockVoicesInfo,
      transformVo2Dto: mockTransformVo2Dto,
    });

    (updateBotRequest as any).mockResolvedValue({
      data: { success: true },
    });

    (saveFetcher as any).mockImplementation(async (fn, itemType) => {
      await fn();
      return { success: true };
    });
  });

  it('应该正确保存 TTS 配置', async () => {
    await saveTTSConfig();

    // Verify that transformVo2To.tts is called
    expect(mockTransformVo2Dto.tts).toHaveBeenCalledTimes(1);

    // Verify that the parameter passed to transformVo2To.tts is a clone of tts
    const ttsArg = mockTransformVo2Dto.tts.mock.calls[0][0];
    expect(ttsArg).toEqual(mockTTS);
    expect(ttsArg).not.toBe(mockTTS); // Make sure it's a clone and not the original object

    // Verify that cloneDeep is called
    expect(cloneDeep).toHaveBeenCalledTimes(3);

    // Verify that transformVo2To.voicesInfo is called
    expect(mockTransformVo2Dto.voicesInfo).toHaveBeenCalledWith(mockVoicesInfo);

    // Verify that updateBotRequest was called and the parameters are correct
    expect(updateBotRequest).toHaveBeenCalledWith({
      voices_info: {
        muted: mockTTS.muted,
        close_voice_call: mockTTS.close_voice_call,
        i18n_lang_voice: mockTTS.i18n_lang_voice,
        autoplay: mockTTS.autoplay,
        autoplay_voice: mockTTS.autoplay_voice,
        voices: mockVoicesInfo.voices,
        i18n_lang_voice_str: mockTTS.i18n_lang_voice_str,
      },
    });

    // Verify that saveFetcher is called and the parameters are correct
    expect(saveFetcher).toHaveBeenCalledWith(
      expect.any(Function),
      ItemTypeExtra.TTS,
    );
  });

  it('应该处理 saveFetcher 抛出的错误', async () => {
    const mockError = new Error('Save failed');
    (saveFetcher as any).mockRejectedValue(mockError);

    await expect(saveTTSConfig()).rejects.toThrow(mockError);
  });
});
