import { devtools } from 'zustand/middleware';
import { create } from 'zustand';

import { type DatabaseDetailTab } from './types';

interface OpenDatabaseDetailProps {
  databaseID: string;
  isAddedInWorkflow: boolean;
  tab?: DatabaseDetailTab;
  onChangeDatabaseToWorkflow: (databaseID?: string) => void;
}

interface WorkflowDetailModalStore {
  isVisible: boolean;
  isAddedInWorkflow: boolean;
  databaseID: string;
  tab?: DatabaseDetailTab;
  onChangeDatabaseToWorkflow: (databaseID?: string) => void;
  open: (props: OpenDatabaseDetailProps) => void;
  close: () => void;
}

export const useWorkflowDetailModalStore = create<WorkflowDetailModalStore>()(
  devtools(set => ({
    isVisible: false,
    databaseID: '',
    isAddedInWorkflow: false,
    tab: 'structure',

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onChangeDatabaseToWorkflow: () => {},

    open: ({
      databaseID,
      isAddedInWorkflow = false,
      onChangeDatabaseToWorkflow,
      tab,
    }: OpenDatabaseDetailProps) => {
      set({
        isVisible: true,
        databaseID,
        isAddedInWorkflow,
        onChangeDatabaseToWorkflow,
        tab,
      });
    },

    close: () => {
      set({ isVisible: false });
    },
  })),
);
