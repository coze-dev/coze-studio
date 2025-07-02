import { type AxiosRequestConfig } from 'axios';
import { REPORT_EVENTS } from '@coze-arch/report-events';
import { useSpaceStore } from '@coze-arch/bot-studio-store';
import { CustomError } from '@coze-arch/bot-error';
import {
  type BotAPIRequestConfig,
  PlaygroundApi,
  type PlaygroundApiService,
} from '@coze-arch/bot-api';

const apiList = [
  'InviteMemberLinkV2',
  'AddBotSpaceMemberV2',
  'SearchMemberV2',
  'UpdateSpaceMemberV2',
  'RemoveSpaceMemberV2',
  'SpaceMemberDetailV2',
  'DraftBotPublishHistoryDetail',
  'BotInfoAudit',
  'MGetBotByVersion',
];

type ApiType =
  | 'InviteMemberLinkV2'
  | 'AddBotSpaceMemberV2'
  | 'SearchMemberV2'
  | 'RemoveSpaceMemberV2'
  | 'SpaceMemberDetailV2'
  | 'UpdateSpaceMemberV2'
  | 'DraftBotPublishHistoryDetail'
  | 'BotInfoAudit'
  | 'MGetBotByVersion';

export type SpaceRequest<T> = Omit<T, 'space_id'>;

type D = PlaygroundApiService<BotAPIRequestConfig>;

type ExportSpaceService = {
  [K in ApiType]: (
    params: SpaceRequest<Parameters<D[K]>[0]>,
    options?: Parameters<D[K]>[1],
  ) => ReturnType<D[K]>;
};

const getSpaceId = () => useSpaceStore.getState().getSpaceId();

// 需要注入store space id的api
// eslint-disable-next-line @typescript-eslint/naming-convention
export const SpaceApiV2 = new Proxy(Object.create(null), {
  get(_, funcName: ApiType) {
    const spaceId = getSpaceId();

    if (!apiList.includes(funcName)) {
      throw new CustomError(
        REPORT_EVENTS.parmasValidation,
        `Function ${funcName} is not defined in replace list`,
      );
    }
    return <S extends keyof D>(
      params: SpaceRequest<Parameters<D[S]>[0]>,
      options: AxiosRequestConfig = {},
    ): Promise<ReturnType<D[S]>> =>
      PlaygroundApi[funcName](
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { space_id: spaceId, ...params } as any,
        options,
      ) as Promise<ReturnType<D[S]>>;
  },
}) as ExportSpaceService;
