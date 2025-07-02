import { renderHook } from '@testing-library/react';
import { BotPageFromEnum } from '@coze-arch/bot-typings/common';

import { usePageRuntimeStore } from '../../src/store/page-runtime';
import { useBotDetailStoreSet } from '../../src/store/index';
import {
  useCollaborationStore,
  EditLockStatus,
} from '../../src/store/collaboration';
import { useBotDetailIsReadonly } from '../../src/hooks/use-bot-detail-readonly';

describe('useBotDetailIsReadonly', () => {
  beforeEach(() => {
    useBotDetailStoreSet.clear();
  });
  it('useBotDetailIsReadonly', () => {
    const pageRuntime = {
      editable: true,
      isPreview: false,
      pageFrom: BotPageFromEnum.Bot,
    };
    const collaboration = {
      editLockStatus: EditLockStatus.Offline,
    };
    useCollaborationStore.getState().setCollaboration(collaboration);
    usePageRuntimeStore
      .getState()
      .setPageRuntimeBotInfo({ ...pageRuntime, editable: false });
    const { result: r1 } = renderHook(() => useBotDetailIsReadonly());
    expect(r1.current).toBeTruthy();
    usePageRuntimeStore.getState().clear();
    useCollaborationStore.getState().clear();

    useCollaborationStore.getState().setCollaboration(collaboration);
    usePageRuntimeStore
      .getState()
      .setPageRuntimeBotInfo({ ...pageRuntime, isPreview: true });
    const { result: r2 } = renderHook(() => useBotDetailIsReadonly());
    expect(r2.current).toBeTruthy();
    usePageRuntimeStore.getState().clear();
    useCollaborationStore.getState().clear();

    useCollaborationStore.getState().setCollaboration({
      ...collaboration,
      editLockStatus: EditLockStatus.Lose,
    });
    usePageRuntimeStore.getState().setPageRuntimeBotInfo(pageRuntime);
    const { result: r3 } = renderHook(() => useBotDetailIsReadonly());
    expect(r3.current).toBeTruthy();
    usePageRuntimeStore.getState().clear();
    useCollaborationStore.getState().clear();
  });
});
