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

import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { Tag, Tooltip } from '@coze-arch/coze-design';

import {
  getFilterPagesString,
  getSortedFilterPages,
} from '../../utils/render-document-filter-value';
import { DocumentItem } from './document-item';

interface FilterPageConfig {
  pageIndex: number;
  isFilter: boolean;
}

interface Document {
  // TODO: Expansion
  id: string;
  title: string;
  /** Is there filtered content? */
  filterPageConfigList: FilterPageConfig[];
}

interface IDocumentListProps {
  documents: Document[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const DocumentList = (props: IDocumentListProps) => (
  <div className={classNames('flex flex-col gap-1 h-full', props.className)}>
    <div className="w-full pl-2 h-6 items-center flex">
      <div className="coz-fg-secondary text-[12px] font-[400] leading-4 shrink-0">
        {I18n.t('kl_write_105')}
      </div>
    </div>
    <div className="flex flex-col gap-1 h-[150px] !overflow-scroll shrink-0">
      {props.documents.map(document => {
        if (!document.id) {
          return null;
        }
        const filterPages = getSortedFilterPages(document.filterPageConfigList);
        const isFiltered = Boolean(filterPages.length);
        const filterPagesString = getFilterPagesString(filterPages);

        return (
          <DocumentItem
            id={document.id}
            selected={document.id === props.value}
            onClick={id => {
              props.onChange(id);
            }}
            title={document.title}
            addonAfter={
              isFiltered ? (
                <Tooltip
                  content={I18n.t('data_filter_values', {
                    filterPages: filterPagesString,
                  })}
                >
                  <Tag color="primary" className="flex-shrink-0">
                    {I18n.t('knowledge_new_002')}
                  </Tag>
                </Tooltip>
              ) : null
            }
          />
        );
      })}
    </div>
  </div>
);
