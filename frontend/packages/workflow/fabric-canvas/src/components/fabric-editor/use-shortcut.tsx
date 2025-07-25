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
 
/* eslint-disable max-lines-per-function */
/* eslint-disable @coze-arch/max-line-per-function */
import { useKeyPress } from 'ahooks';

import { CopyMode } from '../../typings';

export const useShortcut = ({
  ref,
  state: { isTextEditing, disabledPaste },
  sdk: {
    moveActiveObject,
    removeActiveObjects,
    undo,
    redo,
    copy,
    paste,
    group,
    unGroup,
    moveToFront,
    moveToBackend,
    moveToFrontOne,
    moveToBackendOne,
    alignLeft,
    alignRight,
    alignCenter,
    alignTop,
    alignBottom,
    alignMiddle,
    verticalAverage,
    horizontalAverage,
  },
}: {
  ref: React.RefObject<HTMLDivElement>;
  state: {
    isTextEditing: boolean;
    disabledPaste: boolean;
  };
  sdk: {
    moveActiveObject: (direction: 'up' | 'down' | 'left' | 'right') => void;
    removeActiveObjects: () => void;
    undo: () => void;
    redo: () => void;
    copy: (mode: CopyMode) => void;
    paste: (options?: { mode?: CopyMode }) => void;
    group: () => void;
    unGroup: () => void;
    moveToFront: () => void;
    moveToBackend: () => void;
    moveToFrontOne: () => void;
    moveToBackendOne: () => void;
    alignLeft: () => void;
    alignRight: () => void;
    alignCenter: () => void;
    alignTop: () => void;
    alignBottom: () => void;
    alignMiddle: () => void;
    verticalAverage: () => void;
    horizontalAverage: () => void;
  };
}) => {
  // 上下左右微调元素位置
  useKeyPress(
    ['uparrow', 'downarrow', 'leftarrow', 'rightarrow'],
    e => {
      switch (e.key) {
        case 'ArrowUp':
          moveActiveObject('up');
          break;
        case 'ArrowDown':
          moveActiveObject('down');
          break;
        case 'ArrowLeft':
          moveActiveObject('left');
          break;
        case 'ArrowRight':
          moveActiveObject('right');
          break;

        default:
          break;
      }
    },
    {
      target: ref,
    },
  );

  // 删除元素
  useKeyPress(
    ['backspace', 'delete'],
    e => {
      if (!isTextEditing) {
        removeActiveObjects();
      }
    },
    {
      target: ref,
    },
  );

  // redo undo
  useKeyPress(
    ['ctrl.z', 'meta.z'],
    e => {
      // 一定要加，否则会命中浏览器乱七八糟的默认行为
      e.preventDefault();
      if (e.shiftKey) {
        redo();
      } else {
        undo();
      }
    },
    {
      events: ['keydown'],
      target: ref,
    },
  );

  /**
   * 功能开发暂停了，原因详见 packages/workflow/fabric-canvas/src/hooks/use-group.tsx
   */
  // useKeyPress(
  //   ['ctrl.g', 'meta.g'],
  //   e => {
  //     e.preventDefault();
  //     if (e.shiftKey) {
  //       unGroup();
  //     } else {
  //       group();
  //     }
  //   },
  //   {
  //     events: ['keydown'],
  //     target: ref,
  //   },
  // );

  // copy
  useKeyPress(
    ['ctrl.c', 'meta.c'],
    e => {
      e.preventDefault();
      copy(CopyMode.CtrlCV);
    },
    {
      events: ['keydown'],
      exactMatch: true,
      target: ref,
    },
  );

  // paste
  useKeyPress(
    ['ctrl.v', 'meta.v'],
    e => {
      e.preventDefault();
      if (!disabledPaste) {
        paste({ mode: CopyMode.CtrlCV });
      }
    },
    {
      events: ['keydown'],
      exactMatch: true,
      target: ref,
    },
  );

  // 生成副本
  useKeyPress(
    ['ctrl.d', 'meta.d'],
    async e => {
      // 必须阻止默认行为，否则会触发添加标签
      e.preventDefault();
      await copy(CopyMode.CtrlD);
      paste({
        mode: CopyMode.CtrlD,
      });
    },
    {
      events: ['keydown'],
      exactMatch: true,
      target: ref,
    },
  );

  // [ 下移一层
  useKeyPress(
    ['openbracket'],
    e => {
      if (!isTextEditing) {
        moveToBackendOne();
      }
    },
    {
      events: ['keydown'],
      exactMatch: true,
      target: ref,
    },
  );

  // ] 上移一层
  useKeyPress(
    ['closebracket'],
    e => {
      if (!isTextEditing) {
        moveToFrontOne();
      }
    },
    {
      events: ['keydown'],
      exactMatch: true,
      target: ref,
    },
  );
  // ⌘ + [、⌘ + ] 禁止浏览器默认行为 前进、后退
  useKeyPress(
    ['meta.openbracket', 'meta.closebracket'],
    e => {
      if (!isTextEditing) {
        e.preventDefault();
      }
    },
    {
      events: ['keydown', 'keyup'],
      exactMatch: true,
      target: ref,
    },
  );

  // ⌘ + [ 置底
  useKeyPress(
    ['meta.openbracket'],
    e => {
      if (!isTextEditing) {
        moveToBackend();
      }
    },
    {
      events: ['keydown'],
      exactMatch: true,
      target: ref,
    },
  );

  // ⌘ + ] 置顶
  useKeyPress(
    ['meta.closebracket'],
    e => {
      if (!isTextEditing) {
        moveToFront();
      }
    },
    {
      events: ['keydown'],
      exactMatch: true,
      target: ref,
    },
  );

  // 水平居左
  useKeyPress(
    ['alt.a'],
    e => {
      e.preventDefault();
      alignLeft();
    },
    {
      events: ['keydown'],
      exactMatch: true,
      target: ref,
    },
  );

  // 水平居右
  useKeyPress(
    ['alt.d'],
    e => {
      e.preventDefault();
      alignRight();
    },
    {
      events: ['keydown'],
      exactMatch: true,
      target: ref,
    },
  );

  // 水平居中
  useKeyPress(
    ['alt.h'],
    e => {
      e.preventDefault();
      alignCenter();
    },
    {
      events: ['keydown'],
      exactMatch: true,
      target: ref,
    },
  );

  // 垂直居上
  useKeyPress(
    ['alt.w'],
    e => {
      e.preventDefault();
      alignTop();
    },
    {
      events: ['keydown'],
      exactMatch: true,
      target: ref,
    },
  );

  // 垂直居下
  useKeyPress(
    ['alt.s'],
    e => {
      e.preventDefault();
      alignBottom();
    },
    {
      events: ['keydown'],
      exactMatch: true,
      target: ref,
    },
  );

  // 垂直居中
  useKeyPress(
    ['alt.v'],
    e => {
      e.preventDefault();
      alignMiddle();
    },
    {
      events: ['keydown'],
      exactMatch: true,
      target: ref,
    },
  );

  // 水平均分
  useKeyPress(
    ['alt.ctrl.h'],
    e => {
      e.preventDefault();
      horizontalAverage();
    },
    {
      events: ['keydown'],
      exactMatch: true,
      target: ref,
    },
  );

  // 垂直均分
  useKeyPress(
    ['alt.ctrl.v'],
    e => {
      e.preventDefault();
      verticalAverage();
    },
    {
      events: ['keydown'],
      exactMatch: true,
      target: ref,
    },
  );
};
