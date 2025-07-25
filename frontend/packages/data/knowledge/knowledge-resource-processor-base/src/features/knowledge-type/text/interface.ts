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
  type UploadBaseAction,
  type UploadBaseState,
} from '@coze-data/knowledge-resource-processor-core';
import {
  type DocumentInfo,
  type IndexStrategy,
  type ParsingStrategy,
  type StorageLocation,
  type OpenSearchConfig,
} from '@coze-arch/idl/knowledge';

import type { SegmentMode, CustomSegmentRule } from '@/types';

export interface UploadTextState<T extends number> extends UploadBaseState<T> {
  segmentRule: CustomSegmentRule;
  segmentMode: SegmentMode;
  enableStorageStrategy: boolean;
  storageLocation: StorageLocation;
  openSearchConfig: OpenSearchConfig;
  testConnectionSuccess: boolean;
}

export interface UploadTextAction<T extends number>
  extends UploadBaseAction<T> {
  setSegmentRule: (rule: CustomSegmentRule) => void;
  setSegmentMode: (mode: SegmentMode) => void;
  setEnableStorageStrategy: (enable: boolean) => void;
  setStorageLocation: (location: StorageLocation) => void;
  setOpenSearchConfig: (config: OpenSearchConfig) => void;
  setTestConnectionSuccess: (testConnectionSuccess: boolean) => void;
}

export type UploadTextStore<T extends number> = UploadTextState<T> &
  UploadTextAction<T>;

export interface FilterPageConfig {
  // 注意页码从 1 开始
  pageIndex: number;
  isFilter: boolean;
}

/**
 * 业务含义是 crop 框距离四个边缘距离占整个 pdf 尺寸的百分比
 * 取值 [0, 1] 粒度 0.01
 */
export interface CropperSizePercent {
  topPercent: number;
  bottomPercent: number;
  leftPercent: number;
  rightPercent: number;
}

export interface PDFDocumentFilterValue {
  uri: string;
  filterPagesConfig: FilterPageConfig[];
  cropperSizePercent: CropperSizePercent | null;
}

export interface LevelChunkStrategy {
  maxLevel?: number | string;
  isSaveTitle?: boolean;
}

export interface LocalTextCustomResegmentState {
  parsingStrategy: ParsingStrategy;
  indexStrategy: IndexStrategy;
  filterStrategy: PDFDocumentFilterValue[];
  levelChunkStrategy: LevelChunkStrategy;
}

export interface TextCustomResegmentState {
  documentInfo: DocumentInfo | null;
}

export interface TextCustomResegmentAction {
  setDocumentInfo: (doc: DocumentInfo) => void;
}

export interface LocalTextCustomResegmentAction {
  setParsingStrategyByMerge: (strategy: ParsingStrategy) => void;
  setIndexStrategyByMerge: (strategy: IndexStrategy) => void;
  setFilterStrategy: (strategy: PDFDocumentFilterValue[]) => void;
  setLevelChunkStrategy: (
    key: keyof LevelChunkStrategy,
    value: LevelChunkStrategy[keyof LevelChunkStrategy],
  ) => void;
}
