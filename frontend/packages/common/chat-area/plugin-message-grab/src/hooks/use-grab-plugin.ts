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

import { useMemo, useState } from 'react';

import { type MessageSource } from '@coze-common/chat-area';

import { type Scene, createGrabPlugin } from '../create';

interface Params {
  onQuote?: ({
    botId,
    source,
  }: {
    botId: string;
    source: MessageSource | undefined;
  }) => void;
  // At present, only the scene of the store needs to be distinguished.
  scene?: Scene;
}
export const useCreateGrabPlugin = (params?: Params) => {
  const { onQuote, scene = 'other' } = params ?? {};
  const [grabEnableUpload, setGrabEnableUpload] = useState(true);

  // eslint-disable-next-line @typescript-eslint/naming-convention -- matches the expected naming
  const { grabPlugin: GrabPlugin, grabPluginId } = useMemo(
    () =>
      createGrabPlugin({
        preference: {
          enableGrab: true,
        },
        onQuote,
        onQuoteChange: ({ isEmpty }) => {
          setGrabEnableUpload(isEmpty);
        },
        scene,
      }),
    [],
  );

  return { grabEnableUpload, GrabPlugin, grabPluginId };
};
