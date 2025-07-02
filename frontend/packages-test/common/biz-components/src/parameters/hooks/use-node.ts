import { useContext } from 'react';

import NodeContext, { type Node } from '../context/node-context';

export default function useNode(): Node {
  const node = useContext(NodeContext);
  return node;
}
