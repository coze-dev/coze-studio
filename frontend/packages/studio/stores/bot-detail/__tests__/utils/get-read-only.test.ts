import { BotPageFromEnum } from '@coze-arch/bot-typings/common';

import { getBotDetailIsReadonlyByState } from '../../src/utils/get-read-only';
import { useBotDetailStoreSet } from '../../src/store/index';
import { EditLockStatus } from '../../src/store/collaboration';

describe('useModelStore', () => {
  beforeEach(() => {
    useBotDetailStoreSet.clear();
  });
  it('getBotDetailIsReadonlyByState', () => {
    const overall = {
      editable: true,
      isPreview: false,
      editLockStatus: EditLockStatus.Offline,
      pageFrom: BotPageFromEnum.Bot,
    };

    expect(
      getBotDetailIsReadonlyByState({ ...overall, editable: false }),
    ).toBeTruthy();
    expect(
      getBotDetailIsReadonlyByState({ ...overall, isPreview: true }),
    ).toBeTruthy();
    expect(
      getBotDetailIsReadonlyByState({
        ...overall,
        editLockStatus: EditLockStatus.Lose,
      }),
    ).toBeTruthy();
  });
});
