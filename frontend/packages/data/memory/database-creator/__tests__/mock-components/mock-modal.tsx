import React from 'react';

export const Modal = (props: {
  visible: boolean;
  onOk: () => void;
  onCancel: () => void;
  okText: string;
  cancelText: string;
  title: React.ReactElement;
  children: React.ReactElement;
}) => {
  if (!props.visible) {
    return <>no visible</>;
  }
  return (
    <>
      <div>{props.title}</div>
      {props.children}
      <div>
        <button onClick={props.onCancel}>{props.cancelText}</button>
        <button onClick={props.onOk}>{props.okText}</button>
      </div>
    </>
  );
};
