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

import React from 'react';

import { size } from 'lodash-es';
import { useRequest, useUnmount } from 'ahooks';
import { I18n } from '@coze-arch/i18n';
import { MoveAction } from '@coze-arch/bot-api/playground_api';
import { type BotSpace } from '@coze-arch/bot-api/developer_api';
import { PlaygroundApi } from '@coze-arch/bot-api';

import { SelectorItem } from '../selector-item';
import { ItemGridView } from '../item-grid-view';

interface IMoveDetailPaneProps {
  targetSpace: BotSpace | null;
  botID: string;
  fromSpaceID: string;
  onUnmount?: () => void;
  onDetailLoaded?: () => void;
}

export function MoveDetailPane(props: IMoveDetailPaneProps) {
  const { targetSpace, botID, fromSpaceID, onUnmount, onDetailLoaded } = props;

  const { data: moveDetails } = useRequest(
    async () => {
      const data = await PlaygroundApi.MoveDraftBot({
        bot_id: botID,
        target_spaceId: targetSpace.id,
        from_spaceId: fromSpaceID,
        move_action: MoveAction.Preview,
      });
      return {
        ...data?.async_task,
        cannotMove: data?.forbid_move,
      };
    },
    {
      onSuccess: data => {
        if (data && !data.cannotMove) {
          onDetailLoaded?.();
        }
      },
    },
  );

  useUnmount(() => {
    onUnmount?.();
  });

  return (
    <div className="flex flex-col">
      <div className="w-full border-[0.5px] border-solid coz-stroke-primary mb-[12px]"></div>
      <div className="flex flex-col max-h-[406px] overflow-y-auto">
        <div className="text-[12px] leading-[16px] font-[500] coz-fg-primary text-left align-top w-full mb-[6px]">
          {I18n.t('resource_move_target_team')}
        </div>
        <div>
          <div className="flex flex-col rounded-[6px] overflow-hidden mb-[16px]">
            <SelectorItem space={targetSpace} selected disabled />
          </div>
        </div>
        {moveDetails?.cannotMove ? (
          <div className="flex items-center gap-x-[8px] p-[12px] w-full coz-mg-hglt-red rounded-[4px] mb-[12px]">
            <p className="text-[12px] leading-[16px] font-[400] coz-fg-hglt-red text-left align-top grow">
              {I18n.t('move_not_allowed_contain_bot_nodes')}
            </p>
          </div>
        ) : null}
        {!moveDetails?.cannotMove &&
        (size(moveDetails?.transfer_resource_plugin_list) ||
          size(moveDetails?.transfer_resource_workflow_list) ||
          size(moveDetails?.transfer_resource_knowledge_list)) ? (
          <>
            <div className="text-[12px] leading-[16px] font-[500] coz-fg-primary text-left align-top w-full mb-[6px]">
              {I18n.t('resource_move_together')}
            </div>
            <div className="flex items-center gap-x-[8px] p-[8px] w-full coz-mg-hglt-red rounded-[4px] mb-[12px]">
              <p className="text-[12px] leading-[16px] font-[400] coz-fg-hglt-red text-left align-top grow">
                {I18n.t('resource_move_together_desc')}
              </p>
            </div>
            {size(moveDetails?.transfer_resource_plugin_list) > 0 ? (
              <ItemGridView
                title={I18n.t('store_search_recommend_result2')}
                resources={moveDetails.transfer_resource_plugin_list.map(
                  item => ({
                    ...item,
                    spaceID: fromSpaceID,
                  }),
                )}
                onResourceClick={(id, spaceID) => {
                  window.open(`/space/${spaceID}/plugin/${id}`);
                }}
              />
            ) : null}
            {size(moveDetails?.transfer_resource_workflow_list) > 0 ? (
              <ItemGridView
                title={I18n.t('store_search_recommend_result3')}
                resources={moveDetails.transfer_resource_workflow_list.map(
                  item => ({
                    ...item,
                    spaceID: fromSpaceID,
                  }),
                )}
                onResourceClick={(id, spaceID) => {
                  window.open(
                    `/work_flow?space_id=${spaceID}&workflow_id=${id}`,
                  );
                }}
              />
            ) : null}
            {size(moveDetails?.transfer_resource_knowledge_list) > 0 ? (
              <ItemGridView
                title={I18n.t('performance_knowledge')}
                resources={moveDetails.transfer_resource_knowledge_list.map(
                  item => ({
                    ...item,
                    spaceID: fromSpaceID,
                  }),
                )}
                onResourceClick={(id, spaceID) => {
                  window.open(`/space/${spaceID}/knowledge/${id}`);
                }}
              />
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
