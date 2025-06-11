import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { create } from 'zustand';
import {
  type UnitType,
  type OptType,
} from '@coze-data/knowledge-resource-processor-core';

export enum ActionType {
  ADD = 'add',
  REMOVE = 'remove',
}
export interface IParams {
  version?: string;

  projectID?: string;
  datasetID?: string;
  spaceID?: string;
  tableID?: string;

  type?: UnitType;
  opt?: OptType;
  docID?: string;

  biz: 'agentIDE' | 'workflow' | 'project' | 'library';
  botID?: string;
  workflowID?: string;
  agentID?: string;
  actionType?: ActionType;
  initialTab?: 'structure' | 'draft' | 'online';
  // TODO: 通过biz区分
  /** 作用是跳转上传页时能在 url 里带上抖音标记，以在上传页做视图区分 */
  isDouyinBot?: boolean;
  pageMode?: 'modal' | 'normal';

  first_auto_open_edit_document_id?: string;
  create?: string;
}

export interface IParamsStore {
  // TODO: 细化 params 类型
  params: IParams;
}

export const createParamsStore = (initialState: IParams) =>
  create<IParamsStore>()(
    devtools(
      subscribeWithSelector((set, get) => ({
        params: initialState,
        //TODO: get
      })),
      {
        enabled: IS_DEV_MODE,
        name: 'knowledge.params',
      },
    ),
  );

export type ParamsStore = ReturnType<typeof createParamsStore>;
