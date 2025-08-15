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

import { I18n } from '@coze-arch/i18n';
import { PageList } from '../../components/page-list';
import { ExternalAppCard, type ExternalAppCardProps } from './external-app-card';

export const ExternalAppPage = () => (
  <div>
    {/* 临时调试标识 */}
    <div style={{ background: 'red', color: 'white', padding: '10px', marginBottom: '20px' }}>
      🚀 ExternalAppPage 已加载！工具页面
    </div>
    <PageList
      title={I18n.t('Project_tools')}
      getDataList={() => getExternalAppData()}
      renderCard={data => <ExternalAppCard {...(data as ExternalAppCardProps)} />}
      renderCardSkeleton={() => <div className="h-[278px] bg-gray-200 animate-pulse rounded-lg" />}
    />
  </div>
);

const getExternalAppData = async (): Promise<ExternalAppCardProps[]> => {
  // 这里可以替换为实际的API调用
  // 目前返回一些示例数据
  return [
    {
      id: '1',
      title: 'GitHub',
      description: '世界上最大的代码托管平台，支持版本控制和协作开发',
      url: 'https://github.com',
      icon: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'
    },
    {
      id: '2', 
      title: 'Figma',
      description: '在线协作设计工具，用于UI/UX设计和原型制作',
      url: 'https://figma.com',
      icon: 'https://cdn.worldvectorlogo.com/logos/figma-5.svg'
    },
    {
      id: '3',
      title: 'Notion',
      description: '全能的工作区，集笔记、数据库、项目管理于一体',
      url: 'https://notion.so',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png'
    }
  ];
};