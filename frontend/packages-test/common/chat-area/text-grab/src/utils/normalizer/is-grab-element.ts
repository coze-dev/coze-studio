import { type GrabElement, type GrabNode } from '../../types/node';

export const isGrabElement = (node: GrabNode): node is GrabElement =>
  node && 'children' in node && 'type' in node;
