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

/**
 * 检测是否为特殊的answer消息（包含displayResponseType）
 */
export function isSpecialAnswerMessage(message: any): boolean {
  // 必须是answer类型的消息
  if (message?.type !== 'answer') {
    return false;
  }

  if (!message.content || typeof message.content !== 'string') {
    return false;
  }

  try {
    // 尝试解析JSON内容
    const contentData = JSON.parse(message.content);
    
    // 检查是否有contentList且包含displayResponseType
    if (Array.isArray(contentData?.contentList)) {
      const hasSpecialType = contentData.contentList.some((item: any) => 
        item && typeof item === 'object' && 'displayResponseType' in item
      );
      
      // 添加调试日志
      if (hasSpecialType) {
        console.log('🎯 检测到特殊answer消息:', message.message_id, contentData);
      }
      
      return hasSpecialType;
    }

    return false;
  } catch (error) {
    // 如果JSON解析失败，但包含特殊关键字，也认为是特殊消息
    const isSpecial = message.content.includes('displayResponseType') && 
                      message.content.includes('contentList');
    
    if (isSpecial) {
      console.log('🎯 检测到特殊answer消息(fallback):', message.message_id, error);
    }
    
    return isSpecial;
  }
}

/**
 * 从消息中提取contentList数据
 */
export function extractContentList(message: any): Array<{
  displayResponseType?: string;
  templateId?: string;
  kvMap?: Record<string, any>;
  dataResponse?: Record<string, any>;
}> | undefined {
  if (!message?.content || typeof message.content !== 'string') {
    return undefined;
  }

  try {
    const contentData = JSON.parse(message.content);
    
    if (Array.isArray(contentData?.contentList)) {
      return contentData.contentList;
    }

    return undefined;
  } catch {
    return undefined;
  }
}