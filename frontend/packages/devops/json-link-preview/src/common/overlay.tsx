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

import ReactDOM from 'react-dom';
import React from 'react';

import { IconCozCrossFill } from '@coze-arch/coze-design/icons';

let overlayContainer: HTMLDivElement | null = null;

interface OverlayProps {
  onClose?: VoidFunction;
  children?: React.ReactNode;
  withMask?: boolean;
}

const Overlay = ({ onClose, children, withMask }: OverlayProps) => (
  <div
    className="p-5"
    style={
      withMask
        ? {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.70)',
            zIndex: 1000,
          }
        : {}
    }
  >
    <div
      className="absolute top-5 right-5 rounded-[50%] w-[40px] h-[40px] p-[11px] flex items-center justify-center bg-[rgba(255,255,255,0.12)] backdrop-blur-md cursor-pointer"
      style={{
        zIndex: 10010,
      }}
      onClick={onClose}
    >
      <IconCozCrossFill className="w-[18px] h-[18px] text-white" />
    </div>
    {children}
  </div>
);

const createOverlayContainer = () => {
  overlayContainer = document.createElement('div');
  document.body.appendChild(overlayContainer);
};

const show = (params: {
  content: (onClose: VoidFunction) => React.ReactNode;
  withMask?: boolean;
}) => {
  const { content, withMask = true } = params;
  if (!overlayContainer) {
    createOverlayContainer();
  }

  const close = () => {
    overlayContainer && ReactDOM.unmountComponentAtNode(overlayContainer);
  };

  ReactDOM.render(
    <Overlay onClose={close} children={content?.(close)} withMask={withMask} />,
    overlayContainer,
  );

  return close;
};

const OverlayAPI = {
  show,
};

export default OverlayAPI;
