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

import { render, fireEvent, act } from '@testing-library/react';

import { SelectSpaceModal } from '../src/select-space-modal';

const spaces = [
  {
    id: 'space0',
    name: 'space0',
    hide_operation: false,
  },
  {
    id: 'space1',
    name: 'space1',
    hide_operation: true,
  },
  {
    id: 'space2',
    name: 'space2',
    hide_operation: false,
  },
];

vi.mock('@coze-arch/bot-studio-store', () => ({
  useSpaceStore: () => ({
    space: { ...spaces[0], id: spaces[0].id },
    spaces: {
      bot_space_list: spaces,
    },
    getState: () => ({
      getPersonalSpaceID: () => 'personal-space-id',
    }),
  }),
  useSpaceList: () => ({ spaces, loading: false }),
}));

vi.mock('@coze-studio/bot-detail-store/page-runtime', () => ({
  usePageRuntimeStore: () => ({
    pageFrom: 'test',
  }),
}));

vi.mock('@coze-studio/bot-detail-store/bot-skill', () => ({
  useBotSkillStore: () => ({
    hasWorkflow: false,
  }),
}));

describe('SelectSpaceModal', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render botName and spaces', () => {
    const wrapper = render(<SelectSpaceModal visible botName="mockBot" />);
    expect(wrapper.getByRole('dialog')).toBeInTheDocument();
    expect(
      wrapper.getByDisplayValue('mockBot(duplicate_rename_copy)'),
    ).toBeInTheDocument();

    // Check if the form exists
    expect(wrapper.getByRole('form')).toBeInTheDocument();

    // Check OK and Cancel buttons
    expect(
      wrapper.getByRole('button', { name: 'confirm' }),
    ).toBeInTheDocument();
    expect(wrapper.getByRole('button', { name: 'cancel' })).toBeInTheDocument();
  });

  it('should fire events', async () => {
    const mockCancel = vi.fn();
    const mockConfirm = vi.fn();
    render(
      <SelectSpaceModal
        visible
        botName="mockBot"
        onCancel={mockCancel}
        onConfirm={mockConfirm}
      />,
    );
    fireEvent.click(document.body.querySelector('[aria-label="cancel"]')!);
    expect(mockCancel).toHaveBeenCalled();
    await act(async () => {
      await fireEvent.click(
        document.body.querySelector('[aria-label="confirm"]')!,
      );
    });
    expect(mockConfirm).toHaveBeenCalledWith(
      'space0',
      'mockBot(duplicate_rename_copy)',
    );
  });
});
