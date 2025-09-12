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
  <PageList
    title={I18n.t('Project_tools')}
    getDataList={() => getExternalAppData()}
    renderCard={data => (
      <ExternalAppCard {...(data as ExternalAppCardProps)} />
    )}
    renderCardSkeleton={() => (
      <div className="h-[278px] bg-gray-200 animate-pulse rounded-lg" />
    )}
  />
);

const getExternalAppData = async (): Promise<ExternalAppCardProps[]> => {
  // 静态配置：按需展示 4 个外部应用
  return [
    {
      id: 'app4',
      title: 'AI陪练助手',
      description: '智能化陪练与辅导，提升学习与训练效率',
      url: 'https://app4-agent.finmall.com/',
      icon: 'https://api.iconify.design/mdi/robot.svg',
    },
    {
      id: 'app3',
      title: '切题助手',
      description: '智能切题与推荐，快速定位关键信息',
      url: 'https://app3-agent.finmall.com/',
      icon: 'https://api.iconify.design/mdi/playlist-check.svg',
    },
    {
      id: 'app2',
      title: '行业研究热点聚焦助手',
      description: '聚焦行业热点与趋势，辅助研究决策',
      url: 'https://app2-agent.finmall.com/',
      icon: 'https://api.iconify.design/mdi/chart-line.svg',
    },
    {
      id: 'app1',
      title: '员工测试题AI问卷生成系统助手',
      description: '一键生成测试问卷与题库，助力员工评测',
      url: 'https://app1-agent.finmall.com/',
      icon: 'https://api.iconify.design/mdi/clipboard-text-outline.svg',
    },
  ];
};
