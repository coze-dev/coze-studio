import {
  GrabElementType,
  type GrabImageElement,
  type GrabNode,
} from '../../types/node';

export const isGrabImage = (node: GrabNode): node is GrabImageElement =>
  node &&
  'src' in node &&
  'type' in node &&
  node.type === GrabElementType.IMAGE;
