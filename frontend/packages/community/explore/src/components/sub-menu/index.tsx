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
import { useState, useEffect } from 'react';

import { SubMenuItem, SubMenu } from '@coze-community/components';
import { I18n } from '@coze-arch/i18n';
// import {
//   // IconCozTemplate,
//   // IconCozTemplateFill,
//   IconCozPlugin,
//   IconCozPluginFill,
// } from '@coze-arch/coze-design/icons';
import {
  IconBotDevelop,
  IconBotDevelopActive,
  IconBotPlugin,
  IconBotPluginActive,
  IconCard,
  IconCardActive,
} from '../../../../../components/bot-icons';
import { Space } from '@coze-arch/coze-design';

import { useExploreRoute } from '../../hooks/use-explore-route';
import cls from 'classnames';
import { aopApi } from '@coze-arch/bot-api';
import styles from './index.module.less';

const getExploreMenuConfig = () => [
  {
    type: 'project',
    icon: <IconBotDevelop />,
    activeIcon: <IconBotDevelop />,
    title: I18n.t('Project'),
    // isActive: true,
    // path: '/explore/project',
    children: [
      {
        type: 'latest',
        title: I18n.t('Project_latest'),
        isActive: true,
        path: '/explore/project/latest',
      },
      {
        type: 'tools',
        title: I18n.t('Project_tools'),
        isActive: true,
        path: '/explore/project/tools',
      },
    ],
  },
  {
    type: 'plugin',
    icon: <IconBotPlugin />,
    activeIcon: <IconBotPlugin />,
    title: I18n.t('Plugins'),
    isActive: true,
    path: '/explore/plugin',
  },
  // {
  //   icon: <IconCozTemplate />,
  //   activeIcon: <IconCozTemplateFill />,
  //   title: I18n.t('template_name'),
  //   isActive: true,
  //   type: 'template',
  //   path: '/explore/template',
  // },
];

const CustomSubMenu = ({ menuConfig }) => {
  const navigate = useNavigate();
  const { type } = useExploreRoute();
  const { sub_route_id } = useParams();
  const firstParentNodeIndex = menuConfig.findIndex(item =>
    Array.isArray(item.children),
  );
  const defaultType =
    firstParentNodeIndex > -1 ? menuConfig[firstParentNodeIndex].type : '';

  const [activeId, setActiveId] = useState(defaultType);

  const toggleActive = id => {
    if (activeId === id) {
      setActiveId('');
      return;
    }
    setActiveId(id);
  };

  return (
    <Space spacing={4} vertical>
      {menuConfig.map(item => [
        <SubMenuItem
          key={item.type}
          {...item}
          isActive={item?.children?.length ? false : item.type === type}
          suffix={
            item?.children?.length ? (
              <div
                className={cls(styles.groupSubMenuArrow, {
                  [styles.groupSubMenuArrowActive]: activeId === item.type,
                })}
              />
            ) : null
          }
          onClick={() => {
            item.path ? navigate(item.path) : toggleActive(item.type);
          }}
        />,
        activeId === item.type &&
          item?.children?.map(child => (
            <SubMenuItem
              key={child.type}
              {...child}
              subNode={true}
              isActive={child.type === sub_route_id}
              onClick={() => {
                navigate(child.path);
              }}
            />
          )),
      ])}
    </Space>
  );
};

export const ExploreSubMenu = () => (
  <CustomSubMenu menuConfig={getExploreMenuConfig()} />
);

export const TemplateSubMenu = () => {
  const [subMenus, setSubMenus] = useState([]);
  useEffect(() => {
    aopApi.GetCardTypeCount().then(res => {
      const list = res.body.cardClassList?.map(e => ({
        type: `${e.id}`,
        title: e.name,
        isActive: true,
        path: `/template/card/${e.id}`,
      }));
      setSubMenus(list);
    });
  }, []);

  return (
    <CustomSubMenu
      menuConfig={[
        {
          type: 'project',
          icon: <IconBotDevelop />,
          activeIcon: <IconBotDevelop />,
          title: I18n.t('Template_project'),
          isActive: true,
          path: '/template/project',
        },
        {
          type: 'card',
          icon: <IconCard />,
          activeIcon: <IconCardActive />,
          title: I18n.t('Template_card'),
          children: [
            {
              type: 'all',
              title: I18n.t('All'),
              isActive: true,
              path: '/template/card/all',
            },
            ...subMenus,
          ],
        },
      ]}
    />
  );
};
