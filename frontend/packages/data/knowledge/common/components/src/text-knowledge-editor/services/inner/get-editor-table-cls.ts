import classNames from 'classnames';

export const getEditorTableClassname = () =>
  classNames(
    // 表格样式
    '[&_table]:border-collapse [&_table]:m-0 [&_table]:w-full [&_table]:table-fixed [&_table]:overflow-hidden [&_table]:text-[0.9em]',
    '[&_table_td]:border [&_table_th]:border [&_table_td]:border-[#ddd] [&_table_th]:border-[#ddd]',
    '[&_table_td]:p-2 [&_table_th]:p-2',
    '[&_table_td]:relative [&_table_th]:relative',
    '[&_table_td]:align-top [&_table_th]:align-top',
    '[&_table_td]:box-border [&_table_th]:box-border',
    '[&_table_td]:border-solid [&_table_th]:border-solid',
    '[&_table_td]:min-w-[100px] [&_table_th]:min-w-[100px]',
  );
