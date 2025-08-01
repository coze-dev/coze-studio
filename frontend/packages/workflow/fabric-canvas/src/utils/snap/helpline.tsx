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

import { type Canvas, type FabricObject } from 'fabric';

import { canvasXYToScreen } from '../fabric-utils';
import { type Snap } from '../../typings';
import { numberEqual } from './util';

const pointSize = 12;
const getPointHtml = (point: Snap.Point) => `
    <svg
      viewBox="0 0 1024 1024"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      width="${pointSize}"
      height="${pointSize}"
      class="absolute opacity-80 rotate-45"
      style="
        top: ${point.y - pointSize / 2}px;
        left: ${point.x - pointSize / 2}px;
        fill: #00B2B2;
      "
      >
        <path d="M930.688 487.338667s3.584 0.469333 6.314667 1.322666a32 32 0 0 1 5.973333 58.496c-4.906667 2.730667-15.530667 4.053333-15.530667 4.053334H96.554667s-3.584-0.085333-6.442667-0.682667a31.786667 31.786667 0 0 1-16.725333-9.301333 32.256 32.256 0 0 1 0-44.074667 32.213333 32.213333 0 0 1 7.637333-5.930667c4.906667-2.730667 15.530667-4.010667 15.530667-4.010666l834.133333 0.128z" p-id="4210"></path>
        <path d="M516.864 72.149333a32.042667 32.042667 0 0 1 25.685333 22.016 59.733333 59.733333 0 0 1 1.450667 9.6v830.848s-1.322667 10.666667-4.010667 15.530667a31.573333 31.573333 0 0 1-13.909333 13.226667 32.341333 32.341333 0 0 1-36.138667-5.546667 32.341333 32.341333 0 0 1-9.301333-16.768c-0.554667-2.816-0.64-6.442667-0.64-6.442667V103.765333s0.469333-6.4 1.450667-9.6a32.298667 32.298667 0 0 1 19.456-20.394666 34.816 34.816 0 0 1 12.714666-1.962667l3.242667 0.341333z"></path>
      </svg>`;

const lineWidth = 1;
const getLineHtml = (startXY: Snap.Point, endXY: Snap.Point) => {
  let innerHTML = '';
  if (numberEqual(startXY.x, endXY.x)) {
    innerHTML += `<div
    class="absolute bg-[#00B2B2]"
    style="
      top: ${Math.min(startXY.y, endXY.y)}px;
      left: ${startXY.x - lineWidth / 2}px;
      width: ${lineWidth}px;
      height: ${Math.abs(endXY.y - startXY.y)}px;
    "
    ></div>`;
  } else {
    // horizontal line
    innerHTML += `<div
    class="absolute bg-[#00B2B2]"
    style="
      top: ${startXY.y - lineWidth / 2}px;
      left: ${Math.min(startXY.x, endXY.x)}px;
      width: ${Math.abs(endXY.x - startXY.x)}px;
      height: ${lineWidth}px;
    "
    ></div>`;
  }

  return innerHTML;
};

class Helpline {
  canvas: Canvas;
  helpLineLayerId: string;
  scale: number;
  constructor(canvas: Canvas, helpLineLayerId: string, scale?: number) {
    this.canvas = canvas;
    this.helpLineLayerId = helpLineLayerId;
    this.scale = scale ?? 1;
  }

  objects: FabricObject[] = [];

  resetScale = (scale: number) => {
    this.scale = scale;
  };

  test = (points: Snap.Point[]) => {
    const layer = document.getElementById(this.helpLineLayerId);
    if (!layer) {
      return;
    }
    let innerHTML = '';
    points.forEach(point => {
      const xy = canvasXYToScreen({
        canvas: this.canvas,
        scale: this.scale,
        point,
      });
      innerHTML += getPointHtml(xy);
    });
    layer.innerHTML = innerHTML;
  };

  show = (lines: Snap.Line[]) => {
    const layer = document.getElementById(this.helpLineLayerId);
    if (layer) {
      let innerHTML = '';
      lines.forEach(line => {
        line.forEach(point => {
          const xy = canvasXYToScreen({
            canvas: this.canvas,
            scale: this.scale,
            point,
          });
          innerHTML += getPointHtml(xy);
        });

        const startXY = canvasXYToScreen({
          canvas: this.canvas,
          scale: this.scale,
          point: line[0],
        });

        const endXY = canvasXYToScreen({
          canvas: this.canvas,
          scale: this.scale,
          point: line[line.length - 1],
        });

        innerHTML += getLineHtml(startXY, endXY);
      });

      layer.innerHTML = innerHTML;
    }
  };

  hide = () => {
    const layer = document.getElementById(this.helpLineLayerId);
    if (layer) {
      layer.innerHTML = '';
    }
  };
}

export default Helpline;
