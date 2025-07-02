/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  createMinimalBrowserClient,
  jsErrorPlugin,
  customPlugin,
} from '@coze-studio/slardar-adapter';

import { CHAT_CORE_VERSION } from '../../shared/const';
interface SlardarConfig {
  env: string;
}

export const slardarInstance = createMinimalBrowserClient();

export const createSlardarConfig = (defaultConfig: SlardarConfig): any => {
  const { env } = defaultConfig;
  return {
    bid: 'bot_studio_sdk',
    release: CHAT_CORE_VERSION,
    env,
    integrations: [jsErrorPlugin(), customPlugin()] as any,
  };
};
