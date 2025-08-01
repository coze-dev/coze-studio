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

export * from './components';
export * from './utils';
export { FullWidthAligner } from './components/common/full-width-aligner';
export { ToNewestTipUI } from './components/common/to-newest-tip';
export { getFileExtensionAndName } from './utils/file-name';
export { MessageBoxTheme } from './components/common/message-box/type';

export { useStateWithLocalCache } from './hooks/use-state-with-local-cache';

export {
  UIKitCustomComponentsProvider,
  type UIKitCustomComponents,
  type UIKitCustomComponentsMap,
} from './context/custom-components';
export { LocalCacheContext, useLocalCache } from './context/local-cache';
export {
  getReadLocalStoreValue,
  getWriteLocalStoreValue,
} from './utils/local-cache';

import { ContentType } from '@coze-common/chat-core/message/types';

export { ContentType };

export { SUCCESS_FILE_ICON_MAP } from './components/contents/file-content/components/FileCard/constants';
export {
  CozeImage,
  CozeImageWithPreview,
  CozeImageProps,
} from './components/md-box-slots/coze-image';
export { useUIKitCustomComponent } from './context/custom-components';

export { MESSAGE_TYPE_VALID_IN_TEXT_LIST } from './constants/content-box';
export {
  EXPECT_CONTEXT_WIDTH_MOBILE,
  EXPECT_CONTEXT_WIDTH_PC,
  MD_BOX_INNER_PADDING,
} from './constants/message-box';

export { MODE_CONFIG } from './components/chat/with-rule-img-background/const';

export { CozeLink } from './components/md-box-slots/link';

export { LazyCozeMdBox } from './components/common/coze-md-box/lazy';
export { type MessageBoxProps } from './components/common/message-box/type';

export { NO_MESSAGE_ID_MARK } from './constants/grab';
export { default as ZipIcon } from './assets/file/zip-success.svg';
export { default as XlsxIcon } from './assets/file/xlsx-success.svg';
export { default as VideoIcon } from './assets/file/video-success.svg';
export { default as TextIcon } from './assets/file/txt-success.svg';
export { default as PptIcon } from './assets/file/ppt-success.svg';
export { default as ImageIcon } from './assets/file/image-success.svg';
export { default as DocxIcon } from './assets/file/docx-success.svg';
export { default as CodeIcon } from './assets/file/code-success.svg';
export { default as AudioIcon } from './assets/file/audio-success.svg';
export {
  AudioStaticToast,
  type AudioStaticToastProps,
} from './components/chat/audio-record/audio-static-toast';
