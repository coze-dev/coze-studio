import type { SetterExtension } from '@flowgram-adapter/free-layout-editor';

import { Sql } from './sql';

export const sql: SetterExtension = {
  key: 'sql',
  component: Sql,
};
