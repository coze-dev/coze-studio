import React from 'react';

export const MockTooltip = (props: {
  children: React.ReactElement;
  content: string;
}) => (
  <>
    <div>{props.content}</div>
    {props.children}
  </>
);
