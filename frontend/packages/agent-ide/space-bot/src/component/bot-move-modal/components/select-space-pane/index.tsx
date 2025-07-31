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

import React, { useState } from 'react';

import { size } from 'lodash-es';
import { I18n } from '@coze-arch/i18n';
import { useSpaceList } from '@coze-arch/bot-studio-store';
import { type BotSpace, SpaceType } from '@coze-arch/bot-api/developer_api';

import { SelectorItem } from '../selector-item';

export function useSelectSpacePane() {
  const { spaces } = useSpaceList();
  const [targetSpace, setTargetSpace] = useState<BotSpace | null>(null);

  const personalSpace = spaces.find(
    item => item.space_type === SpaceType.Personal,
  );
  const teamSpaces = spaces.filter(item => item.space_type === SpaceType.Team);

  const selectSpacePane = (
    <div className="flex flex-col">
      <div className="w-full border-[0.5px] border-solid coz-stroke-primary mb-[12px]"></div>
      <div className="flex flex-col max-h-[406px] overflow-y-auto">
        <div className="text-[12px] leading-[16px] font-[500] coz-fg-primary text-left align-top w-full mb-[6px]">
          {I18n.t('menu_title_personal_space')}
        </div>
        <div>
          <div className="flex flex-col rounded-[6px] overflow-hidden mb-[16px]">
            <SelectorItem space={personalSpace} disabled />
          </div>
        </div>
        <div className="text-[12px] leading-[16px] font-[500] coz-fg-primary text-left align-top w-full mb-[6px]">
          {I18n.t('resource_move_target_team')}
        </div>
        <div>
          <div className="flex flex-col rounded-[6px] overflow-hidden">
            {size(teamSpaces) > 0 ? (
              spaces
                .filter(item => item.space_type !== SpaceType.Personal)
                .map(item => (
                  <SelectorItem
                    key={item.id}
                    space={item}
                    selected={item.id === targetSpace?.id}
                    onSelect={space => {
                      setTargetSpace(space);
                    }}
                  />
                ))
            ) : (
              <SelectorItem
                space={{
                  // MOCK: used to show the bottom of the cover without joining any space
                  name: I18n.t('resource_move_no_team_joined'),
                }}
                disabled
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return {
    targetSpace,
    setTargetSpace,
    selectSpacePane,
  };
}
