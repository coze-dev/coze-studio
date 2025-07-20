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
 
import { escapeHtml } from '@/text-knowledge-editor/utils/escape-html';

/**
 * 获取渲染后的HTML内容
 */
export const getRenderHtmlContent = (content: string) => {
  if (content === '') {
    return '';
  }

  // 转义HTML，只允许白名单中的标签
  const htmlContent = escapeHtml(content);

  // 编辑器对/n不会换行，所以需要转换为<br />标签
  return htmlContent.replace(/\n/g, '<br />');
};
