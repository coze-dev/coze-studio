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

import { useState, type FC } from 'react';
import { Button } from '@coze-arch/coze-design';
import { type IBaseContentProps } from '@coze-common/chat-uikit-shared';

import { TextContent } from '../text-content';
import './index.less';

export interface SpecialAnswerContentProps extends IBaseContentProps {
  contentList?: Array<{
    displayResponseType?: string;
    templateId?: string;
    kvMap?: Record<string, any>;
    dataResponse?: Record<string, any>;
  }>;
}

/**
 * 特殊answer消息组件，用于处理包含displayResponseType的消息
 * 支持原生显示和iframe嵌套显示两种模式
 */
export const SpecialAnswerContent: FC<SpecialAnswerContentProps> = props => {
  const { message, contentList, ...restProps } = props;
  const [viewMode, setViewMode] = useState<'iframe' | 'native'>('iframe'); // 默认显示卡片

  // 检查是否有displayResponseType内容
  const specialContent = contentList?.find(item => item.displayResponseType);

  if (!specialContent) {
    // 如果没有特殊内容，回退到普通文本组件
    return <TextContent message={message} {...restProps} />;
  }

  // 生成iframe URL
  const generateIframeUrl = () => {
    const { templateId, kvMap, dataResponse } = specialContent;
    const baseUrl = 'https://agent.finmall.com/agent-h5-web/card/index.html';
    
    // 优先使用kvMap，否则使用dataResponse
    const data = kvMap && Object.keys(kvMap).length > 0 ? kvMap : dataResponse;
    
    if (!templateId || !data) {
      return baseUrl;
    }

    // 编码JSON数据
    const encodedData = encodeURIComponent(JSON.stringify(data));
    const iframeUrl = `${baseUrl}?code=${templateId}&data=${encodedData}`;
    
    // 打印调试信息
    console.log('🔗 iframe链接:', iframeUrl);
    console.log('📊 使用的数据:', data);
    console.log('🏷️ templateId:', templateId);
    
    return iframeUrl;
  };

  return (
    <div className="special-answer-content">
      {/* 内容区域 */}
      <div className="answer-content">
        {viewMode === 'native' ? (
          <div className="special-answer-native">
            {/* 显示原始消息内容 */}
            <TextContent message={message} {...restProps} />
            
            {/* 显示特殊内容的JSON数据（调试用） */}
            <div className="special-answer-data">
              <details>
                <summary>原始数据</summary>
                <pre>{JSON.stringify(specialContent, null, 2)}</pre>
              </details>
            </div>
          </div>
        ) : (
          <div className="special-answer-iframe">
            <iframe
              src={generateIframeUrl()}
              width="100%"
              height="400px"
              frameBorder="0"
              title="Special Answer Content"
              sandbox="allow-scripts allow-same-origin allow-forms"
            />
          </div>
        )}
      </div>
      
      {/* 底部控制区域 */}
      <div className="answer-footer">
        <div className="view-mode-toggle">
          <div 
            className={`toggle-option left ${viewMode === 'iframe' ? 'active' : ''}`}
            onClick={() => setViewMode('iframe')}
            title="卡片显示"
          >
            卡片
          </div>
          <div className="toggle-divider"></div>
          <div 
            className={`toggle-option right ${viewMode === 'native' ? 'active' : ''}`}
            onClick={() => setViewMode('native')}
            title="原生显示"
          >
            原生
          </div>
        </div>
      </div>
    </div>
  );
};

SpecialAnswerContent.displayName = 'SpecialAnswerContent';