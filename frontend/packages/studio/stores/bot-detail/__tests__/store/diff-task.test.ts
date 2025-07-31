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

import {
  useDiffTaskStore,
  getDefaultDiffTaskStore,
} from '../../src/store/diff-task';

describe('diff-task store', () => {
  beforeEach(() => {
    // Reset the stored state before each test
    useDiffTaskStore.getState().clear();
  });

  test('初始状态应该匹配默认状态', () => {
    const initialState = useDiffTaskStore.getState();
    const defaultState = getDefaultDiffTaskStore();

    expect(initialState.diffTask).toEqual(defaultState.diffTask);
    expect(initialState.hasContinueTask).toEqual(defaultState.hasContinueTask);
    expect(initialState.continueTask).toEqual(defaultState.continueTask);
    expect(initialState.promptDiffInfo).toEqual(defaultState.promptDiffInfo);
  });

  test('setDiffTask 应该正确更新状态', () => {
    const { setDiffTask } = useDiffTaskStore.getState();

    setDiffTask({ diffTask: 'prompt' });
    expect(useDiffTaskStore.getState().diffTask).toBe('prompt');

    setDiffTask({ hasContinueTask: true });
    expect(useDiffTaskStore.getState().hasContinueTask).toBe(true);

    setDiffTask({ continueTask: 'model' });
    expect(useDiffTaskStore.getState().continueTask).toBe('model');

    const newPromptDiffInfo = {
      diffPromptResourceId: 'test-id',
      diffMode: 'draft' as const,
      diffPrompt: 'test prompt',
    };

    setDiffTask({ promptDiffInfo: newPromptDiffInfo });
    expect(useDiffTaskStore.getState().promptDiffInfo).toEqual(
      newPromptDiffInfo,
    );
  });

  test('setDiffTaskByImmer 应该正确更新状态', () => {
    const { setDiffTaskByImmer } = useDiffTaskStore.getState();

    setDiffTaskByImmer(state => {
      state.diffTask = 'model';
      state.hasContinueTask = true;
    });

    const updatedState = useDiffTaskStore.getState();
    expect(updatedState.diffTask).toBe('model');
    expect(updatedState.hasContinueTask).toBe(true);
  });

  test('enterDiffMode 应该正确设置 prompt 类型的 diff 任务', () => {
    const { enterDiffMode } = useDiffTaskStore.getState();
    const promptDiffInfo = {
      diffPromptResourceId: 'test-resource',
      diffMode: 'new-diff' as const,
      diffPrompt: 'test diff prompt',
    };

    enterDiffMode({
      diffTask: 'prompt',
      promptDiffInfo,
    });

    const state = useDiffTaskStore.getState();
    expect(state.diffTask).toBe('prompt');
    expect(state.promptDiffInfo).toEqual(promptDiffInfo);
  });

  test('enterDiffMode 应该能处理非 prompt 类型的 diff 任务', () => {
    const { enterDiffMode } = useDiffTaskStore.getState();

    enterDiffMode({
      diffTask: 'model',
    });

    const state = useDiffTaskStore.getState();
    expect(state.diffTask).toBe('model');
    // promptDiffInfo should remain unchanged
    expect(state.promptDiffInfo).toEqual(
      getDefaultDiffTaskStore().promptDiffInfo,
    );
  });

  test('exitDiffMode 应该调用 clear 方法', () => {
    const { enterDiffMode, exitDiffMode, clear } = useDiffTaskStore.getState();

    // Simulated clearing method
    const mockClear = vi.fn();
    useDiffTaskStore.setState(state => ({ ...state, clear: mockClear }));

    // Enter diff mode first
    enterDiffMode({ diffTask: 'prompt' });

    // Exit diff mode
    exitDiffMode();

    // Verify clear is called
    expect(mockClear).toHaveBeenCalledTimes(1);

    // Restore the original clear method
    useDiffTaskStore.setState(state => ({ ...state, clear }));
  });

  test('clear 应该重置状态到默认值', () => {
    const { setDiffTask, clear } = useDiffTaskStore.getState();

    // Modify state
    setDiffTask({
      diffTask: 'model',
      hasContinueTask: true,
      continueTask: 'prompt',
    });

    // Verification status has changed
    let state = useDiffTaskStore.getState();
    expect(state.diffTask).toBe('model');
    expect(state.hasContinueTask).toBe(true);
    expect(state.continueTask).toBe('prompt');

    // reset state
    clear();

    // Verification status reset
    state = useDiffTaskStore.getState();
    expect(state).toEqual({
      ...getDefaultDiffTaskStore(),
      setDiffTask: state.setDiffTask,
      setDiffTaskByImmer: state.setDiffTaskByImmer,
      enterDiffMode: state.enterDiffMode,
      exitDiffMode: state.exitDiffMode,
      clear: state.clear,
    });
  });
});
