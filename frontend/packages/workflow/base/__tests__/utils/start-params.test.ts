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

import { describe, it, expect } from 'vitest';

import {
  isPresetStartParams,
  isUserInputStartParams,
} from '../../src/utils/start-params';
import {
  BOT_USER_INPUT,
  USER_INPUT,
  CONVERSATION_NAME,
} from '../../src/constants';

describe('start-params', () => {
  describe('isPresetStartParams', () => {
    it('应该正确识别预设的开始节点参数', () => {
      expect(isPresetStartParams(BOT_USER_INPUT)).toBe(true);
      expect(isPresetStartParams(USER_INPUT)).toBe(true);
      expect(isPresetStartParams(CONVERSATION_NAME)).toBe(true);
    });

    it('应该正确识别非预设的开始节点参数', () => {
      expect(isPresetStartParams('other_param')).toBe(false);
      expect(isPresetStartParams('custom_input')).toBe(false);
    });

    it('应该正确处理 undefined 和空字符串', () => {
      expect(isPresetStartParams(undefined)).toBe(false);
      expect(isPresetStartParams('')).toBe(false);
    });
  });

  describe('isUserInputStartParams', () => {
    it('应该正确识别用户输入的开始节点参数', () => {
      expect(isUserInputStartParams(BOT_USER_INPUT)).toBe(true);
      expect(isUserInputStartParams(USER_INPUT)).toBe(true);
    });

    it('应该正确识别非用户输入的开始节点参数', () => {
      expect(isUserInputStartParams(CONVERSATION_NAME)).toBe(false);
      expect(isUserInputStartParams('other_param')).toBe(false);
      expect(isUserInputStartParams('custom_input')).toBe(false);
    });

    it('应该正确处理 undefined 和空字符串', () => {
      expect(isUserInputStartParams(undefined)).toBe(false);
      expect(isUserInputStartParams('')).toBe(false);
    });
  });
});
