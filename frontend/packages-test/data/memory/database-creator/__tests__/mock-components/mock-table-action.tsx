import React from 'react';

export const MockUITableAction = (props: {
  deleteProps: {
    handleClick: () => void;
    tooltip: {
      content: string;
    };
  };
}) => {
  const { handleClick, tooltip } = props.deleteProps;
  return <button onClick={handleClick}>{tooltip.content}</button>;
};
