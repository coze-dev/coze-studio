import { type GrabNode, type GrabText } from '../../types/node';

export const isGrabTextNode = (node: GrabNode): node is GrabText =>
  node && 'text' in node;
