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

import { type IntelligenceData } from '@coze-arch/idl/intelligence_api';
import { I18n } from '@coze-arch/i18n';
import { Typography } from '@coze-arch/coze-design';
import { formatDate, getFormatDateType } from '@coze-arch/bot-utils';

import { highlightService } from '../services/use-case-services/highlight-text.service';

interface IntelligenceItemProps {
  intelligence: IntelligenceData;
  searchValue: string;
  onClick: () => void;
}

export const IntelligenceItem: React.FC<IntelligenceItemProps> = ({
  intelligence,
  searchValue,
  onClick,
}) => {
  const { basic_info } = intelligence;

  return (
    <div
      className="rounded-lg hover:coz-mg-secondary-hovered cursor-pointer h-[80px] box-border"
      onClick={onClick}
    >
      <div className="flex items-center gap-[14px] px-3 h-full">
        <img
          src={basic_info?.icon_url}
          className="flex-shrink-0 w-[52px] h-[52px] rounded-lg"
          alt={basic_info?.name}
        />
        <div className="w-full overflow-hidden flex flex-col gap-1 justify-center border-b-[0.6px] border-solid border-0 coz-stroke-primary pb-3 pt-2 h-full">
          <div className="font-medium text-sm">
            <Typography.Text className="text-[16px] !font-medium w-full">
              {highlightService.highlightText(
                basic_info?.name || '',
                searchValue,
              )}
            </Typography.Text>
          </div>
          {basic_info?.description ? (
            <div className="text-sm leading-4 coz-fg-secondary">
              <Typography.Text
                className="text-sm w-full"
                ellipsis={{
                  rows: 1,
                }}
              >
                {highlightService.highlightText(
                  basic_info?.description || '',
                  searchValue,
                )}
              </Typography.Text>
            </div>
          ) : null}
          <div className="text-xs coz-fg-secondary flex items-center gap-1">
            <div className="text-xs coz-fg-secondary">
              {I18n.t('bot_list_rank_tag_edited')}
            </div>
            <div className="text-xs coz-fg-secondary">
              {formatDate(
                Number(basic_info?.update_time),
                getFormatDateType(Number(basic_info?.update_time)),
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
