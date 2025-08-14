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
import { useState } from 'react';

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
} from '../../../../../components/bot-icons';
import { Space } from '@coze-arch/coze-design';

import { useExploreRoute } from '../../hooks/use-explore-route';
import cls from 'classnames';
import styles from './index.module.less';

const getMenuConfig = () => [
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

export const ExploreSubMenu = () => {
  const navigate = useNavigate();
  const { type } = useExploreRoute();
  const { project_type } = useParams();
  const [active, setActive] = useState(true);
  const menuConfig = getMenuConfig();
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
                  [styles.groupSubMenuArrowActive]: active,
                })}
              />
            ) : null
          }
          onClick={() => {
            item.path ? navigate(item.path) : setActive(!active);
          }}
        />,
        active &&
          item?.children?.map(child => (
            <SubMenuItem
              key={child.type}
              {...child}
              className="sub-menu-item"
              isActive={child.type === project_type}
              onClick={() => {
                navigate(child.path);
              }}
            />
          )),
      ])}
    </Space>
  );
};
