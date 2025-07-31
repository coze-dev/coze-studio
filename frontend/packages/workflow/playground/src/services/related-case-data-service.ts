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

import { inject, injectable } from 'inversify';
import type { WorkflowJSON } from '@flowgram-adapter/free-layout-editor';
import { getTestDataByTestset, FieldName } from '@coze-workflow/test-run';
import { StandardNodeType } from '@coze-workflow/base';
import { userStoreService } from '@coze-studio/user-store';
import { IntelligenceType } from '@coze-arch/idl/intelligence_api';
import { ComponentType } from '@coze-arch/idl/debugger_api';
import { typeSafeJSONParse } from '@coze-arch/bot-utils';
import { debuggerApi } from '@coze-arch/bot-api';

import { WorkflowGlobalStateEntity } from '@/entities';

const STORAGE_KEY = 'workflow_current_related_bot_value';
const TESTSET_CONNECTOR_ID = '10000';

interface SaveType {
  id: string;
  type: 'bot' | 'project';
}

interface CaseCachesType {
  [FieldName.Bot]?: {
    id: string;
    type: IntelligenceType;
  };
  [key: string]: unknown;
}

@injectable()
export class RelatedCaseDataService {
  @inject(WorkflowGlobalStateEntity) globalState: WorkflowGlobalStateEntity;

  caseCaches: CaseCachesType | undefined = undefined;
  setCasePromise: Promise<void> | undefined = undefined;

  private getURLSearchParamsBotId(): SaveType | undefined {
    const sourceBotId = new URLSearchParams(window.location.search).get(
      'bot_id',
    );
    if (!sourceBotId) {
      return undefined;
    }

    return {
      id: sourceBotId,
      type: 'bot',
    };
  }

  private async setDefaultCase(workflowJSON?: WorkflowJSON) {
    const userInfo = userStoreService.getUserInfo();

    const startNode = workflowJSON?.nodes?.find(
      node => node.type === StandardNodeType.Start,
    );

    /* will support soon */
    if (IS_OPEN_SOURCE) {
      return;
    }

    const caseData = await debuggerApi.MGetCaseData({
      bizCtx: {
        connectorID: TESTSET_CONNECTOR_ID,
        bizSpaceID: this.globalState.spaceId,
        connectorUID: userInfo?.user_id_str,
      },
      bizComponentSubject: {
        componentType: ComponentType.CozeStartNode,
        parentComponentType: ComponentType.CozeWorkflow,
        componentID: startNode?.id,
        parentComponentID: this.globalState.workflowId,
      },
      caseName: undefined,
      pageLimit: 1, // Default test set data will only be in the first
    });

    const defaultCaseData = caseData?.cases?.find(
      item => item?.caseBase?.isDefault,
    );

    if (defaultCaseData) {
      this.caseCaches = getTestDataByTestset(defaultCaseData);
    }
  }

  getDefaultCaseCaches() {
    return this.caseCaches;
  }

  genSaveTypeFormCaches() {
    let res: SaveType | undefined = undefined;
    const caseData = this.getDefaultCaseCaches();

    if (caseData?.[FieldName.Bot]?.id) {
      res = {
        id: caseData?.[FieldName.Bot]?.id,
        type:
          caseData[FieldName.Bot]?.type === IntelligenceType.Project
            ? 'project'
            : 'bot',
      };
    }

    return res;
  }

  async getAsyncRelatedBotValue(workflowJSON?: WorkflowJSON) {
    const { workflowId } = this.globalState;
    if (!workflowId) {
      return undefined;
    }

    if (!this.setCasePromise) {
      this.setCasePromise = this.setDefaultCase(workflowJSON);
    }

    const store = localStorage.getItem(STORAGE_KEY);

    const jsonStore = typeSafeJSONParse(store);

    let res: SaveType | undefined = undefined;

    if (typeof jsonStore === 'object') {
      res = jsonStore?.[`${workflowId}`];
    }

    if (!res) {
      try {
        await this.setCasePromise;
        res = this.genSaveTypeFormCaches();
      } catch (e) {
        console.error('getDefaultCase Error: ', e);
      }
    }

    const urlBot = this.getURLSearchParamsBotId();

    if (urlBot) {
      res = urlBot;
    }

    return res;
  }

  getRelatedBotValue() {
    const { workflowId } = this.globalState;
    if (!workflowId) {
      return undefined;
    }

    const store = localStorage.getItem(STORAGE_KEY);

    const jsonStore = typeSafeJSONParse(store);

    let res: SaveType | undefined = undefined;

    if (typeof jsonStore === 'object') {
      res = jsonStore?.[`${workflowId}`];
    }

    if (!res) {
      res = this.genSaveTypeFormCaches();
    }

    const urlBot = this.getURLSearchParamsBotId();

    if (urlBot) {
      res = urlBot;
    }

    return res;
  }

  updateRelatedBot(value?: SaveType, targetWorkflowId?: string) {
    const workflowId = targetWorkflowId || this.globalState.workflowId;

    if (!workflowId) {
      return;
    }

    const store = localStorage.getItem(STORAGE_KEY);
    let jsonStore = typeSafeJSONParse(store) as Record<string, SaveType>;

    if (!jsonStore || typeof jsonStore !== 'object') {
      jsonStore = {};
    }

    if (!value) {
      delete jsonStore[`${workflowId}`];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(jsonStore));
    } else {
      jsonStore[`${workflowId}`] = value;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(jsonStore));
    }
  }

  clear() {
    localStorage.removeItem(STORAGE_KEY);
  }
}
