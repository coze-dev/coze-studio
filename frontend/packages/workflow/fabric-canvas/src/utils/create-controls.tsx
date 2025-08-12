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
      ml: false, // Midpoint left
      mr: false, // Midpoint right
      mt: false, // midpoint
      mb: false, // midpoint
      bl: false, // Bottom left
      br: true, // Bottom right
      tl: true, // Top Left
      tr: false, // Top right
      mtr: false, // Rotation Control Point
    });
  } else {
    element.setControlsVisibility({
      ml: false, // Midpoint left
      mr: false, // Midpoint right
      mt: false, // midpoint
      mb: false, // midpoint
      bl: true, // Bottom left
      br: false, // Bottom right
      tl: false, // Top Left
      tr: true, // Top right
      mtr: false, // Rotation Control Point
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
    mtr: false, // Rotation Control Point
  });
  // resize
  // upper left
  element.controls.tl = getResizeTLControl({
    needResetScaleAndSnap,
  });
  // upper middle school
  element.controls.mt = getResizeMTControl({
    needResetScaleAndSnap,
  });
  // upper right
  element.controls.tr = getResizeTRControl({
    needResetScaleAndSnap,
  });
  // center left
  element.controls.ml = getResizeMLControl({
    needResetScaleAndSnap,
  });
  // center right
  element.controls.mr = getResizeMRControl({
    needResetScaleAndSnap,
  });
  // Lower left
  element.controls.bl = getResizeBLControl({
    needResetScaleAndSnap,
  });
  // lower middle
  element.controls.mb = getResizeMBControl({
    needResetScaleAndSnap,
  });
  // Lower right
  element.controls.br = getResizeBRControl({
    needResetScaleAndSnap,
  });

  // rotate
  // upper left
  element.controls.tlr = getRotateTLControl();
  // upper right
  element.controls.trr = getRotateTRControl();
  // Lower left
  element.controls.blr = getRotateBLControl();
  // Lower right
  element.controls.brr = getRotateBRControl();
};

export const createControls: Partial<
  Record<Mode, (data: { element: FabricObject }) => void>
> = {
  [Mode.STRAIGHT_LINE]: ({ element }) => {
    setLineControlVisible({ element });

    // top left
    element.controls.tl = getLineStartControl({
      x: -0.5,
      y: -0.5,
      callback: setLineControlVisible,
    });
    // top right
    element.controls.tr = getLineStartControl({
      x: 0.5,
      y: -0.5,
      callback: setLineControlVisible,
    });

    // lower left
    element.controls.bl = getLineEndControl({
      x: -0.5,
      y: 0.5,
      callback: setLineControlVisible,
    });

    // lower right
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
      mtr: false, // Rotation Control Point
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
      mtr: false, // Rotation Control Point
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
      mtr: false, // Rotation Control Point
    });

    element.controls.tlr = getRotateTLControl();
    element.controls.trr = getRotateTRControl();
    element.controls.blr = getRotateBLControl();
    element.controls.brr = getRotateBRControl();
  },
  [Mode.IMAGE]: ({ element }) => {
    element.setControlsVisibility({
      mtr: false, // Rotation Control Point
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
