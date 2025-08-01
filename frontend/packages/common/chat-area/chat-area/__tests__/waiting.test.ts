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

import { ContentType, type Message } from '@coze-common/chat-core';

import {
  type WaitingStore,
  createWaitingStore,
  type Responding,
  getResponse,
  type Waiting,
  WaitingPhase,
} from '../src/store/waiting';

vi.mock('@coze-common/chat-core', () => ({
  ContentType: vi.fn(),
  VerboseMsgType: {
    /** jump node */
    JUMP_TO: 'multi_agents_jump_to_agent',
    /** backtracking node */
    BACK_WORD: 'multi_agents_backwards',
    /** long-term memory node */
    LONG_TERM_MEMORY: 'time_capsule_recall',
    /** finish answer*/
    GENERATE_ANSWER_FINISH: 'generate_answer_finish',
    /** Streaming plugin call status */
    STREAM_PLUGIN_FINISH: 'stream_plugin_finish',
    /** knowledge base recall */
    KNOWLEDGE_RECALL: 'knowledge_recall',
    /** Interrupt message: Currently only used for geolocation authorization */
    INTERRUPT: 'interrupt',
    /** Hooks call */
    HOOK_CALL: 'hook_call',
  },
  Scene: {
    CozeHome: 3,
  },
  messageSource: vi.fn(),
}));

vi.mock('@coze-common/chat-uikit', () => ({
  MentionList: vi.fn(),
}));

vi.mock('@coze-arch/bot-md-box-adapter', () => ({
  MdBoxLazy: vi.fn(),
}));

vi.stubGlobal('IS_DEV_MODE', false);

let useWaitingStore: WaitingStore;

const testSectionId = '7380292213265317928';

const sentMessage: Message<ContentType> = {
  role: 'user',
  type: 'ack',
  content: 'hello',
  content_obj: 'hello',
  content_type: ContentType.Text,
  message_id: '7392514612706705443',
  reply_id: '7392514612706705443',
  section_id: testSectionId,
  extra_info: {
    local_message_id: 'X_HfUyEeTE_sjbiyk2W8v',
    input_tokens: '',
    output_tokens: '',
    token: '',
    plugin_status: '',
    time_cost: '',
    workflow_tokens: '',
    bot_state: '',
    plugin_request: '',
    tool_name: '',
    plugin: '',
    mock_hit_info: '',
    log_id: '2024071716121849EA05C1D7C3036CEE60',
    message_title: '',
    stream_plugin_running: '',
    new_section_id: '',
    remove_query_id: '',
    execute_display_name: '',
    task_type: '',
    call_id: '',
  },
  mention_list: [],
  sender_id: '7326859717089804315',
  content_time: 1721203939098,
  message_index: '383',
  source: 0,
  is_finish: false,
  index: 0,
};

const llmMessage: Message<ContentType> = {
  role: 'assistant',
  type: 'answer',
  content: 'Hello',
  content_obj: 'Hello',
  content_type: ContentType.Text,
  message_id: '7392514629399953443',
  reply_id: '7392514612706705443',
  section_id: '7380292213265317928',
  extra_info: {
    local_message_id: '',
    input_tokens: '1055',
    output_tokens: '0',
    token: '1055',
    plugin_status: '',
    time_cost: '',
    workflow_tokens: '',
    bot_state:
      '{"bot_id":"7326859717089804315","agent_name":"意图识别","agent_id":"7386916906693410825","awaiting":"7386916906693410825"}',
    plugin_request: '',
    tool_name: '',
    plugin: '',
    mock_hit_info: '',
    log_id: '2024071716121849EA05C1D7C3036CEE60',
    message_title: '',
    stream_plugin_running: '',
    new_section_id: '',
    remove_query_id: '',
    execute_display_name: '',
    task_type: '',
    call_id: '',
  },
  mention_list: [],
  sender_id: '7326859717089804315',
  content_time: 1721203942447,
  message_index: '384',
  source: 0,
  is_finish: false,
  index: 1,
};

beforeEach(() => {
  vi.useFakeTimers();
  const newWaitingStore = createWaitingStore('unit-test');

  useWaitingStore = newWaitingStore;
});

