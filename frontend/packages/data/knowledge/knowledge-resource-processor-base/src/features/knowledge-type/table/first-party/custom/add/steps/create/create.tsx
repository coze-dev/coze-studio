import { type TableLocalContentProps } from '../../types';
import { TableCustomCreate as TableCustomCreateV2 } from './create-v2';

/** 到时候要删掉 TableCustomCreateV1*/
export const TableCustomCreate = (props: TableLocalContentProps) => (
  <TableCustomCreateV2 {...props} />
);
