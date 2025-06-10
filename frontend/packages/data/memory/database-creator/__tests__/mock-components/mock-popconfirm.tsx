import React from 'react';

export const MockPopConfirm = (props: {
  title: string;
  content: string;
  okText: string;
  cancelText: string;
  onConfirm: () => void;
  children: React.ReactElement;
}) => {
  const { title, content, okText, cancelText, onConfirm, children } = props;
  return (
    <>
      <div>{title}</div>
      <div>{content}</div>
      {children}
      <button onClick={onConfirm}>{okText}</button>
      <button>{cancelText}</button>
    </>
  );
};
