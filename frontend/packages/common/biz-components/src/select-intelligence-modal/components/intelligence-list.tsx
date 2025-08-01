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
import { IconCozLoading, IconCozEmpty } from '@coze-arch/coze-design/icons';
import { Spin, IconButton } from '@coze-arch/coze-design';

import { IntelligenceItem } from './intelligence-item';

interface IntelligenceListProps {
  loading: boolean;
  loadingMore: boolean;
  noMore: boolean;
  data?: {
    list: IntelligenceData[];
    hasMore: boolean;
  };
  searchValue: string;
  onSelect: (intelligence: IntelligenceData) => void;
}

export const IntelligenceList: React.FC<IntelligenceListProps> = ({
  loading,
  loadingMore,
  noMore,
  data,
  searchValue,
  onSelect,
}) => {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spin />
      </div>
    );
  }

  if (!data?.list.length) {
    return (
      <div className="flex flex-col justify-center items-center w-full h-full">
        <IconCozEmpty className="w-[48px] h-[48px] coz-fg-dim" />
        <div className="text-sm coz-fg-primary mt-2">
          {I18n.t('select_agent_no_result')}
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      {/* upper mask */}
      <div className="sticky top-0 left-0 right-0 h-[20px] bg-gradient-to-b from-[rgba(255,255,255,1)] to-transparent pointer-events-none z-10" />

      {/* list content */}
      <div className="styled-scrollbar">
        {data.list.map(intelligence => (
          <IntelligenceItem
            key={intelligence.basic_info?.id}
            intelligence={intelligence}
            searchValue={searchValue}
            onClick={() => onSelect(intelligence)}
          />
        ))}

        {loadingMore ? (
          <div className="flex items-center justify-center h-[38px] my-[20px] text-[12px]">
            <IconButton icon={<IconCozLoading />} loading color="secondary" />
            <div>{I18n.t('Loading')}...</div>
          </div>
        ) : null}

        {noMore && data.list.length > 0 ? (
          <div className="h-[38px] my-[20px]" />
        ) : null}
      </div>

      {/* lower mask */}
      <div className="sticky bottom-0 left-0 right-0 h-[20px] bg-gradient-to-t from-[rgba(255,255,255,1)] to-transparent pointer-events-none z-10" />
    </div>
  );
};
