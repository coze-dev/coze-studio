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

import {
  useEffect,
  type RefObject,
  useState,
  useRef,
  type ForwardedRef,
  forwardRef,
  useImperativeHandle,
} from 'react';

import { I18n } from '@coze-arch/i18n';
import { IconCozPlus } from '@coze-arch/coze-design/icons';

import EmptyLibraryIcon from '../assets/empty-library-icon.svg';
import {
  type LibraryInfo,
  type LibraryListRequest,
  type LibraryListResponse,
} from './library-request';
import { LibraryItem } from './library-item';
import { InfiniteList, type InfiniteListRef } from './infinite-list';
export type { InfiniteListRef };
interface LibraryListProps {
  searchWord?: string | undefined;
  category: 'Recommended' | 'Team';
  spaceId: string;
  size: number;
  targetRef: RefObject<HTMLDivElement>;
  onActive: (id: string) => void;
  onEditAction: (id: string) => void;
  onDeleteAction: (id: string) => void;
  getData: (req: LibraryListRequest) => Promise<LibraryListResponse>;
  onChangeState?: (isLoading: boolean, dataList: LibraryInfo[]) => void;
  onEmptyClick?: () => void;
}

export const Index = (
  props: LibraryListProps,
  ref: ForwardedRef<InfiniteListRef<LibraryInfo>>,
) => {
  const {
    getData,
    onActive,
    searchWord,
    category,
    targetRef,
    size,
    onChangeState,
    onDeleteAction,
    onEditAction,
    spaceId,
    onEmptyClick,
  } = props;
  const listRef = useRef<InfiniteListRef<LibraryInfo>>(null);
  const [dataList, setDataList] = useState<LibraryInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLibraryId, setSelectedLibraryId] = useState<string>('');

  // Switch tabs, the first one is selected by default
  useEffect(() => {
    if (!dataList.length || isLoading) {
      return;
    }
    const firstLibraryId = dataList[0].id;
    setSelectedLibraryId(firstLibraryId);
    onActive?.(firstLibraryId);
  }, [dataList, isLoading]);

  useImperativeHandle(
    ref,
    () => ({
      reload: listRef.current?.reload ?? (() => void 0),
      getDataList: listRef.current?.getDataList ?? (() => []),
    }),
    [],
  );
  return (
    <InfiniteList<LibraryInfo>
      ref={listRef}
      isNeedBtnLoadMore={false}
      onChangeState={(newIsLoading, newDataList) => {
        onChangeState?.(newIsLoading, newDataList);
        setDataList(newDataList);
        setIsLoading(newIsLoading);
      }}
      renderItem={(card: LibraryInfo) => (
        <LibraryItem
          key={card.id}
          id={card.id}
          title={card.name}
          description={card.description}
          actions={card.actions}
          isSelected={selectedLibraryId === card.id}
          onActive={id => {
            onActive?.(id);
            setSelectedLibraryId(id);
          }}
          onEditAction={id => {
            onEditAction?.(id);
          }}
          onDeleteAction={id => {
            onDeleteAction?.(id);
          }}
        />
      )}
      scrollConf={{
        reloadDeps: [searchWord, category],
        targetRef,
        loadData: current =>
          getData({
            cursor: current?.cursor ?? '0',
            searchWord: searchWord ?? '',
            category,
            spaceId,
            size,
          }),
      }}
      emptyConf={{
        className: 'flex flex-col items-center justify-center h-full',
        icon: <img src={EmptyLibraryIcon} alt="empty-library" />,
        size: 'full_screen',
        text: {
          emptyTitle: I18n.t('prompt_library_empty_title'),
          emptyDesc: I18n.t('prompt_library_empty_describe'),
        },
        btn: {
          emptyText: I18n.t('prompt_library_new_prompt'),
          emptyButtonProps: {
            type: 'primary',
            className:
              '!coz-mg-hglt !coz-fg-hglt hover:!coz-mg-hglt-hovered active:!coz-mg-hglt-pressed',
            icon: <IconCozPlus />,
            onClick: () => {
              onEmptyClick?.();
            },
          },
        },
      }}
    />
  );
};
export const LibraryList = forwardRef(Index) as <T>(
  props: LibraryListProps & { ref?: RefObject<InfiniteListRef<T>> },
) => JSX.Element;
