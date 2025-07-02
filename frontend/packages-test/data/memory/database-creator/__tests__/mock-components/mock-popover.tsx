import React from 'react';

export const MockPopover = (props: {
  content: React.ReactElement;
  children: React.ReactElement;
  visible: boolean;
}) => (
  <>
    {props.visible ? (
      <div>
        {props.content}
        {props.children}
      </div>
    ) : (
      <div>{props.children}</div>
    )}
  </>
);
