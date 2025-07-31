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

/* eslint-disable @typescript-eslint/no-namespace */
// eslint-disable-next-line @coze-arch/no-batch-import-or-export
export * from './share/typings';

import { type TPointerEvent, type TPointerEventInfo } from 'fabric';

import { type FabricObjectSchema } from './share/typings';

export interface FormMetaItem {
  name?: string;
  title?: string;
  // Temporary storage, not saved to the backend
  cacheSave?: boolean;
  visible?: (formValue: Partial<FabricObjectSchema>) => boolean;
  setter:
    | string
    | ((props: {
        value: unknown;
        tooltipVisible?: boolean;
        onChange: (v: unknown) => void;
      }) => React.ReactElement);
  setterProps?: Record<string, unknown>;
  splitLine?: boolean;
  tooltip?: {
    content: FormMetaItem[];
  };
}

export interface FormMeta {
  display: 'row' | 'col';
  content: FormMetaItem[];
  style?: React.CSSProperties;
}

export interface IRefPosition {
  id: string;
  top: number;
  left: number;
  isImg: boolean;
  angle: number;
  maxWidth: number;
}

export enum CopyMode {
  CtrlCV = 'CtrlCV',
  CtrlD = 'CtrlD',
  DragCV = 'DragCV',
}

export enum AlignMode {
  Left = 'left',
  Center = 'center',
  Right = 'right',
  Top = 'top',
  Middle = 'middle',
  Bottom = 'bottom',
  HorizontalAverage = 'horizontalAverage',
  VerticalAverage = 'verticalAverage',
}

export type FabricClickEvent = TPointerEventInfo<TPointerEvent>;

export namespace Snap {
  export interface Point {
    x: number;
    y: number;
  }
  export type Line = Point[];

  export interface ObjectPoints {
    tl: Point;
    tr: Point;
    bl: Point;
    br: Point;
  }

  export interface ObjectPointsWithMiddle {
    tl: Point;
    tr: Point;
    m: Point;
    bl: Point;
    br: Point;
  }

  export type GetObjectPoints = (
    object: ObjectPoints,
  ) => ObjectPointsWithMiddle;

  export interface SnapLine {
    helplines: Line[];
    snapDistance: number;
    next: number;
    isSnap?: boolean;
  }

  export interface RuleResult {
    top?: SnapLine;
    left?: SnapLine;
    height?: SnapLine;
    width?: SnapLine;
  }

  export type Rule = ({
    otherPoints,
    targetPoint,
    threshold,
    controlType,
  }: {
    otherPoints: ObjectPointsWithMiddle[];
    targetPoint: ObjectPointsWithMiddle;
    threshold: number;
    controlType: ControlType;
  }) => RuleResult;

  export enum ControlType {
    TopLeft = 'topLeft',
    TopRight = 'topRight',
    BottomLeft = 'bottomLeft',
    BottomRight = 'bottomRight',
    Top = 'top',
    Bottom = 'bottom',
    Left = 'left',
    Right = 'right',
    Center = 'center',
  }
}
