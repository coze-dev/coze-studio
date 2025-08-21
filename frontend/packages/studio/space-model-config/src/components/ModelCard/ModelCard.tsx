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

import React from 'react';
import type { SpaceModelItem } from '@coze-arch/bot-space-api';
import { formatNumber } from '@coze-arch/utils';

export interface ModelCardProps {
  model: SpaceModelItem;
  className?: string;
  onClick?: (model: SpaceModelItem) => void;
}

export const ModelCard: React.FC<ModelCardProps> = ({
  model,
  className = '',
  onClick,
}) => {
  const handleClick = () => {
    onClick?.(model);
  };

  const contextLengthText = model.context_length > 0 
    ? formatNumber(model.context_length)
    : 'N/A';

  return (
    <div
      className={`
        model-card border border-gray-200 rounded-lg p-4 
        hover:shadow-md hover:border-blue-300 
        transition-all duration-200 cursor-pointer
        bg-white
        ${className}
      `}
      onClick={handleClick}
    >
      <div className="flex items-start space-x-3">
        {/* 模型图标 */}
        <div className="flex-shrink-0">
          <img
            src={model.icon_uri}
            alt={model.name}
            className="w-12 h-12 rounded-lg object-cover"
            onError={(e) => {
              // 图标加载失败时的默认处理
              const target = e.target as HTMLImageElement;
              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiByeD0iOCIgZmlsbD0iI0Y1RjVGNSIvPgo8cGF0aCBkPSJNMjQgMzJDMjguNDE4MyAzMiAzMiAyOC40MTgzIDMyIDI0QzMyIDE5LjU4MTcgMjguNDE4MyAxNiAyNCAxNkMxOS41ODE3IDE2IDE2IDE5LjU4MTcgMTYgMjRDMTYgMjguNDE4MyAxOS41ODE3IDMyIDI0IDMyWiIgZmlsbD0iI0Q5RDlEOSIvPgo8L3N2Zz4K';
            }}
          />
        </div>

        {/* 模型信息 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-medium text-gray-900 truncate">
              {model.name}
            </h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {model.protocol}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
            {model.description || '暂无描述'}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              <span className="font-medium">上下文长度:</span>
              <span className="ml-1 text-blue-600 font-mono">
                {contextLengthText}
              </span>
            </div>
            
            {model.custom_config && Object.keys(model.custom_config).length > 0 && (
              <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                自定义配置
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};