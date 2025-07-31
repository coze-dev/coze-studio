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
 * Export all hooks by function
 */

// Document Management
export { useDocumentManagement } from './use-case/use-document-management';

// Document information
export { useDocumentInfo } from './life-cycle/use-document-info';

// document fragment data
export { useSliceData } from './life-cycle/use-slice-data';

// hierarchical segmented data
export { useLevelSegments } from './use-case/use-level-segments';

// Document fragment count
export { useSliceCounter } from './use-case/use-slice-counter';

// file preview
export { useFilePreview } from './use-case/use-file-preview';

// modal box
export { useModals } from './use-case/use-modals';
