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

import { reporter, type CustomEvent, type ErrorEvent } from '@coze-arch/logger';

import { type DataNamespace } from '../constants';
export const reporterFun = <EventEnum extends string>(
  params: {
    namespace: DataNamespace;
    meta: { [key: string]: unknown };
  } & (
    | {
        type: 'error';
        event: ErrorEvent<EventEnum>;
      }
    | {
        type: 'custom';
        event: CustomEvent<EventEnum>;
      }
  ),
) => {
  const { type, namespace, event, meta } = params;
  const { meta: inputMeta, ...rest } = event;
  const eventParams = {
    namespace,
    meta: {
      ...meta,
      ...inputMeta,
    },
    ...rest,
  };

  if (type === 'error') {
    reporter.errorEvent(eventParams as ErrorEvent<EventEnum>);
  } else {
    reporter.event(eventParams);
  }
};
