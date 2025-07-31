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
   * Key used to identify success/failure status
   */
  attributeKeys: IFileAttributeKeys;
  /**
   * copywriting configuration
   */
  tooltipsCopywriting?: IFileCardTooltipsCopyWritingConfig;
  /**
   * Is it read-only?
   */
  readonly?: boolean;
  /**
   * Cancel upload event callback
   */
  onCancel: () => void;
  /**
   * Retry upload event callback
   */
  onRetry: () => void;
  /**
   * Copy URL event callback
   */
  onCopy: () => void;
  className?: string;
  layout: Layout;
  showBackground: boolean;
}
