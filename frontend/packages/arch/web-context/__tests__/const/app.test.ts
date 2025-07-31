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

import { BaseEnum, SpaceAppEnum } from '../../src/const/app';

describe('const/app', () => {
  describe('BaseEnum', () => {
    test('should have correct values for all enum members', () => {
      expect(BaseEnum.Home).toBe('home');
      expect(BaseEnum.Explore).toBe('explore');
      expect(BaseEnum.Store).toBe('store');
      expect(BaseEnum.Model).toBe('model');
      expect(BaseEnum.Space).toBe('space');
      expect(BaseEnum.Workflow).toBe('work_flow');
      expect(BaseEnum.Invite).toBe('invite');
      expect(BaseEnum.Token).toBe('token');
      expect(BaseEnum.Open).toBe('open');
      expect(BaseEnum.PluginMockSet).toBe('plugin_mock_set');
      expect(BaseEnum.Search).toBe('search');
      expect(BaseEnum.Premium).toBe('premium');
      expect(BaseEnum.User).toBe('user');
    });

    test('should have the expected number of enum values', () => {
      const enumValues = Object.values(BaseEnum);
      expect(enumValues.length).toBe(14);
    });
  });

  describe('SpaceAppEnum', () => {
    test('should have correct values for all enum members', () => {
      expect(SpaceAppEnum.BOT).toBe('bot');
      expect(SpaceAppEnum.DEVELOP).toBe('develop');
      expect(SpaceAppEnum.LIBRARY).toBe('library');
      expect(SpaceAppEnum.PLUGIN).toBe('plugin');
      expect(SpaceAppEnum.WORKFLOW).toBe('workflow');
      expect(SpaceAppEnum.KNOWLEDGE).toBe('knowledge');
      expect(SpaceAppEnum.TEAM).toBe('team');
      expect(SpaceAppEnum.PERSONAL).toBe('personal');
      expect(SpaceAppEnum.WIDGET).toBe('widget');
      expect(SpaceAppEnum.EVALUATION).toBe('evaluation');
      expect(SpaceAppEnum.SOCIAL_SCENE).toBe('social-scene');
      expect(SpaceAppEnum.IMAGEFLOW).toBe('imageflow');
    });

    test('should have the expected number of enum values', () => {
      const enumValues = Object.values(SpaceAppEnum);
      expect(enumValues.length).toBe(19);
    });
  });
});
