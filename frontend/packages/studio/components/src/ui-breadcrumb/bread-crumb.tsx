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

import { useNavigate, useParams } from 'react-router-dom';

import { SpaceAppEnum, BaseEnum } from '@coze-arch/web-context';
import { I18n } from '@coze-arch/i18n';
import { IconCozArrowLeft } from '@coze-arch/coze-design/icons';
import {
  Typography,
  Avatar,
  Breadcrumb as SemiBreadcrumb,
  Button,
} from '@coze-arch/coze-design';
import { type DynamicParams } from '@coze-arch/bot-typings/teamspace';
import { useSpaceStore } from '@coze-arch/bot-studio-store';
import { type BreadcrumbProps as SemiBreadcrumbProps } from '@coze-arch/bot-semi/Breadcrumb';
import { useRouteConfig } from '@coze-arch/bot-hooks';
import type { DataSetInfo } from '@coze-arch/bot-api/memory';
import { type DocumentInfo } from '@coze-arch/bot-api/knowledge';
import {
  type DraftBot,
  type PluginMetaInfo,
  type PluginAPIInfo,
} from '@coze-arch/bot-api/developer_api';
import { type MockSet } from '@coze-arch/bot-api/debugger_api';
import { useSpaceApp } from '@coze-foundation/space-store';

import s from './index.module.less';

export interface BreadCrumbProps extends SemiBreadcrumbProps {
  botInfo?: DraftBot;
  datasetInfo?: DataSetInfo;
  documentinfo?: DocumentInfo;
  pluginInfo?: PluginMetaInfo;
  pluginToolInfo?: PluginAPIInfo;
  isPublish?: boolean;
  mockSetInfo?: MockSet;
}

