import { useSpaceStore } from '@coze-arch/bot-studio-store';
import { CustomError } from '@coze-arch/bot-error';
import { PlaygroundApi } from '@coze-arch/bot-api';

import { SpaceApiV2 } from '../src/space-api-v2';

vi.mock('@coze-arch/bot-api', () => ({
  DeveloperApi: {
    InviteMemberLink: vi.fn(),
    SearchMember: vi.fn(),
  },
  PlaygroundApi: {
    InviteMemberLinkV2: vi.fn(),
    SearchMemberV2: vi.fn(),
  },
}));

vi.mock('@coze-arch/bot-studio-store', () => ({
  useSpaceStore: {
    getState: vi.fn().mockReturnValue({ getSpaceId: vi.fn() }),
  },
}));

vi.mock('@coze-arch/report-events', () => ({ REPORT_EVENTS: { a: 'a' } }));
vi.mock('@coze-arch/bot-error', () => ({ CustomError: vi.fn() }));
vi.mock('axios', () => ({ default: { defaults: { transformResponse: [] } } }));

describe('space api spec', () => {
  vi.clearAllMocks();

  it('should rewrite space id when calling SearchMemberV2 and fg true', async () => {
    useSpaceStore.getState().getSpaceId.mockReturnValue('test-id');

    await SpaceApiV2.SearchMemberV2({ search_list: ['name'] });

    expect(PlaygroundApi.SearchMemberV2).toBeCalled();
    expect(PlaygroundApi.SearchMemberV2.mock.calls[0][0]).toMatchObject({
      space_id: 'test-id',
    });
  });

  it('should throw custom error when calling not exits func', async () => {
    await expect(() => SpaceApiV2['func not exits']()).toThrowError();
    expect(CustomError).toBeCalled();
  });
});
