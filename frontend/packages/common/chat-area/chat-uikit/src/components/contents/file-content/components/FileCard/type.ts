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
 
import {
  type IFileAttributeKeys,
  type IFileCardTooltipsCopyWritingConfig,
  type IFileInfo,
  type Layout,
} from '@coze-common/chat-uikit-shared';

export interface IFileCardProps {
  file: IFileInfo;
  /**
   * 用于识别成功 / 失败状态的key
   */
  attributeKeys: IFileAttributeKeys;
  /**
   * 文案配置
   */
  tooltipsCopywriting?: IFileCardTooltipsCopyWritingConfig;
  /**
   * 是否只读
   */
  readonly?: boolean;
  /**
   * 取消上传事件回调
   */
  onCancel: () => void;
  /**
   * 重试上传事件回调
   */
  onRetry: () => void;
  /**
   * 拷贝url事件回调
   */
  onCopy: () => void;
  className?: string;
  layout: Layout;
  showBackground: boolean;
}
