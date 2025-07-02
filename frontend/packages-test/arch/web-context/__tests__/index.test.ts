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
