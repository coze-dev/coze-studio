import { type getOriginContentText } from '../utils/normalizer/get-origin-content-text';
import { type getNormalizeNodeList } from '../utils/normalizer/get-normalize-node-list';
import { type getHumanizedContentText } from '../utils/normalizer/get-humanize-content-text';

export interface SelectionData {
  humanizedContentText: ReturnType<typeof getHumanizedContentText>;
  originContentText: ReturnType<typeof getOriginContentText>;
  normalizeSelectionNodeList: ReturnType<typeof getNormalizeNodeList>;
  nodesAncestorIsMessageBox: boolean;
  ancestorAttributeValue: string | null;
  messageSource: number;
  direction: Direction;
}

export interface GrabPosition {
  x: number;
  y: number;
}

export const enum Direction {
  Forward = 'forward',
  Backward = 'backward',
  Unknown = 'unknown',
}