// eslint-disable-next-line @coze-arch/max-line-per-function
export const UIBreadcrumb: React.FC<BreadCrumbProps> = ({
  botInfo,
  datasetInfo,
  documentinfo,
  pluginInfo,
  pluginToolInfo,
  mockSetInfo,
  isPublish,
  ...props
}) => {
  const { menuKey: base } = useRouteConfig();
  const spaceApp = useSpaceApp();
  const id = useSpaceStore(store => store.space.id);
  const navigate = useNavigate();
  const params = useParams<DynamicParams>();

  const goBack = () => {
    if (base === BaseEnum.Explore) {
      navigate('/explore');
    } else {
      navigate(`/space/${id}/library`);
    }
  };
  const goBackToDoc = () => {
    navigate(`/space/${id}/${spaceApp}/${params.dataset_id}`);
  };
  const goBackToPluginIdList = () => {
    navigate(`/space/${id}/${spaceApp}/${params.plugin_id}`);
  };

  const goBackToBot = () => {
    navigate(`/space/${id}/${spaceApp}/${params.bot_id}`);
  };

  const goBackToToolIdList = () => {
    navigate(
      `/space/${id}/${spaceApp}/${params.plugin_id}/tool/${params.tool_id}?mode=preview`,
    );
  };

  const goBackToMockSetList = () => {
    navigate(
      `/space/${id}/${spaceApp}/${params.plugin_id}/tool/${params.tool_id}/plugin-mock-set`,
    );
  };

  const renderBreadcrumbItemForPlugin = () => {
    let breadCrumbList: React.ReactNode[] = [];
    let onBackClick: () => void;

    if (pluginInfo?.name) {
      onBackClick = goBack;
    }

    if (pluginToolInfo?.name) {
      onBackClick = goBackToPluginIdList;
    }

    if (mockSetInfo) {
      onBackClick = goBackToToolIdList;

      if (mockSetInfo?.name) {
        onBackClick = goBackToMockSetList;
      }
    }
    breadCrumbList = [
      <Button
        color="secondary"
        icon={<IconCozArrowLeft />}
        onClick={() => {
          onBackClick();
        }}
      >
        {I18n.t('library_resource_detail_back')}
      </Button>,
    ];
    return breadCrumbList;
  };

  const renderBreadcrumbItem = () => {
    if (base === BaseEnum.Explore) {
      return [
        <SemiBreadcrumb.Item key="bots" onClick={goBack}>
          <Typography.Title weight={700} className={s['bread-title']}>
            Explore
          </Typography.Title>
        </SemiBreadcrumb.Item>,
        <SemiBreadcrumb.Item key="bots info">
          <div className={s['bot-info-item']}>
            <Avatar
              className={s['bot-avatar']}
              src={botInfo?.icon_url}
              size="extra-small"
              shape="square"
            />
            <div className={s['bot-name']}>{botInfo?.name}</div>
          </div>
        </SemiBreadcrumb.Item>,
      ];
    }
    switch (spaceApp) {
      case SpaceAppEnum.BOT: {
        if (isPublish) {
          return [
            <SemiBreadcrumb.Item key="bots" onClick={goBack}>
              <Typography.Title weight={700} className={s['bread-title']}>
                {I18n.t('menu_bots')}
              </Typography.Title>
            </SemiBreadcrumb.Item>,
            <SemiBreadcrumb.Item key="bots info" onClick={goBackToBot}>
              <div className={s['bot-info-item']}>
                <Avatar
                  className={s['bot-avatar']}
                  src={botInfo?.icon_url}
                  size="extra-small"
                  shape="square"
                />
                <Typography.Title weight={700} className={s['bread-title']}>
                  {botInfo?.name}
                </Typography.Title>
              </div>
            </SemiBreadcrumb.Item>,
            <SemiBreadcrumb.Item key="bots publish">
              <div className={s['bot-info-item']}>
                <div className={s['bot-name']}>{I18n.t('Publish')}</div>
              </div>
            </SemiBreadcrumb.Item>,
          ];
        } else {
          return [
            <SemiBreadcrumb.Item key="bots" onClick={goBack}>
              <Typography.Title weight={700} className={s['bread-title']}>
                {I18n.t('menu_bots')}
              </Typography.Title>
            </SemiBreadcrumb.Item>,
            <SemiBreadcrumb.Item key="bots info">
              <div className={s['bot-info-item']}>
                <Avatar
                  className={s['bot-avatar']}
                  src={botInfo?.icon_url}
                  size="extra-small"
                  shape="square"
                />
                <Typography.Text
                  className={s['bot-name']}
                  ellipsis={{
                    showTooltip: {
                      opts: {
                        content: botInfo?.name,
                        style: { wordWrap: 'break-word' },
                      },
                    },
                  }}
                >
                  {botInfo?.name}
                </Typography.Text>
              </div>
            </SemiBreadcrumb.Item>,
          ];
        }
      }
      case SpaceAppEnum.KNOWLEDGE: {
        if (!params.doc_id) {
          return [
            <SemiBreadcrumb.Item
              key="dataset"
              onClick={() => {
                goBack();
              }}
            >
              {I18n.t('datasets_title')}
            </SemiBreadcrumb.Item>,
            <SemiBreadcrumb.Item key="doc" noLink>
              {datasetInfo?.name}
            </SemiBreadcrumb.Item>,
          ];
        }
        return [
          <SemiBreadcrumb.Item
            key="dataset"
            onClick={() => {
              goBack();
            }}
          >
            {I18n.t('datasets_title')}
          </SemiBreadcrumb.Item>,
          <SemiBreadcrumb.Item onClick={goBackToDoc} key="doc">
            {datasetInfo?.name}
          </SemiBreadcrumb.Item>,
          <SemiBreadcrumb.Item noLink key="slice">
            {documentinfo?.name}
          </SemiBreadcrumb.Item>,
        ];
      }
      case SpaceAppEnum.PLUGIN: {
        return renderBreadcrumbItemForPlugin();
      }
      default:
        return null;
    }
  };

  return (
    <div className={s['bot-breadcrumb']}>
      <SemiBreadcrumb {...props}>{renderBreadcrumbItem()}</SemiBreadcrumb>
    </div>
  );
};
