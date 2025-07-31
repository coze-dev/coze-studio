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

import { useEffect, useRef, type FC } from 'react';

import { debounce } from 'lodash-es';
import { I18n } from '@coze-arch/i18n';
import { Space, UIButton, UISearch, Spin, UIEmpty } from '@coze-arch/bot-semi';
import { IconSegmentEmpty } from '@coze-arch/bot-icons';

import { type FileBoxListProps, FileBoxListType } from './types';
import { useFileBoxListStore } from './store';
import { ImageList } from './image-list';
import { useUploadModal } from './hooks/use-upload-modal';
import { useFileList } from './hooks/use-file-list';
import { FileBoxFilter } from './filebox-filter';
import { DocumentList } from './document-list';

import s from './index.module.less';

export const FileBoxList: FC<FileBoxListProps> = props => {
  const { botId } = props;

  const searchValue = useFileBoxListStore(state => state.searchValue);
  const setSearchValue = useFileBoxListStore(state => state.setSearchValue);
  const fileListType = useFileBoxListStore(state => state.fileListType);

  const ref = useRef<HTMLDivElement>(null);

  const { data, loading, loadingMore, reloadAsync, noMore } = useFileList(
    {
      botId,
      searchValue,
      type: fileListType,
    },
    {
      isNoMore: d => !!(d && d.list.length >= d.total),
      target: ref,
    },
  );

  // Manually control data loading timing
  useEffect(() => {
    if (botId) {
      reloadAsync();

      // When reloading, return to the top
      ref.current?.scrollTo?.({
        top: 0,
        behavior: 'smooth',
      });
    }
  }, [searchValue, botId, fileListType]);

  const items = data?.list || [];

  const { open, node } = useUploadModal({ botId, fileListType, reloadAsync });

  const debounceSearch = debounce((v: string) => {
    setSearchValue(v);
  }, 300);

  const isImage = fileListType === FileBoxListType.Image;

  const getEmptyTitle = () => {
    if (searchValue) {
      return I18n.t(isImage ? 'filebox_010' : 'filebox_011');
    }
    return I18n.t(isImage ? 'filebox_0017' : 'filebox_0025');
  };

  return (
    <div className={s['filebox-list']}>
      <div className={s.header}>
        {/* Switch images/documents */}
        <FileBoxFilter />

        <Space spacing={12}>
          {/* search box */}
          <UISearch
            placeholder={I18n.t(
              'card_builder_dataEditor_get_errormsg_please_enter',
            )}
            onChange={debounceSearch}
          />

          {/* Upload button */}
          <UIButton type="primary" theme="solid" onClick={open}>
            {I18n.t('datasets_createFileModel_step2')}
          </UIButton>
        </Space>
      </div>
      <div className={s['file-list']} ref={ref}>
        <Spin
          spinning={loading}
          wrapperClassName={s['file-list-spin']}
          childStyle={{
            height: '100%',
            width: '100%',
            // Prevent inconsistent number of items when switching fileListType, causing loading to flicker
            display: loading ? 'none' : 'block',
          }}
        >
          {items.length <= 0 ? (
            <UIEmpty
              empty={{
                icon: <IconSegmentEmpty />,
                title: getEmptyTitle(),
              }}
            />
          ) : isImage ? (
            <ImageList images={items} reloadAsync={reloadAsync} {...props} />
          ) : (
            <DocumentList
              documents={items}
              reloadAsync={reloadAsync}
              {...props}
            />
          )}
        </Spin>
        <div className={s.footer}>
          {!noMore && (
            <Spin
              spinning={loadingMore}
              tip={I18n.t('loading')}
              wrapperClassName={s.spin}
            />
          )}
        </div>
      </div>
      {node}
    </div>
  );
};
