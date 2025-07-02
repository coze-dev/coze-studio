import React from 'react';

export const MockUIButton = (props: {
  children: React.ReactElement;
  onClick: () => void;
}) => <button onClick={props.onClick}>{props.children}</button>;
