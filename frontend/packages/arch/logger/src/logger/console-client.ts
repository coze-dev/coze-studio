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

import { isEmpty } from 'lodash-es';

import {
  type LogOptions,
  type LogLevel,
  type LoggerReportClient,
  type CommonLogOptions,
  LogAction,
} from '../types';

export function getColorByLogLevel(type?: LogLevel) {
  if (type === 'success') {
    return '#00CC00';
  } else if (type === 'warning') {
    return '#CC9900';
  } else if (type === 'error') {
    return '#CC3333';
  } else if (type === 'fatal') {
    return '#FF0000';
  } else {
    return '#0099CC';
  }
}

function doConsole(
  { namespace, scope, level, message, eventName, ...rest }: LogOptions,
  ...restArgs: unknown[]
) {
  const logs: unknown[] = [
    `%c Logger %c ${namespace ? namespace : level}${
      scope ? ` %c ${scope}` : ''
    } %c`,
    'background:#444444; padding: 1px; border-radius: 3px 0 0 3px; color: #fff',
    `background:${getColorByLogLevel(level)}; padding: 1px; border-radius: ${
      scope ? '0' : '0 3px 3px 0'
    }; color: #fff`,
    scope
      ? 'background:#777777; padding: 1px; border-radius: 0 3px 3px 0; color: #fff; margin-left: -1px;'
      : 'background:transparent',
  ];

  if (scope) {
    logs.push('background:transparent');
  }

  logs.push(eventName || message);
  const payload = rest.error ? rest : rest.meta;
  if (!isEmpty(payload)) {
    logs.push(payload);
  }
  logs.push(...restArgs);

  console.groupCollapsed(...logs);
}

export class ConsoleLogClient implements LoggerReportClient {
  send({ meta, message, eventName, action, ...rest }: CommonLogOptions) {
    const resolvedMsg = message
      ? message
      : eventName
      ? `Event: ${eventName}`
      : undefined;
    if (!action?.includes(LogAction.CONSOLE) || !resolvedMsg) {
      return;
    }
    const payload = { ...rest, message: resolvedMsg };
    if (meta) {
      doConsole(payload, meta);
    } else {
      doConsole(payload);
    }
    console.trace();
    console.groupEnd();
  }
}

export const consoleLogClient = new ConsoleLogClient();
