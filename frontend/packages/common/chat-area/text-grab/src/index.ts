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

export { useGrab } from './hooks/use-grab';
export { SelectionData } from './types/selection';
export { type GrabPosition } from './types/selection';
export { parseMarkdownToGrabNode } from './utils/parse-markdown-to-grab-node';
export {
  GrabElement,
  GrabElementType,
  GrabImageElement,
  GrabLinkElement,
  GrabNode,
  GrabText,
} from './types/node';
export {
  CONTENT_ATTRIBUTE_NAME,
  MESSAGE_SOURCE_ATTRIBUTE_NAME,
} from './constants/range';
export { isGrabTextNode } from './utils/normalizer/is-grab-text-node';
export { isGrabLink } from './utils/normalizer/is-grab-link';
export { isGrabImage } from './utils/normalizer/is-grab-image';
export { getAncestorAttributeValue } from './utils/get-ancestor-attribute-value';
export { getAncestorAttributeNode } from './utils/get-ancestor-attribute-node';
export { getHumanizedContentText } from './utils/normalizer/get-humanize-content-text';
export { getOriginContentText } from './utils/normalizer/get-origin-content-text';
export { Direction } from './types/selection';
export { isTouchDevice } from './utils/is-touch-device';
