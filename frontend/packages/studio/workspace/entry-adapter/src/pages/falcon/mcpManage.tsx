import { type FC, useEffect, useCallback, useState } from 'react';
import { I18n } from '@coze-arch/i18n';
import classNames from 'classnames';
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
} from '@coze-arch/coze-design';
import { aopApi } from '@coze-arch/bot-api';

let timer: NodeJS.Timeout | null = null;
const delay = 300;

export const FalconMcp: FC<DevelopProps> = ({ spaceId }) => {
  const [filterType, setFilterType] = useState('');
  const [filterQueryText, setFilterQueryText] = useState('');
  const [typeList, setTypeList] = useState([
    {
      label: I18n.t('All'),
      value: '',
      count: 0,
    },
  ]);

  const getMcpListData = useCallback(() => {
    aopApi
      .GetMCPList({
        mcpType: filterType,
        mcpName: filterQueryText,
      })
      .then(res => {
        console.log('🚀 ~ FalconMcp ~ res:', res);
      });
  }, [filterType, filterQueryText]);

  const getTypeListData = useCallback(() => {
    aopApi.GetMCPTypes({}).then(res => {
      const data = res.body;
      setTypeList([
        {
          label: I18n.t('All'),
          value: '',
          count: data.allCount,
        },
        ...(data?.typeEnmuLists || []).map(e => ({
          label: e.typeName,
          value: e.typeId,
          count: e.count,
        })),
      ]);
    });
  }, []);

  useEffect(() => {
    getTypeListData();
  }, [getTypeListData]);

  useEffect(() => {
    getMcpListData();
  }, [getMcpListData]);

  return (
    <>
      <Layout>
        <Header>
          <HeaderTitle>
            <span>{I18n.t('workspace_mcp')}</span>
          </HeaderTitle>
          <HeaderActions>
            <Button icon={<IconCozPlus />}>
              {I18n.t('workspace_create_mcp')}
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
                  {opt.label}
                </Select.Option>
              ))}
            </Select>
          </SubHeaderFilters>
          <SubHeaderSearch>
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
          </SubHeaderSearch>
        </SubHeader>
        <Content>==mcp==</Content>
      </Layout>
    </>
  );
};
