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
 * 按照功能导出所有 hooks
 */

// 文档管理
export { useDocumentManagement } from './use-case/use-document-management';

// 文档信息
export { useDocumentInfo } from './life-cycle/use-document-info';

// 文档片段数据
export { useSliceData } from './life-cycle/use-slice-data';

// 层级分段数据
export { useLevelSegments } from './use-case/use-level-segments';

// 文档片段计数
export { useSliceCounter } from './use-case/use-slice-counter';

// 文件预览
export { useFilePreview } from './use-case/use-file-preview';

// 模态框
export { useModals } from './use-case/use-modals';
