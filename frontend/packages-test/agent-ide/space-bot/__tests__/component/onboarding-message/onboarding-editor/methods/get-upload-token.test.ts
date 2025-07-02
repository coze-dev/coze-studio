import { type Mock } from 'vitest';
import { DeveloperApi } from '@coze-arch/bot-api';

import { getUploadToken } from '@/component/onboarding-message/onboarding-editor/method/get-upload-token';

vi.mock('@coze-arch/bot-api', () => ({
  DeveloperApi: {
    GetUploadAuthToken: vi.fn(),
  },
}));
describe('getUploadToken', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns the expected response on successful API call', async () => {
    const mockResponse = {
      code: 200,
      msg: 'Success',
      data: {
        auth: {
          token: 'mockToken',
        },
      },
    };
    (DeveloperApi.GetUploadAuthToken as Mock).mockResolvedValue(mockResponse);

    const result = await getUploadToken();

    expect(result).toEqual({
      code: 200,
      message: 'Success',
      data: {
        ...mockResponse.data,
        ...mockResponse.data.auth,
      },
    });
  });

  it('throws an error when the API call fails', async () => {
    const mockError = new Error('API call failed');
    (DeveloperApi.GetUploadAuthToken as Mock).mockRejectedValue(mockError);

    await expect(getUploadToken()).rejects.toThrow('API call failed');
  });
});
