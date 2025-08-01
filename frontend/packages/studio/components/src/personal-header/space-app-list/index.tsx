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

import { NavLink } from 'react-router-dom';
import React, { type ReactNode } from 'react';

import { isString } from 'lodash-es';
import classNames from 'classnames';
import { SpaceAppEnum } from '@coze-arch/web-context';
import { I18n, type I18nKeysNoOptionsType } from '@coze-arch/i18n';
import { Space, Badge } from '@coze-arch/coze-design';
import { EVENT_NAMES, sendTeaEvent } from '@coze-arch/bot-tea';
import { useSpaceStore } from '@coze-arch/bot-studio-store';
import { getFlags } from '@coze-arch/bot-flags';
import { KnowledgeE2e, BotE2e } from '@coze-data/e2e';
import { useSpaceApp } from '@coze-foundation/space-store';

import s from './index.module.less';

interface MenuItem {
  /**
   * If it is a string, you need to pass in the starling key, and it will be wrapped by the div layer.
   * If it is a function, the implementation of the custom label, active indicates whether it is selected
   */
  label: string | ((active: boolean) => React.ReactNode);
  /** The badge outside the label, and the configuration item will be expanded in the future */
  badge?: string;
  app: SpaceAppEnum;
  /**
   * Q: Why is it not called visible? FG should be reversed, and filter () should also be reversed, which is very troublesome.
   * A: In order to be compatible with the old configuration, it is recognized as visible by default. To avoid no conflicts when combining codes, the problem of new configurations is ignored.
   */
  invisible?: boolean;
  /** At present (24.05.21) no use is found, it is suspected that the previous function iteration is lost, @huangjian said to keep it first */
  icon?: ReactNode;
  /** At present (24.05.21) no use is found, it is suspected that the previous function iteration is lost, @huangjian said to keep it first */
  selectedIcon?: ReactNode;
  /** Automatic marking */
  e2e?: string;
}

const GET_MENU_SPACE_APP = (): Array<MenuItem> => [
  {
    label: 'menu_bots',
    app: SpaceAppEnum.BOT,
    e2e: BotE2e.BotTab,
  },
  {
    label: 'menu_plugins',
    app: SpaceAppEnum.PLUGIN,
  },
  {
    label: 'menu_workflows',
    app: SpaceAppEnum.WORKFLOW,
  },
  {
    label: 'imageflow_title',
    app: SpaceAppEnum.IMAGEFLOW,
    invisible: false,
  },
  {
    label: 'menu_datasets',
    app: SpaceAppEnum.KNOWLEDGE,
    e2e: KnowledgeE2e.KnowledgeTab,
  },
  {
    label: 'menu_widgets',
    app: SpaceAppEnum.WIDGET,
    invisible: !getFlags()['bot.builder.bot.builder.widget'],
  },
  {
    label: 'scene_resource_name',
    badge: 'scene_beta_sign',
    app: SpaceAppEnum.SOCIAL_SCENE,
    invisible: !getFlags()['bot.studio.social'],
  },
];
export const SpaceAppList = () => {
  const spaceApp = useSpaceApp();

  const { id: spaceId } = useSpaceStore(store => store.space);

  return (
    <Space spacing={4}>
      {GET_MENU_SPACE_APP()
        .filter(item => !item.invisible)
        .map(item => {
          const active = item.app === spaceApp;
          const tabContent = (
            <NavLink
              key={item.app}
              data-testid={item.e2e}
              to={`/space/${spaceId}/${item.app}`}
              className={s['item-link']}
              onClick={() => {
                sendTeaEvent(EVENT_NAMES.workspace_tab_expose, {
                  tab_name: item.app,
                });
              }}
            >
              {isString(item.label) ? (
                <div
                  className={classNames({
                    [s.item]: true,
                    [s.active]: active,
                  })}
                >
                  {I18n.t(item.label as I18nKeysNoOptionsType)}
                </div>
              ) : (
                item.label(active)
              )}
            </NavLink>
          );

          return item.badge ? (
            <Badge
              type="alt"
              key={item.app}
              count={I18n.t(item.badge as I18nKeysNoOptionsType)}
              countStyle={{
                backgroundColor: 'var(--coz-mg-color-plus-emerald)',
              }}
            >
              {tabContent}
            </Badge>
          ) : (
            tabContent
          );
        })}
    </Space>
  );
};
