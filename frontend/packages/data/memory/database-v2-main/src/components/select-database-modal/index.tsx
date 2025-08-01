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

/* eslint-disable max-lines */
import React, {
  useState,
  type FC,
  useRef,
  useEffect,
  type ReactNode,
} from 'react';

import { debounce } from 'lodash-es';
import classNames from 'classnames';
import { useInfiniteScroll } from 'ahooks';
import { IllustrationNoContent } from '@douyinfe/semi-illustrations';
import { IconSpin } from '@douyinfe/semi-icons';
import { userStoreService } from '@coze-studio/user-store';
import { type DatabaseInfo as DatabaseInitInfo } from '@coze-studio/bot-detail-store';
import { DatabaseCreateTableModal } from '@coze-data/database-v2-adapter/components/create-table-modal';
import { getUnReactiveLanguage, I18n } from '@coze-arch/i18n';
import {
  Image,
  UICompositionModal,
  UICompositionModalMain,
  UICompositionModalSider,
} from '@coze-arch/bot-semi';
import { IconCozArrowDown } from '@coze-arch/bot-icons';
import {
  BotTableRWMode,
  type DatabaseInfo,
  TableType,
  SortDirection,
  type SingleDatabaseResponse,
} from '@coze-arch/bot-api/memory';
import { FormatType } from '@coze-arch/bot-api/knowledge';
import { MemoryApi, KnowledgeApi } from '@coze-arch/bot-api';
import {
  Button,
  Dropdown,
  Input,
  Tag,
  Popover,
  Spin,
  Select,
  Empty,
} from '@coze-arch/coze-design';

import { useLibraryCreateDatabaseModal } from '../../hooks/use-library-create-database-modal';
import tipsTemplateEN from '../../assets/tips-template-en.png';
import tipsTemplateCN from '../../assets/tips-template-cn.png';
import SiderCategory from './sider-category';
import { DatabaseListItem } from './items';

import styles from './index.module.less';

interface SelectDatabaseModalProps {
  visible: boolean;
  onClose: () => void;
  onAddDatabase: (id: string, addCallback?: () => void) => void;
  onRemoveDatabase?: (id: string, removeCallback?: () => void) => void;
  onClickDatabase: (id: string) => void;
  onCreateDatabase?: (id: string, draftId: string) => void;
  enterFrom: string;
  botId?: string;
  workflowId?: string;
  spaceId: string;
  workflowAddList?: string[];
  projectID?: string;
  tips?: ReactNode;
}

interface GetDatabaseListData {
  list: DatabaseInfo[];
  nextOffset: number;
  total: number;
  hasMore: boolean | undefined;
}

enum ModalMode {
  CUSTOMIZE = 'customize',
  TEMPLATE = 'template',
}

