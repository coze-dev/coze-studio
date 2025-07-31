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

import { type ReactNode, useState } from 'react';

import cls from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { IconCozInfoCircle } from '@coze-arch/coze-design/icons';
import { Search, Tooltip } from '@coze-arch/coze-design';
import { type ILevelSegment } from '@coze-data/knowledge-stores';

import MergeOperation from '../assets/merge-operation.png';
import MergeOperationEn from '../assets/merge-operation-en.png';
import LevelOperation from '../assets/level-operation.png';
import DeleteOperation from '../assets/delete-operation.png';
import DeleteOperationEn from '../assets/delete-operation-en.png';
import { SegmentTree } from './segment-tree';
import DocumentItem from './document-item';
interface IMenuItem {
  id: string;
  title: string;
  label?: ReactNode;
  tag?: ReactNode;
  tosUrl?: string;
}

interface ISegmentMenuProps {
  list: IMenuItem[];
  onClick?: (id: string) => void;
  selectedID?: string;
  isSearchable?: boolean;
  treeVisible?: boolean;
  treeDisabled?: boolean;
  levelSegments?: ILevelSegment[];
  setLevelSegments?: (segments: ILevelSegment[]) => void;
  setSelectionIDs?: (ids: string[]) => void;
}

const SegmentMenu: React.FC<ISegmentMenuProps> = props => {
  const {
    isSearchable,
    list,
    onClick,
    selectedID,
    levelSegments,
    setLevelSegments,
    setSelectionIDs,
    treeDisabled,
    treeVisible,
  } = props;
  const [searchValue, setSearchValue] = useState('');

  return (
    <div className="flex flex-col grow w-full h-full">
      {isSearchable ? (
        <Search
          value={searchValue}
          placeholder={I18n.t('datasets_placeholder_search')}
          onChange={setSearchValue}
        />
      ) : null}
      <div className="pl-2 h-6 mt-4 mb-1 flex items-center">
        <div className="coz-fg-secondary text-[12px] font-[400] leading-4 shrink-0">
          {/**document list */}
          {I18n.t('knowledge_level_012')}
        </div>
      </div>
      <div className="flex flex-col grow w-full">
        <div className="flex flex-col gap-1 h-[150px] grow !overflow-auto shrink-0">
          {list
            .filter(item => item.title.includes(searchValue))
            .map(document => {
              if (document.id !== '') {
                return (
                  <DocumentItem
                    key={document.id}
                    id={document.id}
                    selected={document.id === selectedID}
                    onClick={onClick}
                    title={document.title}
                    tag={document.tag}
                    label={document.label}
                  />
                );
              } else {
                return null;
              }
            })}
        </div>

        {levelSegments?.length && treeVisible ? (
          <>
            <div className="h-4 flex justify-center items-center px-[8px] mb-[8px]">
              <div
                className={cls(
                  'border border-solid border-[0.5px] transition w-full',
                  'coz-stroke-primary',
                )}
              />
            </div>
            <div className="flex flex-col gap-1 !overflow-auto">
              <div className="w-full pl-2 h-6 items-center flex gap-[4px]">
                <div className="coz-fg-secondary text-[12px] font-[400] leading-4 shrink-0">
                  {/**segment hierarchy */}
                  {I18n.t('knowledge_level_adjust')}
                </div>
                {treeDisabled ? null : (
                  <Tooltip
                    style={{
                      maxWidth: 602,
                    }}
                    position="left"
                    content={
                      <>
                        <div className="coz-fg-plus text-[14px] font-[500] leading-[20px] mb-3">
                          {I18n.t('knowledge_hierarchies_categories')}
                        </div>
                        <div className="flex gap-2">
                          <div className="flex flex-col gap-1 justify-between w-[182px]">
                            <span className="coz-fg-primary text-[12px] leading-[16px] font-[400]">
                              {I18n.t('level_999')}
                            </span>
                            <img src={LevelOperation} className="w-[182px]" />
                          </div>
                          <div className="flex flex-col gap-1 justify-between w-[182px]">
                            <span className="coz-fg-primary text-[12px] leading-[16px] font-[400]">
                              {I18n.t('level_998')}
                            </span>
                            <img
                              src={
                                IS_OVERSEA ? MergeOperationEn : MergeOperation
                              }
                              className="w-[182px]"
                            />
                          </div>
                          <div className="flex flex-col gap-1 justify-between w-[182px]">
                            <span className="coz-fg-primary text-[12px] leading-[16px] font-[400]">
                              {I18n.t('level_997')}
                            </span>
                            <img
                              src={
                                IS_OVERSEA ? DeleteOperationEn : DeleteOperation
                              }
                              className="w-[182px]"
                            />
                          </div>
                        </div>
                      </>
                    }
                  >
                    <IconCozInfoCircle className="coz-fg-secondary" />
                  </Tooltip>
                )}
              </div>
              <div className="h-[360px]">
                <SegmentTree
                  segments={levelSegments}
                  setLevelSegments={setLevelSegments}
                  setSelectionIDs={setSelectionIDs}
                  disabled={treeDisabled}
                />
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default SegmentMenu;
