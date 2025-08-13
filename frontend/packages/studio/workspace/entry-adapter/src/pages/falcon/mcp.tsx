/* eslint-disable @coze-arch/max-line-per-function */
/* eslint-disable prettier/prettier */
import { type FC, useEffect, useCallback, useState } from 'react';
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
} from '@coze-arch/coze-design';
import { GridList, GridItem } from './components/gridList';
import { aopApi } from '@coze-arch/bot-api';
import { replaceUrl } from './utils';

import styles from './index.module.less';

let timer: NodeJS.Timeout | null = null;
const delay = 300;

export const FalconMcp: FC<DevelopProps> = ({ spaceId }) => {
  const [filterQueryText, setFilterQueryText] = useState('');
  const [mcpList, setMcpList] = useState([]);
  const [spinId, setSpinId] = useState('');

  const navigate = useNavigate();
  const goPage = path => {
    navigate(`/space/${spaceId}${path}`);
  };

  const getMcpListData = useCallback(() => {
    aopApi
      .GetMCPResourceList({
        createdBy: true,
        mcpName: filterQueryText,
        sassWorkspaceId: '7533521629687578624',
      })
      .then(res => {
        setMcpList(res.body.serviceInfoList || []);
      });
  }, [filterQueryText]);

  const stopService = useCallback(
    (mcpId: string) => {
      setSpinId(mcpId);
      aopApi
        .StopMCPResource({
          mcpId,
        })
        .finally(() => {
          setSpinId('');
          getMcpListData();
        });
    },
    [getMcpListData],
  );

  const unApplyService = useCallback(
    (mcpId: string) => {
      setSpinId(mcpId);
      aopApi
        .UnApplyMCPResource({
          mcpId,
        })
        .finally(() => {
          setSpinId('');
          getMcpListData();
        });
    },
    [getMcpListData],
  );

  const applyService = useCallback(
    (mcpId: string) => {
      setSpinId(mcpId);
      aopApi
        .ApplyMCPResource({
          mcpId,
        })
        .finally(() => {
          setSpinId('');
          getMcpListData();
        });
    },
    [getMcpListData],
  );

  const startService = useCallback(
    (mcpId: string) => {
      setSpinId(mcpId);
      aopApi
        .StartMCPResource({
          mcpId,
        })
        .finally(() => {
          setSpinId('');
          getMcpListData();
        });
    },
    [getMcpListData],
  );

  const delService = useCallback(
    (mcpId: string) => {
      setSpinId(mcpId);
      aopApi
        .DeleteMCPResource({
          mcpId,
        })
        .finally(() => {
          setSpinId('');
          getMcpListData();
        });
    },
    [getMcpListData],
  );

  useEffect(() => {
    getMcpListData();
  }, [getMcpListData]);

  return (
    <Layout>
      <Header>
        <HeaderTitle>
          <span>{I18n.t('workspace_mcp')}</span>
        </HeaderTitle>
        <HeaderActions>
          <Search
            showClear={true}
            className="w-[200px]"
            placeholder={I18n.t('workspace_mcp_search_service')}
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
            {I18n.t('workspace_create_mcp')}
          </Button>
        </HeaderActions>
      </Header>
      <Content>
        <GridList>
          {mcpList.map(item => (
            <GridItem key={item.mcpId}>
              <div
                className={cls(
                  'px-[16px] h-full flex flex-col justify-between',
                )}
              >
                <div
                  className="py-[20px]"
                  onClick={e => {
                    goPage(`/mcp-detail/view?mcp_id=${item.mcpId}`);
                    e?.stopPropagation();
                  }}
                >
                  <div className="flex gap-[8px] mb-[16px]">
                    <div className="w-[48px] h-[48px] mx-[4px]">
                      <img
                        src={replaceUrl(item.mcpIcon)}
                        className="w-full h-full"
                        width="48px"
                        height="48px"
                        alt=""
                      />
                    </div>
                    <div>
                      <div className="flex gap-[6px] mb-[4px] items-center">
                        <div className="text-[18px] font-medium">
                          {item.mcpName}
                        </div>
                        {item.mcpStatus === '1' && (
                          <div className={styles.statusRunning} />
                        )}
                      </div>
                      <div className="text-[12px] coz-fg-secondary">
                        {item.mcpId}
                      </div>
                    </div>
                  </div>
                  <div className="text-[14px] coz-fg-secondary">
                    {item.mcpDesc}
                  </div>
                </div>
                <Spin spinning={spinId === item.mcpId}>
                  <div
                    className={cls(
                      'flex justify-between py-[12px] text-[14px] text-[#666]',
                      styles.panel,
                    )}
                  >
                    {item.mcpStatus == '1' && item.mcpShelf == '0' && (
                      <div
                        className={cls(styles.action, styles.stop)}
                        onClick={e => {
                          stopService(item.mcpId);
                          e?.stopPropagation();
                        }}
                      >
                        停止服务
                      </div>
                    )}
                    {(item.mcpStatus == '0' ||
                      item.mcpStatus == '-1' ||
                      item.mcpStatus == '2') && (
                      <div
                        className={cls(styles.action, styles.start)}
                        onClick={e => {
                          startService(item.mcpId);
                          e?.stopPropagation();
                        }}
                      >
                        {item.mcpStatus == '2' ? '重启服务' : '启动服务'}
                      </div>
                    )}
                    {item.mcpStatus == '1' && item.mcpShelf == '1' && (
                      <Popconfirm
                        title={`确定要将 ${item.mcpName} 服务下架吗？`}
                        onConfirm={e => {
                          unApplyService(item.mcpId);
                          e?.stopPropagation();
                        }}
                        okText="确定"
                        cancelText="取消"
                      >
                        <div className={cls(styles.action, styles.unshelve)}>
                          服务下架
                        </div>
                      </Popconfirm>
                    )}
                    {item.mcpStatus == '1' && item.mcpShelf == '0' && (
                      <Popconfirm
                        title={`确定要将 ${item.mcpName} 服务上架吗？`}
                        onConfirm={e => {
                          applyService(item.mcpId);
                          e?.stopPropagation();
                        }}
                        okText="确定"
                        cancelText="取消"
                      >
                        <div className={cls(styles.action, styles.apply)}>
                          申请上架
                        </div>
                      </Popconfirm>
                    )}
                    <Menu
                      position="bottomRight"
                      className="w-120px mt-4px mb-4px"
                      render={
                        <Menu.SubMenu mode="menu">
                          <MenuItem
                            onClick={e => {
                              goPage(`/mcp-detail/edit?mcp_id=${item.mcpId}`);
                              e?.stopPropagation();
                            }}
                          >
                            编辑服务
                          </MenuItem>
                          <Popconfirm
                            title={`确定要将 ${item.mcpName} 服务删除吗？`}
                            onConfirm={e => {
                              delService(item.mcpId);
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
                    </Menu>
                  </div>
                </Spin>
              </div>
            </GridItem>
          ))}
        </GridList>
      </Content>
    </Layout>
  );
};
