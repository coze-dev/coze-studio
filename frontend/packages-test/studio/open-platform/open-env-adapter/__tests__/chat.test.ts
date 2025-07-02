import { getOpenSDKPath } from '@/chat';
describe('chat-env', () => {
  it('getOpenSDKUrl', () => {
    const sdkPath = getOpenSDKPath('1.0.0');
    expect(sdkPath).toBe('');
  });
});
