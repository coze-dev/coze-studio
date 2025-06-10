import {
  reporter,
  type CustomEvent,
  type ErrorEvent,
} from '@coze-arch/logger';

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
