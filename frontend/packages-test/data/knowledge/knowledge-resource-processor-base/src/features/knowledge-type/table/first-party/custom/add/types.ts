import { type ContentProps } from '@coze-data/knowledge-resource-processor-core';

import {
  type UploadTableAction,
  type UploadTableState,
} from '../../../interface';
import { type TableCustomStep } from './constant';

export type TableLocalContentProps = ContentProps<
  UploadTableAction<TableCustomStep> & UploadTableState<TableCustomStep>
>;
