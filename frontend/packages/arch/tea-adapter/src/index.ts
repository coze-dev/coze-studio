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

/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  type EVENT_NAMES,
  type ParamsTypeDefine,
} from '@coze-studio/tea-interface/events';
import {
  type IInitParam as RawIInitParam,
  type IConfigParam as IConfigParamCN,
  type IConfigParamOversea,
  type Collector,
} from '@coze-studio/tea-interface';

type IInitParam = RawIInitParam & {
  autoStart?: boolean;
};

export interface Tea {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Collector: typeof Collector;

  getInstance: () => Tea;

  init: (initParam: Partial<IInitParam>) => Promise<void>;

  config: (config: IConfigParamOversea | IConfigParamCN) => void;

  reStart: () => void;

  sdkReady: boolean;

  getConfig: (key: string) => string | undefined;

  event: (
    event: string | EVENT_NAMES,
    params?: unknown | ParamsTypeDefine[EVENT_NAMES],
  ) => void;

  start: () => void;

  stop: () => void;

  sendEvent: <TEventName extends EVENT_NAMES>(
    event: TEventName,
    params?: ParamsTypeDefine[TEventName],
  ) => void;

  resetStayParams: (pathname: string, title: string, href: string) => void;

  checkInstance: () => void;
}

const noop = () => {
  // do nothing
};
const mockTea = noop;

const proxyHandler = {
  get(_target: any, prop, _receiver: any) {
    return mockTea[prop] || noop;
  },
  apply(_target: any, _thisArg: any, argumentsList: unknown[]) {
    return mockTea(...(argumentsList as Parameters<typeof mockTea>));
  },
};

const proxy = new Proxy(function () {
  // do nothing
}, proxyHandler);

export default proxy as Tea;
