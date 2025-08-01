/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
  /** The function is to bring the Douyin mark in the url when jumping to the upload page to distinguish the views on the upload page */
  isDouyinBot?: boolean;
  pageMode?: 'modal' | 'normal';

  first_auto_open_edit_document_id?: string;
  create?: string;
}

export interface IParamsStore {
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
