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

import { redirect as originalRedirect } from '../src/location';
import {
  redirect,
  GlobalEventBus,
  globalVars,
  COZE_TOKEN_INSUFFICIENT_ERROR_CODE,
  BaseEnum,
  SpaceAppEnum,
  defaultConversationKey,
  defaultConversationUniqId,
} from '../src/index';
import { globalVars as originalGlobalVars } from '../src/global-var';
import { GlobalEventBus as originalGlobalEventBus } from '../src/event-bus';
import { COZE_TOKEN_INSUFFICIENT_ERROR_CODE as originalCOZE_TOKEN_INSUFFICIENT_ERROR_CODE } from '../src/const/custom';
import {
  defaultConversationKey as originalDefaultConversationKey,
  defaultConversationUniqId as originalDefaultConversationUniqId,
} from '../src/const/community';
import {
  BaseEnum as originalBaseEnum,
  SpaceAppEnum as originalSpaceAppEnum,
} from '../src/const/app';

describe('index', () => {
  test('should export redirect from location', () => {
    expect(redirect).toBe(originalRedirect);
  });

  test('should export GlobalEventBus from event-bus', () => {
    expect(GlobalEventBus).toBe(originalGlobalEventBus);
  });

  test('should export globalVars from global-var', () => {
    expect(globalVars).toBe(originalGlobalVars);
  });

  test('should export COZE_TOKEN_INSUFFICIENT_ERROR_CODE from const/custom', () => {
    expect(COZE_TOKEN_INSUFFICIENT_ERROR_CODE).toBe(
      originalCOZE_TOKEN_INSUFFICIENT_ERROR_CODE,
    );
  });

  test('should export BaseEnum from const/app', () => {
    expect(BaseEnum).toBe(originalBaseEnum);
  });

  test('should export SpaceAppEnum from const/app', () => {
    expect(SpaceAppEnum).toBe(originalSpaceAppEnum);
  });

  test('should export defaultConversationKey from const/community', () => {
    expect(defaultConversationKey).toBe(originalDefaultConversationKey);
  });

  test('should export defaultConversationUniqId from const/community', () => {
    expect(defaultConversationUniqId).toBe(originalDefaultConversationUniqId);
  });
});
