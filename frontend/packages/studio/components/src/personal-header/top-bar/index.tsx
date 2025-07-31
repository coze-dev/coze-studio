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

import React, { type JSX } from 'react';

import classnames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { IconCozSetting } from '@coze-arch/coze-design/icons';
import {
  Typography,
  Space,
  IconButton,
  Divider,
  Avatar,
} from '@coze-arch/coze-design';
import { EVENT_NAMES, sendTeaEvent } from '@coze-arch/bot-tea';
import { useSpaceStore } from '@coze-arch/bot-studio-store';
import { useNavigate } from 'react-router-dom';

import { SpaceAppList } from '../space-app-list';

import s from './index.module.less';
interface TopBarProps {
  showActions?: boolean;
  showFilter?: boolean;
  isPersonal?: boolean;
  actions: JSX.Element;
  children: React.ReactNode;
  className?: string;
  titleExtend?: JSX.Element;
}

export const TopBar = (props: TopBarProps) => {
  const { Text } = Typography;
  const navigate = useNavigate();
  const {
    space: { name: spaceName, id: spaceId, icon_url: spaceIconUrl },
  } = useSpaceStore();
  const {
    showActions,
    showFilter,
    isPersonal,
    actions,
    children,
    className,
    titleExtend,
  } = props;
  const settingLabel = I18n.t('basic_setting');

  return (
    <div className={classnames(s.topBar, className)}>
      <Space className="w-full flex justify-between mb-24px">
        <Space>
          <div className={s.des}>
            <Avatar
              src={spaceIconUrl}
              size="small"
              style={{ marginRight: 8 }}
            />
            <Text
              ellipsis={{
                showTooltip: {
                  opts: { content: spaceName },
                },
              }}
              className={classnames(s.name, '!max-w-[320px]')}
            >
              {spaceName}
            </Text>
            {titleExtend}
          </div>
        </Space>
        <Space spacing={8} className="flex items-center align-right">
          {showActions ? actions : null}
          {!isPersonal && (
            <>
              <Divider layout="horizontal" className={s.split} />
              <IconButton
                color="primary"
                type="primary"
                size="large"
                onClick={() => {
                  sendTeaEvent(EVENT_NAMES.workspace_tab_expose, {
                    tab_name: 'team_manage',
                  });

                  navigate(`/space/${spaceId}/team`);
                }}
                icon={<IconCozSetting />}
                aria-label={settingLabel}
              />
            </>
          )}
        </Space>
      </Space>
      <div className={s.tabs}>
        <Space className="w-full flex justify-between">
          <Space spacing={8} className="flex items-center align-left shrink-0">
            <SpaceAppList />
          </Space>
          <Space
            className="!flex items-center !overflow-hidden shrink-1"
            spacing={8}
          >
            {showFilter ? children : null}
          </Space>
        </Space>
      </div>
    </div>
  );
};
