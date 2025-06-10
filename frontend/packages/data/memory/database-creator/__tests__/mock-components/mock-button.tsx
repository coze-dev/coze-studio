import React from 'react';

export const MockButton = (props: {
  children: React.ReactElement;
  onClick: () => void;
}) => <button onClick={props.onClick}>{props.children}</button>;
