/* eslint-disable @typescript-eslint/naming-convention */
import { createContext } from 'react';

export interface Node {
  field?: string;
}

const NodeContext = createContext<Node>({});

export default NodeContext;
