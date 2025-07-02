import { getIsGroupChatActive } from '../../src/utils/message-group/get-is-group-chat-active';
import { WaitingPhase } from '../../src/store/waiting';

vi.mock('@coze-common/chat-core', () => ({
  ContentType: vi.fn(),
  VerboseMsgType: vi.fn(),
}));

it('get active correct', () => {
  const res1 = getIsGroupChatActive({
    waiting: null,
    sending: {
      message_id: '123',
      extra_info: {
        local_message_id: '',
      },
    },
    groupId: '123',
  });

  expect(res1).toBeTruthy();

  const res2 = getIsGroupChatActive({
    waiting: null,
    sending: {
      message_id: '',
      extra_info: {
        local_message_id: '123',
      },
    },
    groupId: '321',
  });
  expect(res2).toBeFalsy();

  const res3 = getIsGroupChatActive({
    waiting: {
      replyId: '999',
      phase: WaitingPhase.Suggestion,
    },
    sending: null,

    groupId: '999',
  });
  expect(res3).toBeFalsy();

  const res4 = getIsGroupChatActive({
    waiting: {
      replyId: '123123',
      phase: WaitingPhase.Formal,
    },
    sending: null,

    groupId: '999',
  });
  expect(res4).toBeFalsy();

  const res5 = getIsGroupChatActive({
    waiting: {
      replyId: '999',
      phase: WaitingPhase.Formal,
    },
    sending: null,

    groupId: '999',
  });
  expect(res5).toBeTruthy();
});
