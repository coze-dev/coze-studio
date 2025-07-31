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

/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable complexity */
import { type Canvas, type FabricObject, type Group } from 'fabric';

import { Snap } from '../../typings';
import {
  bboxHeightToHeight,
  bboxWidthToWidth,
  fixedMiddlePoint,
  getBBoxHeight,
  getBBoxWidth,
  getLatestSnapRs,
  getObjectPoints,
} from './util';
import { paddingRule } from './rule/padding';
import { alignRule } from './rule/align';
import Helpline from './helpline';

class SnapService {
  helpline: Helpline;
  canvas: Canvas;
  threshold = 10;
  rules: Snap.Rule[] = [paddingRule, alignRule];
  constructor(canvas: Canvas, helpLineLayerId: string, scale?: number) {
    this.canvas = canvas;
    this.helpline = new Helpline(canvas, helpLineLayerId, scale);
    document.addEventListener('keydown', this.onKeyDown);
    document.addEventListener('keyup', this.onKeyUp);
  }

  testPoints: Snap.Point[] = [];

  snapOpen = true;
  // Development mode, when turned on, pressing shift will display 5 points of the active element
  devMode = false;
  onKeyDown = (event: KeyboardEvent) => {
    // Press the cmd key to turn off the adsorption (conflicts with screenshots, temporarily hidden)
    if (event.key.toLowerCase() === 'meta') {
      // this.snapOpen = false;
    } else if (event.key.toLowerCase() === 'shift' && this.devMode) {
      const target = this.canvas.getActiveObject();
      if (target) {
        const targetPoints = getObjectPoints(target);
        this.testPoints = Object.values(targetPoints);
        this.helpline.test(this.testPoints);
      }
    }
  };

  onKeyUp = (event: KeyboardEvent) => {
    // Let go of the cmd button and turn on the adsorption (conflicts with screenshots, temporarily hidden)
    if (event.key.toLowerCase() === 'meta') {
      // this.snapOpen = true;
      // this.helpline.hide();
    } else if (event.key.toLowerCase() === 'shift' && this.devMode) {
      this.helpline.hide();
    }
  };

  points: Snap.ObjectPointsWithMiddle[] = [];
  resetAllObjectsPosition = (target?: FabricObject) => {
    const objects = this.canvas.getObjects();
    const _points: Snap.ObjectPoints[] = [];
    const _target = [target, ...((target as Group)?.getObjects?.() ?? [])];
    objects
      .filter(object => !_target.includes(object))
      .forEach(object => {
        _points.push(object.aCoords);
      });

    this.points = _points.map(fixedMiddlePoint);
  };

  reset = () => {
    this.helpline.hide();
  };

  private _move = ({
    target,
    controlType,
  }: {
    target: FabricObject;
    controlType: Snap.ControlType;
  }): Record<string, number> | undefined => {
    if (!this.snapOpen) {
      return;
    }
    const targetPoints = getObjectPoints(target);

    const snapRs = this.rules.map(rule =>
      rule({
        otherPoints: this.points,
        targetPoint: targetPoints,
        threshold: this.threshold,
        controlType,
      }),
    );
    const rs: Snap.RuleResult = {
      top: getLatestSnapRs(snapRs.map(d => d.top).filter(Boolean)),
      left: getLatestSnapRs(snapRs.map(d => d.left).filter(Boolean)),
      height: getLatestSnapRs(snapRs.map(d => d.height).filter(Boolean)),
      width: getLatestSnapRs(snapRs.map(d => d.width).filter(Boolean)),
    };

    const helplines = [
      ...(rs.top?.helplines || []),
      ...(rs.left?.helplines || []),
      ...(rs.height?.helplines || []),
      ...(rs.width?.helplines || []),
    ];
    this.helpline.show(helplines);

    const newAttrs = {
      top: rs.top?.isSnap ? target.top + rs.top.next : target.top,
      left: rs.left?.isSnap ? target.left + rs.left.next : target.left,
      width: rs.width?.isSnap
        ? bboxWidthToWidth({
            nextWidth: getBBoxWidth(target) + rs.width.next,
            target,
          })
        : target.width,
      height: rs.height?.isSnap
        ? bboxHeightToHeight({
            nextHeight: getBBoxHeight(target) + rs.height.next,
            target,
          })
        : target.height,
    };

    Object.keys(newAttrs).forEach(key => {
      if (rs[key as keyof typeof rs]?.isSnap) {
        target.set(key, newAttrs[key as keyof typeof newAttrs]);
      }
    });

    return newAttrs;
  };

  // Move and resize affect different properties, so they are separated. move only affects left top
  move = (target: FabricObject) =>
    this._move({
      target,
      controlType: Snap.ControlType.Center,
    });

  // Resize may affect multiple properties depending on the control point
  resize = (target: FabricObject, controlType: Snap.ControlType) => {
    if (target.angle !== 0) {
      return;
    }

    return this._move({
      target,
      controlType,
    });
  };

  destroy = () => {
    this.reset();
    document.removeEventListener('keydown', this.onKeyDown);
    document.removeEventListener('keyup', this.onKeyUp);
  };
}

let snap: SnapService;
const createSnap = (canvas: Canvas, id: string, scale?: number) => {
  if (snap) {
    snap.destroy();
  }
  snap = new SnapService(canvas, id, scale);
  return snap;
};
export { createSnap, snap };
