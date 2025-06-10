import {
  GrabElementType,
  type GrabLinkElement,
  type GrabNode,
} from '../../types/node';

export const isGrabLink = (node: GrabNode): node is GrabLinkElement =>
  node && 'url' in node && 'type' in node && node.type === GrabElementType.LINK;
