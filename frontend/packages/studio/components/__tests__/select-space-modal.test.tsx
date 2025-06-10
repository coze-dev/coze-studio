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
    space: spaces[0],
    spaces: {
      bot_space_list: spaces,
    },
  }),
  useSpaceList: () => ({ spaces, loading: false }),
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

    fireEvent.click(wrapper.getByRole('combobox'));
    act(() => vi.advanceTimersByTime(1000));

    expect(wrapper.getAllByTestId('ui.select.option').length).toBe(2);
    expect(wrapper.queryByText('space1')).toBeNull();
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
