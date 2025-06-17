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

    // 检查表单是否存在
    expect(wrapper.getByRole('form')).toBeInTheDocument();

    // 检查确定和取消按钮
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
