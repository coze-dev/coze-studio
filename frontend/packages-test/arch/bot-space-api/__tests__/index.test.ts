import { globalVars } from '@coze-arch/web-context';
import { useSpaceStore } from '@coze-arch/bot-studio-store';
import { CustomError } from '@coze-arch/bot-error';
import { DeveloperApi } from '@coze-arch/bot-api';

import { SpaceApi } from '../src/index';

vi.mock('@coze-arch/bot-api', () => ({
  DeveloperApi: {
    CreateWorkFlow: vi.fn(),
    CreateWorkflowV2: vi.fn(),
    WorkflowListV2: vi.fn(),
    WorkFlowList: vi.fn(),
    ExecuteDraftBot: vi.fn(),
    QueryCardList: vi.fn(),
  },
}));

vi.mock('@coze-arch/bot-studio-store', () => ({
  useSpaceStore: {
    getState: vi.fn().mockReturnValue({ getSpaceId: vi.fn() }),
  },
}));

vi.mock('@coze-arch/report-events', () => ({ REPORT_EVENTS: { a: 'a' } }));
vi.mock('@coze-arch/web-context', () => ({
  globalVars: { LAST_EXECUTE_ID: undefined },
}));
vi.mock('@coze-arch/bot-error', () => ({ CustomError: vi.fn() }));
vi.mock('axios', () => ({ default: { defaults: { transformResponse: [] } } }));
vi.mock('../src/space-api-v2', () => ({ SpaceApiV2: vi.fn() }));

describe('space api spec', () => {
  vi.clearAllMocks();

  it('should rewrite space id when calling ExecuteDraftBot', async () => {
    useSpaceStore.getState().getSpaceId.mockReturnValue('test-id');

    await SpaceApi.ExecuteDraftBot();
    expect(globalVars.LAST_EXECUTE_ID).toBe(undefined);
    expect(DeveloperApi.ExecuteDraftBot).toBeCalled();
    expect(DeveloperApi.ExecuteDraftBot.mock.calls[0][0]).toMatchObject({
      space_id: 'test-id',
    });

    const axiosConfig = DeveloperApi.ExecuteDraftBot.mock.calls[0][1];
    expect(axiosConfig.transformResponse[0]).toBeTypeOf('function');
    axiosConfig.transformResponse[0]({}, { 'x-tt-logid': 'test log id' });
    expect(globalVars.LAST_EXECUTE_ID).toBe('test log id');
  });

  it('should call developer api directly', async () => {
    useSpaceStore.getState().getSpaceId.mockReturnValue('test-id');

    await SpaceApi.QueryCardList({});
    expect(DeveloperApi.QueryCardList).toBeCalled();
    expect(DeveloperApi.QueryCardList.mock.calls[0][0]).toMatchObject({
      space_id: 'test-id',
    });
  });

  it('should rename WorkflowList to WorkflowListV2', async () => {
    useSpaceStore.getState().getSpaceId.mockReturnValue('test-id');

    await SpaceApi.WorkFlowList({});
    await SpaceApi.CreateWorkFlow({});
    expect(DeveloperApi.WorkflowListV2).toBeCalled();
    expect(DeveloperApi.WorkflowListV2.mock.calls[0][0]).toMatchObject({
      space_id: 'test-id',
    });
    expect(DeveloperApi.CreateWorkflowV2).toBeCalled();
  });

  it('should throw custom error when calling not exits func', async () => {
    await expect(() => SpaceApi['func not exits']()).toThrowError();
    expect(CustomError).toBeCalled();
  });
});
