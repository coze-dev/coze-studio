import { createContext } from 'react';

import { type WorkflowNode } from '../entities';

export const WorkflowNodeContext = createContext<WorkflowNode | undefined>(
  undefined,
);
