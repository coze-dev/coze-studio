import React from 'react';

export const MockUITable = (props: {
  tableProps: {
    columns: {
      dataIndex: string;
      title: React.ReactElement;
      render: (text, record, index) => React.ReactElement;
    }[];
    dataSource: Record<string, any>[];
  };
}) => {
  const { columns, dataSource } = props.tableProps;

  return (
    <>
      {columns.map(column => {
        const { title, dataIndex, render } = column;
        return (
          <div key={dataIndex}>
            {title}
            {dataSource.map((data, index) => render(undefined, data, index))}
          </div>
        );
      })}
    </>
  );
};
