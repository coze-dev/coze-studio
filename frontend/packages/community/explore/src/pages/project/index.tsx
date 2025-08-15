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

import { useParams } from 'react-router-dom';
import { explore } from '@coze-studio/api-schema';
import {
  TemplateCard,
  type TemplateCardProps,
  TemplateCardSkeleton,
} from '@coze-community/components';
import { I18n } from '@coze-arch/i18n';

import { PageList } from '../../components/page-list';
import { ExternalAppCard, type ExternalAppCardProps } from './external-app-card';

// 导入外部应用图片
import externalApp2 from '../../../assets/external-app-2.png';
import externalApp3 from '../../../assets/external-app-3.png';
import externalApp4 from '../../../assets/external-app-4.png';
import externalApp5 from '../../../assets/external-app-5.png';
import externalApp6 from '../../../assets/external-app-6.png';

export const ProjectPage = () => {
  const { project_type } = useParams();
  
  // 如果是 tools 路径，显示外部应用页面
  if (project_type === 'tools') {
    return (
      <PageList
        title={I18n.t('Project_tools')}
        getDataList={() => getExternalAppData()}
        renderCard={data => <ExternalAppCard {...(data as ExternalAppCardProps)} />}
        renderCardSkeleton={() => <div className="h-[278px] bg-gray-200 animate-pulse rounded-lg" />}
      />
    );
  }
  
  // 默认显示原来的项目页面
  return (
    <PageList
      title={I18n.t('Project')}
      getDataList={() => getTemplateData()}
      renderCard={data => <TemplateCard {...(data as TemplateCardProps)} />}
      renderCardSkeleton={() => <TemplateCardSkeleton />}
    />
  );
};

const getTemplateData = async () => {
  const result = await explore.PublicGetProductList({
    entity_type: explore.product_common.ProductEntityType.TemplateCommon,
    sort_type: explore.product_common.SortType.Newest,
    page_num: 0,
    page_size: 1000,
  });
  return result.data?.products || [];
};

const getExternalAppData = async (): Promise<ExternalAppCardProps[]> => {
  // 返回AI助手应用数据
  return [
    {
      id: '1',
      title: '切题助手',
      description: '智能解题助手，帮助快速理解和解决各类题目',
      url: 'https://app3-agent.finmall.com/',
      icon: externalApp2
    },
    {
      id: '2', 
      title: 'AI陪练助手',
      description: '智能陪练系统，提供个性化的学习辅导和练习',
      url: 'https://app4-agent.finmall.com/',
      icon: externalApp3
    },
    {
      id: '3',
      title: '员工测试题AI问卷生成系统',
      description: '自动生成员工测试题和问卷，提高工作效率',
      url: 'https://app1-agent.finmall.com/',
      icon: externalApp4
    },
    {
      id: '4',
      title: '行业研究热点聚焦助手',
      description: '快速聚焦行业热点，提供深度研究分析',
      url: 'https://app2-agent.finmall.com/',
      icon: externalApp5
    },
    {
      id: '5',
      title: '营销文案助手',
      description: '智能生成营销文案，提升营销效果',
      url: 'https://dk.luzhipeng.com/',
      icon: externalApp6
    }
  ];
};
