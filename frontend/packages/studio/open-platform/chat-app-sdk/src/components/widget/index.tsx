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

import { type FC } from 'react';

import { getCssVars } from '@/util/style';
import { type CozeWidgetProps, type WidgetAdapterProps } from '@/types/chat';
import { GlobalStoreProvider } from '@/store/context';
import { useMessageInteract } from '@/hooks/use-message-interact';
import { useImagePreview } from '@/hooks/use-image-preview';

import { ImagePreview } from './image-preview';
import { ChatContent } from './chat-content';
import { AstBtn } from './ast-btn';

const IFRAME_INDEX = 2;

const WidgetAdapter: FC<WidgetAdapterProps> = ({ client, position }) => {
  useImagePreview(client);
  useMessageInteract(client.chatClientId, client.options);

  const { base: baseConf } = client?.options?.ui || {};
  const zIndex = baseConf?.zIndex;
  const zIndexStyle = getCssVars({ zIndex });

  return (
    <>
      <ChatContent client={client} />
      <ImagePreview
        zIndex={zIndexStyle['--coze-z-index-iframe'] + IFRAME_INDEX}
      />
      <AstBtn client={client} position={position} />
    </>
  );
};

const CozeClientWidget: FC<CozeWidgetProps> = props => (
  <GlobalStoreProvider globalStore={props.globalStore}>
    <WidgetAdapter {...props} />
  </GlobalStoreProvider>
);

export default CozeClientWidget;
