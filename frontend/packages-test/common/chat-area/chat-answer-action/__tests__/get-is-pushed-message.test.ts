import { getIsPushedMessage } from '../src/utils/get-is-pushed-message';

vi.mock('@coze-common/chat-area', () => ({
  getIsTriggerMessage: (param: any) =>
    param.type === 'task_manual_trigger' || param.source === 1,

  getIsNotificationMessage: (param: any) => param.source === 2,
  getIsAsyncResultMessage: (param: any) => param.source === 3,
}));

it('getIsPushedMessageCorrectly', () => {
  const res1 = getIsPushedMessage({ type: 'answer', source: 0 });
  const res2 = getIsPushedMessage({ type: 'answer', source: 3 });
  const res3 = getIsPushedMessage({ type: 'answer', source: 1 });
  const res4 = getIsPushedMessage({ type: 'task_manual_trigger', source: 0 });
  const res5 = getIsPushedMessage({ type: 'answer', source: 2 });
  expect(res1).toBeFalsy();
  expect(res2).toBeTruthy();
  expect(res3).toBeTruthy();
  expect(res4).toBeTruthy();
  expect(res5).toBeTruthy();
});
