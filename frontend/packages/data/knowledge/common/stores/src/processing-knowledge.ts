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
