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

import { devtools } from 'zustand/middleware';
import { create } from 'zustand';

const defaultState = {
  processingDatasets: new Set<string>(),
};

export interface ProcessingKnowledgeInfo {
  processingDatasets: Set<string>;
}

export interface ProcessingKnowledgeInfoAction {
  getIsProcessing: (datasetId: string) => boolean;
  addProcessingDataset: (datasetId: string) => void;
  clearProcessingSet: () => void;
  deleteProcessingDataset: (datasetId: string) => void;
}

export const createProcessingKnowledgeStore = () =>
  create<ProcessingKnowledgeInfo & ProcessingKnowledgeInfoAction>()(
    devtools((set, get) => ({
      ...defaultState,
      getIsProcessing: (datasetId: string) => {
        const { processingDatasets } = get();
        return processingDatasets.has(datasetId);
      },
      addProcessingDataset: (datasetId: string) => {
        const { processingDatasets } = get();
        processingDatasets.add(datasetId);
        set({
          processingDatasets,
        });
      },
      clearProcessingSet: () => {
        const { processingDatasets } = get();
        processingDatasets.clear();
        set({
          processingDatasets,
        });
      },
      deleteProcessingDataset: (datasetId: string) => {
        const { processingDatasets } = get();
        if (!processingDatasets.has(datasetId)) {
          return;
        }
        processingDatasets.delete(datasetId);
        set({
          processingDatasets,
        });
      },
    })),
  );

export type ProcessingKnowledgeStore = ReturnType<
  typeof createProcessingKnowledgeStore
>;