// eslint-disable-next-line @coze-arch/max-line-per-function, max-lines-per-function
export const useSelectDatabaseModal = ({
  visible,
  onClose,
  onAddDatabase,
  onRemoveDatabase,
  onClickDatabase,
  onCreateDatabase,
  enterFrom,
  botId,
  spaceId,
  workflowAddList = [],
  projectID,
  tips,
}: SelectDatabaseModalProps) => {
  const language = getUnReactiveLanguage();
  const userInfo = userStoreService.useUserInfo();

  const scrollRef = useRef<HTMLDivElement>(null);

  const [category, setCategory] = useState<'library' | 'project'>(
    projectID ? 'project' : 'library',
  );

  // dropdown visible
  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);
  // whether there is a shadow on th bottom
  const [showBottomShadow, setShowBottomShadow] = useState(true);
  // filter creator
  const [filterCreator, setFilterCreator] = useState<string>('all');
  // sotr method
  const [sort, setSort] = useState<string>('create_time');
  // search value
  const [keyword, setKeyword] = useState<string>('');
  // create table init value
  const [initValue, setInitValue] = useState<DatabaseInitInfo>({
    tableId: '',
    name: '',
    desc: '',
    icon_uri: '',
    readAndWriteMode: BotTableRWMode.LimitedReadWrite,
    tableMemoryList: [],
  });
  // modal visible
  const [createVisible, setCreateVisible] = useState<boolean>(false);

  const fetchDatabaseList = async (reqParams: {
    key_word: string;
    filter_creator: string;
    page_offset: number;
    sort_by: string;
  }) => {
    const { key_word, filter_creator, page_offset, sort_by } = reqParams;
    const res = await MemoryApi.ListDatabase({
      ...(category === 'project' ? { project_id: projectID } : {}),
      bot_id: enterFrom === 'bot' ? botId : '0',
      space_id: spaceId,
      table_type:
        enterFrom === 'bot' ? TableType.DraftTable : TableType.OnlineTable,
      table_name: key_word,
      creator_id: filter_creator === 'all' ? '0' : filter_creator,
      // Do not do paging loading for the time being
      limit: 50,
      offset: page_offset,
      order_by: [
        {
          field: sort_by,
          direction: SortDirection.Desc,
        },
      ],
    });
    return {
      list: res.database_info_list || [],
      nextOffset: page_offset + 1,
      total: res.total_count as number,
      hasMore: res.has_more,
    };
  };

  const { loading, data, loadingMore, reload } = useInfiniteScroll(
    (newData?: GetDatabaseListData): Promise<GetDatabaseListData> =>
      fetchDatabaseList({
        key_word: keyword,
        filter_creator: filterCreator,
        page_offset: newData?.nextOffset || 0,
        sort_by: sort,
      }),
    {
      manual: true,
      // true meas there is more data
      isNoMore: newData => Boolean(!newData?.total || !newData.hasMore),
      reloadDeps: [keyword, filterCreator, sort, category, projectID],
      target: scrollRef,
    },
  );

  // onScroll Determines whether scrollRef bottoms out
  const handleScroll = () => {
    if (!scrollRef.current) {
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const scrollBottom = scrollHeight - (scrollTop + clientHeight);

    if (scrollBottom < 1) {
      setShowBottomShadow(false);
    } else {
      setShowBottomShadow(true);
    }
  };

  const handleAddDatabase = (item: DatabaseInfo) => {
    if (onAddDatabase && item.id) {
      onAddDatabase?.(item.id, reload);
    }
  };

  const handleRemoveDatabase = (item: DatabaseInfo) => {
    if (onRemoveDatabase && item.id) {
      onRemoveDatabase?.(item.id, reload);
    }
  };

  const handleClickDatabase = (item: DatabaseInfo) => {
    if (onClickDatabase && item.id) {
      onClickDatabase?.(item.id);
    }
  };

  const openCreateTableModal = (mode: ModalMode) => {
    if (mode === ModalMode.TEMPLATE) {
      setInitValue({
        ...initValue,
        name: 'reading_notes',
        desc: 'for saving reading notes',
        readAndWriteMode: BotTableRWMode.LimitedReadWrite,
        extra_info: {
          prompt_disabled: 'true',
        },
        tableMemoryList: [
          {
            name: 'name',
            desc: '',
            type: 1,
            must_required: true,
          },
          {
            name: 'section',
            desc: '',
            type: 2,
            must_required: true,
          },
          {
            name: 'note',
            desc: '',
            type: 1,
            must_required: true,
          },
        ],
      });
    } else {
      setInitValue({
        tableId: '',
        name: '',
        desc: '',
        readAndWriteMode: BotTableRWMode.LimitedReadWrite,
        tableMemoryList: [],
      });
    }
    setCreateVisible(true);
  };

  const renderTemplateTips = () => (
    <div className={styles['tips-wrapper']}>
      <div className={styles['tip-title']}>{I18n.t('db2_018')}:</div>
      <p className="my-[8px]">
        💡 <em className={styles['tip-desc']}>{I18n.t('db2_019')}:</em>
      </p>
      <Image
        height={136}
        src={language === 'zh-CN' ? tipsTemplateCN : tipsTemplateEN}
      />
      <div className={styles['tip-title']}>{I18n.t('db2_020')}:</div>
      <div className={styles['bot-bg']}>
        <div className={classNames(styles['bot-item'], 'mb-[12px]')}>
          <div className={classNames(styles['bot-img'], styles['img-user'])}>
            {I18n.t('db2_021')}
          </div>
          <div
            className={classNames(
              styles['bot-content'],
              styles['content-user'],
            )}
          >
            {I18n.t('db2_022')}
          </div>
        </div>

        <div className={styles['bot-item']}>
          <div className={classNames(styles['bot-img'], styles['img-bot'])}>
            {I18n.t('db2_023')}
          </div>
          <div
            className={classNames(styles['bot-content'], styles['content-bot'])}
          >
            {I18n.t('db2_024')}
          </div>
        </div>
      </div>
    </div>
  );

  const renderInput = () => (
    <Input
      placeholder={I18n.t('db2_014')}
      className="w-full"
      value={keyword}
      onChange={debounce(v => {
        setKeyword(v);
      }, 500)}
    />
  );

  const renderFilter = () => (
    <div className="flex flex-row items-center w-full justify-between pr-[12px]">
      <div className={classNames(styles.select, 'flex flex-row flex-1')}>
        <div className="flex flex-row items-center">
          <Select
            showArrow
            size="default"
            className="border-none ml-[4px] hover:border-none bg-transparent outline-none"
            value={filterCreator}
            onChange={v => setFilterCreator(v as string)}
            insetLabel={<p className={styles.label}>{I18n.t('db2_009')}</p>}
          >
            <Select.Option value={'all'} label={I18n.t('db2_010')} />
            {userInfo ? (
              <Select.Option
                value={userInfo.user_id_str}
                label={userInfo.name}
                key={userInfo.user_id_str}
              />
            ) : null}
          </Select>
        </div>
        <div className="flex flex-row items-center ml-[12px]">
          <Select
            showArrow
            size="default"
            className="border-none ml-[4px] hover:border-none bg-transparent outline-none"
            value={sort}
            onChange={v => setSort(v as string)}
            insetLabel={<p className={styles.label}>{I18n.t('db2_011')}</p>}
          >
            <Select.Option value="create_time" label={I18n.t('db2_012')} />
            <Select.Option value="update_time" label={I18n.t('db2_013')} />
          </Select>
        </div>
      </div>
    </div>
  );

  const renderList = () => (
    <div
      className="overflow-y-auto relative h-full"
      ref={scrollRef}
      onScroll={handleScroll}
    >
      {/* FIXME: This needs to be rendered according to the actual situation. */}
      {data?.list.map((item, index) => (
        <DatabaseListItem
          icon={item.icon_url}
          title={item.table_name}
          description={item.table_desc}
          isAdd={
            enterFrom === 'workflow'
              ? Boolean(
                  item.id &&
                    workflowAddList?.length &&
                    workflowAddList?.includes(item.id),
                )
              : Boolean(item.is_added_to_bot)
          }
          onClick={() => handleClickDatabase(item)}
          onAdd={() => handleAddDatabase(item)}
          onRemove={() => handleRemoveDatabase(item)}
          key={index}
        />
      ))}
      {loadingMore ? (
        <div className={styles['loading-more']}>
          <IconSpin spin style={{ marginRight: '4px' }} />
          <div>{I18n.t('Loading')}</div>
        </div>
      ) : null}
    </div>
  );

  const renderEmpty = () => (
    <div className="overflow-y-auto relative w-full h-full flex justify-center items-center">
      <Empty
        image={<IllustrationNoContent style={{ width: 150, height: 150 }} />}
      />
    </div>
  );

  const handleClose = () => {
    onClose();
  };

  const handleJumpDatabase = (res: SingleDatabaseResponse) => {
    handleClose();
    const { id, draft_id } = res.database_info ?? {};
    if (id && draft_id) {
      onCreateDatabase?.(id, draft_id);
    }
  };

  const fetchDefaultIcon = async () => {
    const res = await KnowledgeApi.GetIcon({
      format_type: FormatType.Database,
    });
    if (res.icon?.uri) {
      setInitValue({
        ...initValue,
        icon_uri: res.icon?.uri,
      });
    }
  };

  useEffect(() => {
    if (visible) {
      reload();
      fetchDefaultIcon();
    }
  }, [visible]);

  const {
    modal: createDatabaseModal,
    open: openCreateDatabaseModal,
    close: closeCreateDatabaseModal,
  } = useLibraryCreateDatabaseModal({
    projectID,
    enterFrom: 'library',
    onFinish: (databaseID, draftId) => {
      closeCreateDatabaseModal();
      onCreateDatabase?.(databaseID, draftId);
    },
  });

  const renderContent = () => (
    <>
      {tips}
      <Spin
        spinning={loading}
        wrapperClassName={classNames(['overflow-hidden', styles.list])}
      >
        {data?.list.length !== 0 ? renderList() : renderEmpty()}
      </Spin>
      {showBottomShadow ? (
        <div
          className={classNames(
            styles['bottom-shadow'],
            'w-full h-[80px] absolute left-0 bottom-0',
            'pointer-events-none',
          )}
        ></div>
      ) : null}
    </>
  );

  const renderDatabase = () => (
    <React.Fragment>
      {createDatabaseModal}
      <UICompositionModal
        closable
        visible={visible}
        onCancel={handleClose}
        header={I18n.t('db2_025')}
        filter={renderFilter()}
        sider={
          <UICompositionModalSider className="!pt-[16px]">
            <UICompositionModalSider.Header className="mb-[16px] gap-[12px]">
              {renderInput()}
              <Dropdown
                trigger="custom"
                visible={dropdownVisible}
                render={
                  <Dropdown.Menu className="w-[196px]">
                    <Dropdown.Item
                      className="!pl-[8px]"
                      onClick={() => {
                        setDropdownVisible(false);
                        openCreateDatabaseModal();
                      }}
                    >
                      {I18n.t('db2_015')}
                    </Dropdown.Item>
                    <Dropdown.Item
                      className="!pl-[8px] [&_.coz-item-text]:w-full"
                      onClick={() => {
                        setDropdownVisible(false);
                        openCreateTableModal(ModalMode.TEMPLATE);
                      }}
                    >
                      <div className="flex justify-between">
                        <span>{I18n.t('db2_016')}</span>
                        <Popover
                          style={{
                            maxWidth: '460px',
                            backgroundColor: 'var(--Bg-COZ-bg-max, #363D4D)',
                            boxShadow:
                              '0 4px 12px 0 rgba(0, 0, 0, 8%), 0 8px 24px 0 rgba(0, 0, 0, 4%)',
                          }}
                          trigger="hover"
                          content={renderTemplateTips()}
                          zIndex={9999}
                          showArrow
                        >
                          <Tag
                            color="primary"
                            size="small"
                            className="ml-[8px]"
                          >
                            {I18n.t('db2_017')}
                          </Tag>
                        </Popover>
                      </div>
                    </Dropdown.Item>
                  </Dropdown.Menu>
                }
                onClickOutSide={() => {
                  setDropdownVisible(false);
                }}
              >
                <Button
                  color="brand"
                  iconPosition="right"
                  icon={<IconCozArrowDown />}
                  onClick={() => setDropdownVisible(true)}
                >
                  {I18n.t('db_add_table_title')}
                </Button>
              </Dropdown>
            </UICompositionModalSider.Header>
            <UICompositionModalSider.Content className="flex flex-col gap-[4px]">
              <SiderCategory
                label={I18n.t('project_resource_modal_library_resources', {
                  resource: I18n.t('resource_type_database'),
                })}
                onClick={() => {
                  setCategory('library');
                }}
                selected={category === 'library'}
              />
              {projectID ? (
                <SiderCategory
                  label={I18n.t('project_resource_modal_project_resources', {
                    resource: I18n.t('resource_type_database'),
                  })}
                  onClick={() => {
                    setCategory('project');
                  }}
                  selected={category === 'project'}
                />
              ) : null}
            </UICompositionModalSider.Content>
          </UICompositionModalSider>
        }
        content={
          <UICompositionModalMain className="relative px-[12px] gap-[16px]">
            {renderContent()}
          </UICompositionModalMain>
        }
      ></UICompositionModal>

      <DatabaseCreateTableModal
        visible={createVisible}
        onClose={() => setCreateVisible(false)}
        onReturn={() => setCreateVisible(false)}
        onSubmit={handleJumpDatabase}
        showDatabaseBaseInfo
        onlyShowDatabaseInfoRWMode={false}
        initValue={initValue}
        extraParams={{
          botId,
          spaceId,
          creatorId: userInfo?.user_id_str,
        }}
      />
    </React.Fragment>
  );

  return { renderDatabase, renderContent, renderInput, renderFilter };
};

export const SelectDatabaseModal: FC<SelectDatabaseModalProps> = props => {
  const { renderDatabase } = useSelectDatabaseModal(props);

  return <>{renderDatabase()}</>;
};
