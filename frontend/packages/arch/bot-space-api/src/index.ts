import axios, { type AxiosRequestConfig } from 'axios';
import { globalVars } from '@coze-arch/web-context';
import { REPORT_EVENTS as ReportEventNames } from '@coze-arch/report-events';
import { useSpaceStore } from '@coze-arch/bot-studio-store';
import { CustomError } from '@coze-arch/bot-error';
import type DeveloperApiService from '@coze-arch/bot-api/developer_api';
import { DeveloperApi, type BotAPIRequestConfig } from '@coze-arch/bot-api';

export type SpaceRequest<T> = Omit<T, 'space_id'>;

type D = DeveloperApiService<BotAPIRequestConfig>;

// 这些是暴露出来需要被调用的函数列表
// 新增函数请在该列表后面追加即可
type ExportFunctions =
  | 'GetPlaygroundPluginList'
  | 'GetDraftBotList'
  | 'WorkFlowList'
  | 'CreateWorkFlow'
  | 'CopyFromTemplate'
  | 'DraftBotCreate'
  | 'DuplicateDraftBot'
  | 'GetDraftBotInfo'
  | 'UpdateDraftBot'
  | 'PublishDraftBot'
  | 'ExecuteDraftBot'
  | 'ListDraftBotHistory'
  | 'RevertDraftBot'
  | 'RegisterPlugin'
  | 'RegisterPluginMeta'
  | 'CreateDataSet'
  | 'ListDateSet'
  | 'DeleteDraftBot'
  | 'GetPluginList'
  | 'GetApiRespStruct'
  | 'GetProfileMemory'
  | 'WorkFlowPublish'
  | 'RunWorkFlow'
  | 'GetPluginCurrentInfo'
  | 'GetTypeList'
  | 'NodeList'
  | 'GetWorkFlowProcess'
  | 'MapData'
  | 'SuggestPlugin'
  | 'PublishConnectorList'
  | 'UnBindConnector'
  | 'BindConnector'
  | 'UpdateNode'
  | 'CreateChatflowAgent'
  | 'CopyChatflowAgent'
  | 'GetBotModuleInfo'
  | 'CopyWorkflowV2'
  | 'WorkflowListV2'
  | 'QueryWorkflowV2'
  | 'CreateWorkflowV2'
  | 'PublishWorkflowV2'
  | 'QueryCardDetail'
  | 'QueryCardList'
  | 'CreateCard'
  | 'GetPluginCards'
  | 'GetDraftBotDisplayInfo'
  | 'UpdateDraftBotDisplayInfo'
  | 'TaskList'
  | 'GetBindConnectorConfig'
  | 'SaveBindConnectorConfig'
  | 'CommitDraftBot'
  | 'CheckDraftBotCommit'
  | 'GetCardRespStruct';

type ExportService = {
  [K in ExportFunctions]: (
    // 这里主要是为了 omit 掉 space_id 这个参数，而做的二次封装
    // FIXME：似乎没办法继承 bam 原始函数里面的 comment，会影响用户体验
    params: SpaceRequest<Parameters<D[K]>[0]>,
    options?: Parameters<D[K]>[1],
  ) => ReturnType<D[K]>;
};

const getSpaceId = () => useSpaceStore.getState().getSpaceId();

const spaceApiService = new Proxy(Object.create(null), {
  get(_, funcName: ExportFunctions) {
    const spaceId = getSpaceId();
    if (!DeveloperApi[funcName]) {
      throw new CustomError(
        ReportEventNames.parmasValidation,
        `Function ${funcName} is not defined in DeveloperApi`,
      );
    }
    const externalConfig: AxiosRequestConfig = {};

    switch (funcName) {
      case 'ExecuteDraftBot': {
        const defaults = axios.defaults?.transformResponse;
        externalConfig.transformResponse = [].concat(
          // @ts-expect-error -- linter-disable-autofix
          ...(Array.isArray(defaults) ? defaults : [defaults]),
          (data, headers) => {
            globalVars.LAST_EXECUTE_ID = headers['x-tt-logid'];
            return data;
          },
        );
        break;
      }
      // TODO: 这里应该直接调用 WorkflowListV2 ，后续请各业务方调整
      case 'WorkFlowList':
        funcName = 'WorkflowListV2';
        break;
      // TODO: 这里应该直接调用 CreateWorkflowV2 ，后续请各业务方调整
      case 'CreateWorkFlow':
        funcName = 'CreateWorkflowV2';
        break;
      default: {
        break;
      }
    }

    return <S extends keyof D>(
      params: SpaceRequest<Parameters<D[S]>[0]>,
      options: AxiosRequestConfig = {},
    ): Promise<ReturnType<D[S]>> =>
      DeveloperApi[funcName](
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { ...params, space_id: spaceId } as any,
        {
          ...externalConfig,
          ...options,
        },
      ) as Promise<ReturnType<D[S]>>;
  },
}) as ExportService;

// eslint-disable-next-line @typescript-eslint/naming-convention
export const SpaceApi = spaceApiService;

export { SpaceApiV2 } from './space-api-v2';
