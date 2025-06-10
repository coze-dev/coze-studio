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
  // 目前只需要区分出 store 的场景
  scene?: Scene;
}
export const useCreateGrabPlugin = (params?: Params) => {
  const { onQuote, scene = 'other' } = params ?? {};
  const [grabEnableUpload, setGrabEnableUpload] = useState(true);

  // eslint-disable-next-line @typescript-eslint/naming-convention -- 符合预期的命名
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
