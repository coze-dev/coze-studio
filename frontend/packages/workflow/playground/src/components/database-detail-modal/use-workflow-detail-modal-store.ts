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
