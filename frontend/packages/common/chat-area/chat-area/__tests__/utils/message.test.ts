import { isFallbackErrorMessage } from '../../src/utils/message';

vi.mock('@coze-common/chat-core', () => ({
  ContentType: vi.fn(),
  VerboseMsgType: vi.fn(),
  Scene: {
    CozeHome: 3,
  },
  messageSource: vi.fn(),
}));

vi.mock('@coze-arch/coze-design', () => ({
  UIToast: {
    error: vi.fn(),
  },
  Avatar: vi.fn(),
}));

describe('isFallbackErrorMessage', () => {
  it('should return true for fallback error messages', () => {
    const message = {
      message_id: '7486354676263567404_error',
    };
    expect(isFallbackErrorMessage(message)).toBe(true);
  });
  it('should return false for fallback error messages', () => {
    const message = {
      message_id: '74863546762635asdasv',
    };
    expect(isFallbackErrorMessage(message)).toBe(false);
  });
});