describe('normal text message', () => {
  it('sending should be append into waiting store', () => {
    const { startSending } = useWaitingStore.getState();

    startSending(sentMessage);

    // Check if Sending exists

    const { sending } = useWaitingStore.getState();

    expect(sending).toStrictEqual(sentMessage);
  });

  it('sending should be clear after stop sending', () => {
    const { startSending, clearSending } = useWaitingStore.getState();

    startSending(sentMessage);

    // Check if Sending exists
    const { sending } = useWaitingStore.getState();
    expect(sending).toStrictEqual(sentMessage);

    // Clear Sending

    clearSending();
    const { sending: afterClearSending } = useWaitingStore.getState();
    expect(afterClearSending).toBeNull();
  });

  it('waiting should be append into waiting store', () => {
    const { startWaiting } = useWaitingStore.getState();
    startWaiting(sentMessage);

    const { waiting } = useWaitingStore.getState();

    const expectedWaiting: Waiting = {
      replyId: sentMessage.reply_id,
      questionLocalMessageId: sentMessage.extra_info.local_message_id,
      phase: WaitingPhase.Formal,
    };

    expect(waiting).toStrictEqual(expectedWaiting);
  });

  it('update responding is correct', () => {
    // Detection of responding presence
    const { updateResponding } = useWaitingStore.getState();

    updateResponding(llmMessage);

    const expectedResponding: Responding = {
      replyId: llmMessage.reply_id,
      response: [getResponse(llmMessage)],
    };

    const { responding } = useWaitingStore.getState();

    expect(responding).toStrictEqual(expectedResponding);
  });

  it('no responding , at verbose message is all finished', () => {
    const { updateResponding } = useWaitingStore.getState();

    const allFinishedMessage = {
      ...llmMessage,
      type: 'verbose',
      content: JSON.stringify({
        msg_type: 'generate_answer_finish',
      }),
      is_finish: true,
    };

    // @ts-expect-error -- single test
    updateResponding(allFinishedMessage);

    const { responding } = useWaitingStore.getState();

    expect(responding).toBeNull();
  });

  it('not responding, only has tool_response', () => {
    const { updateResponding } = useWaitingStore.getState();

    const toolResponseMessage = {
      ...llmMessage,
      type: 'tool_response',
    };

    // @ts-expect-error -- single test
    updateResponding(toolResponseMessage);

    const { responding } = useWaitingStore.getState();

    expect(responding).toBeNull();
  });

  it('has responding, but not match reply_id', () => {
    const { updateResponding } = useWaitingStore.getState();

    updateResponding(llmMessage);

    // Modifying reply_id creates the illusion of conflict
    const modifiedMessage = {
      ...llmMessage,
      reply_id: '嘤嘤嘤',
    };

    updateResponding(modifiedMessage);

    const { responding } = useWaitingStore.getState();

    expect(responding).toStrictEqual({
      replyId: llmMessage.reply_id,
      response: [getResponse(llmMessage)],
    });
  });

  it('has responding, is all finish', () => {
    const { updateResponding } = useWaitingStore.getState();

    const verboseMessage = {
      ...llmMessage,
      type: 'verbose',
      content: JSON.stringify({
        msg_type: 'aaa',
      }),
    };

    // @ts-expect-error -- test
    updateResponding(verboseMessage);

    const finishedMessage = {
      ...llmMessage,
      type: 'verbose',
      content: JSON.stringify({
        msg_type: 'generate_answer_finish',
      }),
    };

    // @ts-expect-error -- test

    updateResponding(finishedMessage);

    const { responding } = useWaitingStore.getState();

    expect(responding).toBeNull();
  });

  it('has responding, normal message finished', () => {
    const { updateResponding } = useWaitingStore.getState();

    updateResponding(llmMessage);

    const modifiedMessage = {
      ...llmMessage,
      is_finish: true,
    };

    updateResponding(modifiedMessage);

    const { responding } = useWaitingStore.getState();

    expect(responding).toStrictEqual({
      replyId: llmMessage.reply_id,
      response: [],
    });
  });

  it('function call', () => {
    const { updateResponding } = useWaitingStore.getState();

    const functionCallMessage = {
      ...llmMessage,
      type: 'function_call',
    };

    // @ts-expect-error -- test
    updateResponding(functionCallMessage);

    const respondingMessage = {
      ...llmMessage,
      type: 'tool_response',
      index: 2,
    };

    // @ts-expect-error -- test
    updateResponding(respondingMessage);

    const { responding } = useWaitingStore.getState();

    expect(responding).toStrictEqual({
      replyId: llmMessage.reply_id,
      response: [],
    });
  });

  it('clearAllUnsettledUnconditionally', () => {
    const {
      clearAllUnsettledUnconditionally,
      updateResponding,
      updateWaiting,
      startSending,
    } = useWaitingStore.getState();

    updateResponding(llmMessage);
    updateWaiting(sentMessage);
    startSending(sentMessage);

    clearAllUnsettledUnconditionally();

    const { waiting, sending, responding } = useWaitingStore.getState();

    expect(waiting).toBeNull();
    expect(responding).toBeNull();
    expect(sending).toBeNull();
  });

  it('clearUnsettledByReplyId', () => {
    const { clearUnsettledByReplyId, updateResponding, updateWaiting } =
      useWaitingStore.getState();

    updateResponding(llmMessage);
    updateWaiting(sentMessage);

    clearUnsettledByReplyId(llmMessage.reply_id);

    const { waiting, responding } = useWaitingStore.getState();

    expect(waiting).toBeNull();
    expect(responding).toBeNull();
  });

  it('clearWaitingStore', () => {
    const { clearWaitingStore, updateResponding, updateWaiting, startSending } =
      useWaitingStore.getState();

    updateResponding(llmMessage);
    updateWaiting(sentMessage);
    startSending(sentMessage);

    clearWaitingStore();

    const { waiting, sending, responding } = useWaitingStore.getState();

    expect(waiting).toBeNull();
    expect(responding).toBeNull();
    expect(sending).toBeNull();
  });

  it('function call index not correct', () => {
    const { updateResponding } = useWaitingStore.getState();

    const functionCallMessage = {
      ...llmMessage,
      type: 'function_call',
    };

    // @ts-expect-error -- test
    updateResponding(functionCallMessage);

    const respondingMessage = {
      ...llmMessage,
      type: 'tool_response',
      index: -1,
    };

    // @ts-expect-error -- test
    updateResponding(respondingMessage);

    const { responding } = useWaitingStore.getState();

    expect(responding).toStrictEqual({
      replyId: llmMessage.reply_id,
      // @ts-expect-error -- test
      response: [getResponse(functionCallMessage)],
    });
  });

  it('function call index not a number', () => {
    const { updateResponding } = useWaitingStore.getState();

    const functionCallMessage = {
      ...llmMessage,
      type: 'function_call',
    };

    // @ts-expect-error -- test
    updateResponding(functionCallMessage);

    const respondingMessage = {
      ...llmMessage,
      type: 'tool_response',
      index: 'hhhh',
    };

    // @ts-expect-error -- test
    updateResponding(respondingMessage);

    const { responding } = useWaitingStore.getState();

    expect(responding).toStrictEqual({
      replyId: llmMessage.reply_id,
      // @ts-expect-error -- test
      response: [getResponse(functionCallMessage)],
    });
  });

  it('function call double', () => {
    const { updateResponding } = useWaitingStore.getState();

    const functionCallMessage = {
      ...llmMessage,
      type: 'function_call',
    };

    // @ts-expect-error -- test
    updateResponding(functionCallMessage);

    const functionCallMessage2 = {
      ...llmMessage,
      message_id: '1234',
      extra_info: {
        ...llmMessage.extra_info,
        local_message_id: '9999',
      },
      type: 'function_call',
    };

    // @ts-expect-error -- test
    updateResponding(functionCallMessage2);

    const { responding } = useWaitingStore.getState();

    expect(responding).toStrictEqual({
      replyId: llmMessage.reply_id,
      response: [
        // @ts-expect-error -- test
        getResponse(functionCallMessage),
        // @ts-expect-error -- test
        getResponse(functionCallMessage2),
      ],
    });
  });
});
