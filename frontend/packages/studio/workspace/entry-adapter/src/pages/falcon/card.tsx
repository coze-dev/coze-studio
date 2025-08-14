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
} from '@coze-arch/coze-design';
import { GridList, GridItem } from './components/gridList';
import { aopApi } from '@coze-arch/bot-api';
import { replaceUrl } from './utils';

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const pageNoRef = useRef(1);
  const allPageCountRef = useRef(1);

  const navigate = useNavigate();
  const goPage = path => {
    navigate(`/space/${spaceId}${path}`);
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

  const stopService = useCallback(
    (cardId: string) => {
      setSpinId(cardId);
      aopApi
        .StopMCPResource({
          cardId,
        })
        .finally(() => {
          setSpinId('');
          getCardListData();
        });
    },
    [getCardListData],
  );

  const unApplyService = useCallback(
    (cardId: string) => {
      setSpinId(cardId);
      aopApi
        .UnApplyMCPResource({
          cardId,
        })
        .finally(() => {
          setSpinId('');
          getCardListData();
        });
    },
    [getCardListData],
  );

  const applyService = useCallback(
    (cardId: string) => {
      setSpinId(cardId);
      aopApi
        .ApplyMCPResource({
          cardId,
        })
        .finally(() => {
          setSpinId('');
          getCardListData();
        });
    },
    [getCardListData],
  );

  const startService = useCallback(
    (cardId: string) => {
      setSpinId(cardId);
      aopApi
        .StartMCPResource({
          cardId,
        })
        .finally(() => {
          setSpinId('');
          getCardListData();
        });
    },
    [getCardListData],
  );

  const delService = useCallback(
    (cardId: string) => {
      setSpinId(cardId);
      aopApi
        .DeleteMCPResource({
          cardId,
        })
        .finally(() => {
          setSpinId('');
          getCardListData();
        });
    },
    [getCardListData],
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
    aopApi.GetCardTypeCount({}).then(res => {
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
  }, []);

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
              goPage('/mcp-detail/create');
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
                    goPage(`/mcp-detail/view?mcp_id=${item.cardId}`);
                    e?.stopPropagation();
                  }}
                >
                  <div className="flex flex-col gap-[8px]">
                    <div className="w-full h-[180px] px-[12px] py-[12px] bg-[#EFF0F4] rounded-[6px]">
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
                    {[
                      item.cardShelfStatus == '1' && item.mcpShelf == '0' && (
                        <div
                          key="stop"
                          className={cls(styles.action, styles.stop)}
                          onClick={e => {
                            stopService(item.cardId);
                            e?.stopPropagation();
                          }}
                        >
                          停止服务
                        </div>
                      ),
                      (item.cardShelfStatus == '0' ||
                        item.cardShelfStatus == '-1' ||
                        item.cardShelfStatus == '2') && (
                        <div
                          key="start"
                          className={cls(styles.action, styles.start)}
                          onClick={e => {
                            startService(item.cardId);
                            e?.stopPropagation();
                          }}
                        >
                          {item.cardShelfStatus == '2'
                            ? '重启服务'
                            : '启动服务'}
                        </div>
                      ),
                      item.cardShelfStatus == '1' && item.mcpShelf == '1' && (
                        <Popconfirm
                          title={`确定要将 ${item.cardName} 服务下架吗？`}
                          onConfirm={e => {
                            unApplyService(item.cardId);
                            e?.stopPropagation();
                          }}
                          okText="确定"
                          cancelText="取消"
                        >
                          <div className={cls(styles.action, styles.unshelve)}>
                            服务下架
                          </div>
                        </Popconfirm>
                      ),
                      item.cardShelfStatus == '1' && item.mcpShelf == '0' && (
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
                      <Menu
                        key="more"
                        position="bottomRight"
                        className="w-120px mt-4px mb-4px"
                        render={
                          <Menu.SubMenu mode="menu">
                            <MenuItem
                              onClick={e => {
                                goPage(
                                  `/mcp-detail/edit?mcp_id=${item.cardId}`,
                                );
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
                    ]}
                  </div>
                </Spin>
              </div>
            </GridItem>
          ))}
        </GridList>
        {loading ? (
          <Spin>
            <div className="w-full h-[100px] flex items-center justify-center" />
          </Spin>
        ) : null}
      </Content>
    </Layout>
  );
};
