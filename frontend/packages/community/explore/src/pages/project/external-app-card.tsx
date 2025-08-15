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

import { type FC } from 'react';
import { Image, Space } from '@coze-arch/coze-design';
import { I18n } from '@coze-arch/i18n';
import { CardContainer, CardButton } from '@coze-community/components';

export interface ExternalAppCardProps {
  id: string;
  title: string;
  description: string;
  url: string;
  icon?: string;
}

export const ExternalAppCard: FC<ExternalAppCardProps> = ({ 
  title, 
  description, 
  url, 
  icon 
}) => {
  const handleAccessClick = () => {
    // 在新窗口打开外部应用链接
    window.open(url, '_blank');
  };

  return (
    <CardContainer className="h-[278px]" shadowMode="default">
      <div className="h-full flex flex-col">
        {/* 图片区域 */}
        <div className="relative w-full h-[140px] rounded-[8px] overflow-hidden mb-3">
          <Image
            preview={false}
            src={icon || './assets/images/default-app-icon.png'} // 默认图标
            className="w-full h-full"
            imgCls="w-full h-full object-cover object-center"
          />
        </div>
        
        {/* 信息区域 */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            {/* 标题 */}
            <h3 className="text-[16px] font-medium leading-[24px] text-[#1f2329] mb-2 line-clamp-1">
              {title}
            </h3>
            
            {/* 描述 */}
            <p className="text-[14px] leading-[20px] text-[#4e5969] line-clamp-3 mb-4">
              {description}
            </p>
          </div>
          
          {/* 按钮区域 */}
          <Space className="w-full">
            <CardButton
              onClick={handleAccessClick}
              className="w-full"
              title="立即访问"
            >
              立即访问
            </CardButton>
          </Space>
        </div>
      </div>
    </CardContainer>
  );
};