import { type FC, useEffect } from 'react';
import { I18n } from '@coze-arch/i18n';
import classNames from 'classnames';
import {
  Content,
  Header,
  HeaderActions,
  HeaderTitle,
  Layout,
  SubHeader,
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

export const FalconMcp: FC<DevelopProps> = ({ spaceId }) => {
  useEffect(() => {
    aopApi
      .GetMCPList({
        space_id: spaceId,
      })
      .then(res => {
        console.log('🚀 ~ FalconMcp ~ aopApi:', res);
      });
  }, []);

  return (
    <>
      <Layout>
        <Header>
          <HeaderTitle>
            <span>{I18n.t('workspace_mcp')}</span>
          </HeaderTitle>
          <HeaderActions>
            {/* <Button icon={<IconCozPlus />}>{I18n.t('workspace_create')}</Button> */}
          </HeaderActions>
        </Header>
        <SubHeader></SubHeader>
        <Content>=============mcp==</Content>
      </Layout>
    </>
  );
};
