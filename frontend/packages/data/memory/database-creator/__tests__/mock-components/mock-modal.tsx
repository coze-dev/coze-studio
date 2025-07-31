/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
