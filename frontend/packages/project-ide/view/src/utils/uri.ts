import { type URI } from '@coze-project-ide/core';

export const isURIMatch = (uriA: URI, uriB: URI) =>
  uriA.withoutQuery().toString() === uriB.withoutQuery().toString();
