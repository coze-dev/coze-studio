import {
  RowInternalStatus,
  type TableData,
} from '../components/database-table-data/type';

export const isTableDataErrorOrUnSubmit = (tableData: TableData) => {
  const hasErrorOrUnSubmit =
    Boolean(tableData.dataList.length) &&
    tableData.dataList.some(item =>
      [RowInternalStatus.UnSubmit, RowInternalStatus.Error].includes(
        item.internalStatus,
      ),
    );

  return hasErrorOrUnSubmit;
};
