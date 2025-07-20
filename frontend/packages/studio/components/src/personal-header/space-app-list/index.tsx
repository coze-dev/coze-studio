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
   * 如果是string，需传入starling key，并且会由div包一层
   * 如果是function，则自定义label的实现，active表示是否是选中态
   */
  label: string | ((active: boolean) => React.ReactNode);
  /** label 外的 badge，未来再扩展配置项 */
  badge?: string;
  app: SpaceAppEnum;
  /**
   * Q：为什么不叫 visible？FG 要取反，filter() 也要取反，很麻烦
   * A：为了兼容旧配置，缺省时认定为 visible。避免合码时无冲突 导致忽略掉新增配置的问题。
   */
  invisible?: boolean;
  /** 目前（24.05.21）没发现用处，怀疑是以前的功能迭代掉了，@huangjian 说先留着 */
  icon?: ReactNode;
  /** 目前（24.05.21）没发现用处，怀疑是以前的功能迭代掉了，@huangjian 说先留着 */
  selectedIcon?: ReactNode;
  /** 自动化打标 */
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
