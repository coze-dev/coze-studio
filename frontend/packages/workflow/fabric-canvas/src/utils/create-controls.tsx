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
 
import { type Ellipse, type FabricObject, type Line } from 'fabric';

import { Mode } from '../typings';
import { setImageFixed } from '../share';
import { resetElementClip } from './fabric-utils';
import {
  getLineEndControl,
  getLineStartControl,
  getResizeBLControl,
  getResizeBRControl,
  getResizeMBControl,
  getResizeMLControl,
  getResizeMRControl,
  getResizeMTControl,
  getResizeTLControl,
  getResizeTRControl,
  getRotateTLControl,
  getRotateTRControl,
  getRotateBLControl,
  getRotateBRControl,
} from './controls';

export const setLineControlVisible = ({
  element,
}: {
  element: FabricObject;
}) => {
  const { x1, x2, y1, y2 } = element as Line;
  if ((x1 < x2 && y1 < y2) || (x1 > x2 && y1 > y2)) {
    element.setControlsVisibility({
      ml: false, // 中点左
      mr: false, // 中点右
      mt: false, // 中点上
      mb: false, // 中点下
      bl: false, // 底部左
      br: true, // 底部右
      tl: true, // 顶部左
      tr: false, // 顶部右
      mtr: false, // 旋转控制点
    });
  } else {
    element.setControlsVisibility({
      ml: false, // 中点左
      mr: false, // 中点右
      mt: false, // 中点上
      mb: false, // 中点下
      bl: true, // 底部左
      br: false, // 底部右
      tl: false, // 顶部左
      tr: true, // 顶部右
      mtr: false, // 旋转控制点
    });
  }
};

const setCircleRxRy = ({ element }: { element: FabricObject }) => {
  const { width, height } = element as Ellipse;
  element.set({ rx: width / 2, ry: height / 2 });
};

const getCommonControl = ({
  element,
  needResetScaleAndSnap = true,
}: {
  element: FabricObject;
  needResetScaleAndSnap?: boolean;
}) => {
  element.setControlsVisibility({
    mtr: false, // 旋转控制点
  });
  // resize
  // 上左
  element.controls.tl = getResizeTLControl({
    needResetScaleAndSnap,
  });
  // 上中
  element.controls.mt = getResizeMTControl({
    needResetScaleAndSnap,
  });
  // 上右
  element.controls.tr = getResizeTRControl({
    needResetScaleAndSnap,
  });
  // 中左
  element.controls.ml = getResizeMLControl({
    needResetScaleAndSnap,
  });
  // 中右
  element.controls.mr = getResizeMRControl({
    needResetScaleAndSnap,
  });
  // 下左
  element.controls.bl = getResizeBLControl({
    needResetScaleAndSnap,
  });
  // 下中
  element.controls.mb = getResizeMBControl({
    needResetScaleAndSnap,
  });
  // 下右
  element.controls.br = getResizeBRControl({
    needResetScaleAndSnap,
  });

  // rotate
  // 上左
  element.controls.tlr = getRotateTLControl();
  // 上右
  element.controls.trr = getRotateTRControl();
  // 下左
  element.controls.blr = getRotateBLControl();
  // 下右
  element.controls.brr = getRotateBRControl();
};

export const createControls: Partial<
  Record<Mode, (data: { element: FabricObject }) => void>
> = {
  [Mode.STRAIGHT_LINE]: ({ element }) => {
    setLineControlVisible({ element });

    // 左上
    element.controls.tl = getLineStartControl({
      x: -0.5,
      y: -0.5,
      callback: setLineControlVisible,
    });
    // 右上
    element.controls.tr = getLineStartControl({
      x: 0.5,
      y: -0.5,
      callback: setLineControlVisible,
    });

    // 左下
    element.controls.bl = getLineEndControl({
      x: -0.5,
      y: 0.5,
      callback: setLineControlVisible,
    });

    // 右下
    element.controls.br = getLineEndControl({
      x: 0.5,
      y: 0.5,
      callback: setLineControlVisible,
    });
  },

  [Mode.RECT]: getCommonControl,
  [Mode.TRIANGLE]: getCommonControl,
  [Mode.PENCIL]: props => {
    getCommonControl({
      ...props,
      needResetScaleAndSnap: false,
    });
  },
  [Mode.CIRCLE]: ({ element }) => {
    element.setControlsVisibility({
      mtr: false, // 旋转控制点
    });

    const controlProps = {
      callback: setCircleRxRy,
      needResetScaleAndSnap: true,
    };
    element.controls.tl = getResizeTLControl(controlProps);
    element.controls.mt = getResizeMTControl(controlProps);
    element.controls.tr = getResizeTRControl(controlProps);
    element.controls.ml = getResizeMLControl(controlProps);
    element.controls.mr = getResizeMRControl(controlProps);
    element.controls.bl = getResizeBLControl(controlProps);
    element.controls.mb = getResizeMBControl(controlProps);
    element.controls.br = getResizeBRControl(controlProps);
    element.controls.tlr = getRotateTLControl(controlProps);
    element.controls.trr = getRotateTRControl(controlProps);
    element.controls.blr = getRotateBLControl(controlProps);
    element.controls.brr = getRotateBRControl(controlProps);
  },
  [Mode.BLOCK_TEXT]: ({ element }) => {
    element.setControlsVisibility({
      mtr: false, // 旋转控制点
    });

    const controlProps = {
      callback: () => {
        resetElementClip({ element });
        element.fire('moving');
      },
      needResetScaleAndSnap: true,
    };
    element.controls.tl = getResizeTLControl(controlProps);
    element.controls.mt = getResizeMTControl(controlProps);
    element.controls.tr = getResizeTRControl(controlProps);
    element.controls.ml = getResizeMLControl(controlProps);
    element.controls.mr = getResizeMRControl(controlProps);
    element.controls.bl = getResizeBLControl(controlProps);
    element.controls.mb = getResizeMBControl(controlProps);
    element.controls.br = getResizeBRControl(controlProps);
    element.controls.tlr = getRotateTLControl(controlProps);
    element.controls.trr = getRotateTRControl(controlProps);
    element.controls.blr = getRotateBLControl(controlProps);
    element.controls.brr = getRotateBRControl(controlProps);
  },
  [Mode.INLINE_TEXT]: ({ element }) => {
    element.setControlsVisibility({
      mtr: false, // 旋转控制点
    });

    element.controls.tlr = getRotateTLControl();
    element.controls.trr = getRotateTRControl();
    element.controls.blr = getRotateBLControl();
    element.controls.brr = getRotateBRControl();
  },
  [Mode.IMAGE]: ({ element }) => {
    element.setControlsVisibility({
      mtr: false, // 旋转控制点
    });

    const controlProps = {
      callback: () => {
        setImageFixed({ element });
        resetElementClip({ element });
        element.fire('moving');
      },
      needResetScaleAndSnap: true,
    };
    element.controls.tl = getResizeTLControl(controlProps);
    element.controls.mt = getResizeMTControl(controlProps);
    element.controls.tr = getResizeTRControl(controlProps);
    element.controls.ml = getResizeMLControl(controlProps);
    element.controls.mr = getResizeMRControl(controlProps);
    element.controls.bl = getResizeBLControl(controlProps);
    element.controls.mb = getResizeMBControl(controlProps);
    element.controls.br = getResizeBRControl(controlProps);
    element.controls.tlr = getRotateTLControl(controlProps);
    element.controls.trr = getRotateTRControl(controlProps);
    element.controls.blr = getRotateBLControl(controlProps);
    element.controls.brr = getRotateBRControl(controlProps);
  },
};
