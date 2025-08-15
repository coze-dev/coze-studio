/* eslint-disable import/order */
/* eslint-disable max-lines-per-function */
/* eslint-disable @coze-arch/max-line-per-function */
/* eslint-disable prettier/prettier */
import { type FC, useEffect, useCallback, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { I18n } from '@coze-arch/i18n';
import cls from 'classnames';

import {
  Content,
  Header,
  SubHeaderSearch,
  HeaderTitle,
  SubHeaderFilters,
  Layout,
  SubHeader,
  HeaderActions,
  type DevelopProps,
  WorkspaceEmpty,
} from '@coze-studio/workspace-base/develop';
import { IconCozLoading, IconCozPlus } from '@coze-arch/coze-design/icons';
import {
  Button,
  IconButton,
  Search,
  Select,
  Spin,
  Menu,
  MenuItem,
  Popconfirm,
  RadioGroup,
  Radio,
  SideSheet,
} from '@coze-arch/coze-design';
import { GridList, GridItem } from './components/gridList';
import { FalconCardDetail } from './cardDetail';
import { aopApi } from '@coze-arch/bot-api';
import { replaceUrl } from './utils';
import placeholderImg from './assets/placeholder.png';

import styles from './index.module.less';

let timer: NodeJS.Timeout | null = null;
const delay = 300;

export const FalconCard: FC<DevelopProps> = ({ spaceId }) => {
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [typeList, setTypeList] = useState([
    {
      label: I18n.t('All'),
      value: '',
      count: -1,
    },
  ]);
  const [groupType, setGroupType] = useState(1);
  const [filterQueryText, setFilterQueryText] = useState('');
  const [cardList, setCardList] = useState([]);
  const [spinId, setSpinId] = useState('');
  const [actionType, setActionType] = useState('');
  const [detailInfo, setDetailInfo] = useState({});
  const [detailVisible, setDetailVisible] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pageNoRef = useRef(1);
  const allPageCountRef = useRef(1);

  const resetFilter = () => {
    setFilterType('');
    setFilterQueryText('');
  };

  const actionName = I18n.t(
    actionType === 'create'
      ? 'workspace_create'
      : actionType === 'edit'
        ? 'Edit'
        : 'View',
  );

  const goDetail = (type, params = {}) => {
    setActionType(type);
    setDetailVisible(true);
    setDetailInfo(params);
  };

  const getCardListData = useCallback(
    (isAppend = false) => {
      if (isAppend) {
        if (pageNoRef.current > allPageCountRef.current) {
          return;
        }
        pageNoRef.current++;
      } else {
        pageNoRef.current = 1;
        setCardList([]);
      }

      setLoading(true);
      aopApi
        .GetCardResourceList({
          createdBy: groupType === 1,
          searchValue: filterQueryText,
          sassWorkspaceId: spaceId,
          cardClassId: filterType,
          pageNo: pageNoRef.current,
          pageSize: 30,
        })
        .then(res => {
          const newList = res.body.cardList || [];
          if (isAppend) {
            setCardList(prev => [...prev, ...newList]);
            allPageCountRef.current = Number(res.body.totalPages);
          } else {
            setCardList(newList);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [filterQueryText, filterType, groupType, spaceId],
  );

  const goEditor = cardId => {
    window.open(
      `${window.location.origin}/agent-h5/?app=simple#/m_cardEditor/editor/design?id=${
        cardId
      }&from=${encodeURIComponent(window.location.href)}`,
    );
  };

  const unApplyService = useCallback(
    (cardId: string) => {
      setSpinId(cardId);
      aopApi
        .UnApplyCardResource({
          cardId,
          sassWorkspaceId: spaceId,
        })
        .finally(() => {
          setSpinId('');
          getCardListData();
        });
    },
    [getCardListData, spaceId],
  );

  const applyService = useCallback(
    (cardId: string) => {
      setSpinId(cardId);
      aopApi
        .ApplyCardResource({
          cardId,
          sassWorkspaceId: spaceId,
        })
        .finally(() => {
          setSpinId('');
          getCardListData();
        });
    },
    [getCardListData, spaceId],
  );

  const delService = useCallback(
    (cardId: string) => {
      setSpinId(cardId);
      aopApi
        .DeleteCardResource({
          cardId,
          sassWorkspaceId: spaceId,
        })
        .finally(() => {
          setSpinId('');
          getCardListData();
        });
    },
    [getCardListData, spaceId],
  );

  const delServiceFromMe = useCallback(
    (cardId: string) => {
      setSpinId(cardId);
      aopApi
        .DeleteCardResourceFromMe({
          cardId,
          sassWorkspaceId: spaceId,
        })
        .finally(() => {
          setSpinId('');
          getCardListData();
        });
    },
    [getCardListData, spaceId],
  );

  const handleScroll = useCallback(() => {
    if (scrollRef.current && !loading) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const threshold = 100;
      if (scrollTop + clientHeight >= scrollHeight - threshold) {
        getCardListData(true);
      }
    }
  }, [getCardListData, loading]);

  useEffect(() => {
    getCardListData();
  }, [getCardListData]);

  useEffect(() => {
    aopApi
      .GetCardTypeCount({
        sassWorkspaceId: spaceId,
      })
      .then(res => {
        const listData = res.body.cardClassList;
        const allCount = listData.reduce(
          (prev, curr) => prev + Number(curr.count),
          0,
        );
        const list = [
          {
            label: I18n.t('All'),
            value: '',
            count: allCount || -1,
          },
          // {
          //   label: I18n.t('All') + '测试',
          //   value: '123',
          //   count: 12,
          // },
          ...listData.map(item => ({
            label: item.name,
            value: item.id,
            count: Number(item.count),
          })),
        ];
        setTypeList(list);
      });
  }, [spaceId]);

  return (
    <Layout>
      <Header>
        <HeaderTitle>
          <span>{I18n.t('workspace_card')}</span>
        </HeaderTitle>
        <RadioGroup
          type="button"
          value={groupType}
          onChange={e => {
            resetFilter();
            setGroupType(e.target.value);
          }}
        >
          <Radio value={1}>我创建的</Radio>
          <Radio value={0}>我添加的</Radio>
        </RadioGroup>
        <HeaderActions>
          <Search
            showClear={true}
            className="w-[200px]"
            placeholder={I18n.t('workspace_card_search_service')}
            value={filterQueryText}
            onChange={val => {
              if (timer) {
                clearTimeout(timer);
              }
              timer = setTimeout(() => {
                setFilterQueryText(val);
              }, delay);
            }}
          />
          <Button
            icon={<IconCozPlus />}
            onClick={() => {
              goDetail('create');
            }}
          >
            {I18n.t('workspace_create_card')}
          </Button>
        </HeaderActions>
      </Header>
      <SubHeader>
        <SubHeaderFilters>
          <Select
            className="min-w-[128px]"
            value={filterType}
            onChange={(val: string | number) => {
              setFilterType(val as string);
            }}
          >
            {typeList.map(opt => (
              <Select.Option key={opt.value} value={opt.value}>
                <span>{opt.label}</span>
                <span className="text-[12px] ml-[4px] coz-fg-secondary">
                  {opt.count > -1 ? opt.count : ''}
                </span>
              </Select.Option>
            ))}
          </Select>
        </SubHeaderFilters>
      </SubHeader>
      <Content ref={scrollRef} onScroll={handleScroll}>
        <GridList>
          {cardList.map(item => (
            <GridItem key={item.cardId}>
              <div
                className={cls(
                  'px-[16px] h-full flex flex-col justify-between',
                )}
              >
                <div
                  className="py-[12px]"
                  onClick={e => {
                    goDetail('view', item);
                    e?.stopPropagation();
                  }}
                >
                  <div className="flex flex-col gap-[8px]">
                    <div
                      className="w-full h-[180px] px-[12px] py-[12px] bg-[#EFF0F4] rounded-[6px]"
                      style={{
                        background: `#EFF0F4 url("${placeholderImg}") no-repeat center center / 108px auto`,
                      }}
                    >
                      <div
                        className="w-full h-full"
                        style={{
                          background: `url("${replaceUrl(item.picUrl)}") no-repeat center center / cover`,
                        }}
                      />
                    </div>
                    <div>
                      <div className="flex gap-[6px] mb-[4px] items-center">
                        <div className="text-[18px] font-medium">
                          {item.cardName}
                        </div>
                      </div>
                      <div className="text-[14px] coz-fg-secondary">
                        {item.code}
                      </div>
                    </div>
                  </div>
                </div>
                <Spin spinning={spinId === item.cardId}>
                  <div
                    className={cls(
                      'flex justify-between py-[12px] text-[14px] text-[#666]',
                      styles.panel,
                    )}
                  >
                    {groupType === 1
                      ? [
                          <div
                            key="editor"
                            className={cls(styles.action, styles.editor)}
                            onClick={e => {
                              goEditor(item.cardId);
                              e?.stopPropagation();
                            }}
                          >
                            编辑器
                          </div>,
                          item.cardShelfStatus === '0' && (
                            <Popconfirm
                              key="apply"
                              title={`确定要将 ${item.cardName} 服务上架吗？`}
                              onConfirm={e => {
                                applyService(item.cardId);
                                e?.stopPropagation();
                              }}
                              okText="确定"
                              cancelText="取消"
                            >
                              <div className={cls(styles.action, styles.apply)}>
                                申请上架
                              </div>
                            </Popconfirm>
                          ),
                          item.cardShelfStatus === '1' && (
                            <Popconfirm
                              title={`确定要将 ${item.cardName} 服务下架吗？`}
                              onConfirm={e => {
                                unApplyService(item.cardId);
                                e?.stopPropagation();
                              }}
                              okText="确定"
                              cancelText="取消"
                            >
                              <div
                                className={cls(styles.action, styles.unshelve)}
                              >
                                服务下架
                              </div>
                            </Popconfirm>
                          ),
                          <Menu
                            key="more"
                            position="bottomRight"
                            className="w-120px mt-4px mb-4px"
                            render={
                              <Menu.SubMenu mode="menu">
                                <MenuItem
                                  onClick={e => {
                                    goDetail('edit', item);
                                    e?.stopPropagation();
                                  }}
                                >
                                  编辑服务
                                </MenuItem>
                                <Popconfirm
                                  title={`确定要将 ${item.cardName} 服务删除吗？`}
                                  onConfirm={e => {
                                    delService(item.cardId);
                                    e?.stopPropagation();
                                  }}
                                  okText="确定"
                                  cancelText="取消"
                                >
                                  <MenuItem>删除服务</MenuItem>
                                </Popconfirm>
                              </Menu.SubMenu>
                            }
                          >
                            <div className={cls(styles.action, styles.more)}>
                              更多
                            </div>
                          </Menu>,
                        ]
                      : [
                          <Popconfirm
                            key="delete"
                            title={`确定要删除卡片 ${item.cardName} 绑定吗？`}
                            onConfirm={e => {
                              delServiceFromMe(item.cardId);
                              e?.stopPropagation();
                            }}
                            okText="确定"
                            cancelText="取消"
                          >
                            <div className={cls(styles.action, styles.delete)}>
                              删除服务
                            </div>
                          </Popconfirm>,
                        ]}
                  </div>
                </Spin>
              </div>
            </GridItem>
          ))}
        </GridList>
        {!cardList?.length && !loading ? <WorkspaceEmpty /> : null}
        {loading ? (
          <Spin>
            <div className="w-full h-[100px] flex items-center justify-center" />
          </Spin>
        ) : null}
      </Content>
      <SideSheet
        title={actionName + I18n.t('workspace_card_detail')}
        visible={detailVisible}
        width="640px"
        onCancel={() => setDetailVisible(false)}
      >
        <FalconCardDetail
          spaceId={spaceId}
          type={actionType}
          info={detailInfo}
          onSuccess={() => {
            setDetailVisible(false);
            setDetailInfo({});
            getCardListData();
          }}
        />
      </SideSheet>
    </Layout>
  );
};
