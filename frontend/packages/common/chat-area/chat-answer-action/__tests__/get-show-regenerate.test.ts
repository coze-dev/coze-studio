import { getShowRegenerate } from '../src/utils/get-show-regenerate';

vi.mock('@coze-common/chat-area', () => ({
  getIsTriggerMessage: (param: any) =>
    param.type === 'task_manual_trigger' || param.source === 1,
  getIsNotificationMessage: (param: any) => param.source === 2,
  getIsAsyncResultMessage: (param: any) => param.source === 3,
}));

it('getShowRegenerateCorrectly', () => {
  const res1 = getShowRegenerate({
    message: { type: 'answer', source: 0 },
    meta: { isFromLatestGroup: true, sectionId: '123' },
    latestSectionId: '123',
  });
  const res2 = getShowRegenerate({
    message: { type: 'ack', source: 0 },
    meta: { isFromLatestGroup: true, sectionId: '123' },
    latestSectionId: '123',
  });
  const res3 = getShowRegenerate({
    message: { type: 'answer', source: 0 },
    meta: { isFromLatestGroup: true, sectionId: '123' },
    latestSectionId: '321',
  });
  const res4 = getShowRegenerate({
    message: { type: 'task_manual_trigger', source: 0 },
    meta: { isFromLatestGroup: true, sectionId: '321' },
    latestSectionId: '321',
  });
  const res5 = getShowRegenerate({
    message: { type: 'answer', source: 2 },
    meta: { isFromLatestGroup: false, sectionId: '321' },
    latestSectionId: '321',
  });
  expect(res1).toBeTruthy();
  expect(res2).toBeTruthy();
  expect(res3).toBeFalsy();
  expect(res4).toBeFalsy();
  expect(res5).toBeFalsy();
});
