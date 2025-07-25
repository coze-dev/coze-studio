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
 
/* eslint-disable @coze-arch/max-line-per-function */
import { findLatestObject, numberEqual } from '../util';
import { Snap } from '../../../typings';

type Attribute =
  | 'top'
  | 'left'
  | 'height'
  | 'width'
  | 'top|height'
  | 'left|width';

interface Config {
  /**
   * 影响到的属性
   */
  key: Attribute;
  /**
   * 吸附方向
   */
  direction: 'x' | 'y';
  /**
   * 吸附到的值
   */
  snapValue: number[];
}

// 计算目标元素的未来位置
const getNextHelplinePoint = ({
  targetPoint,
  latestDistance,
  controlType,
  direction,
}: {
  targetPoint: Snap.ObjectPointsWithMiddle;
  latestDistance: number;
  controlType: Snap.ControlType;
  direction: 'x' | 'y';
}) => {
  const map: Record<Snap.ControlType, Snap.Point[]> = {
    [Snap.ControlType.TopLeft]: [targetPoint.tl],
    [Snap.ControlType.TopRight]: [targetPoint.tr],
    [Snap.ControlType.BottomLeft]: [targetPoint.bl],
    [Snap.ControlType.BottomRight]: [targetPoint.br],
    [Snap.ControlType.Top]: [
      {
        x: targetPoint.tl.x + (targetPoint.tr.x - targetPoint.tl.x) / 2,
        y: targetPoint.tl.y,
      },
    ],
    [Snap.ControlType.Left]: [
      {
        x: targetPoint.tl.x,
        y: targetPoint.tl.y + (targetPoint.bl.y - targetPoint.tl.y) / 2,
      },
    ],
    [Snap.ControlType.Bottom]: [
      {
        x: targetPoint.tl.x + (targetPoint.br.x - targetPoint.tl.x) / 2,
        y: targetPoint.bl.y,
      },
    ],
    [Snap.ControlType.Right]: [
      {
        x: targetPoint.tr.x,
        y: targetPoint.tl.y + (targetPoint.br.y - targetPoint.tl.y) / 2,
      },
    ],
    [Snap.ControlType.Center]: Object.values(targetPoint).map(d => ({
      ...d,
      isTarget: true,
    })),
  };

  return map[controlType].map(p => ({
    ...p,
    [direction]: p[direction] + latestDistance,
  }));
};

// 计算吸附结果
const getNextRs = ({
  latestDistance,
  latestDistanceAbs,
  helplines,
  attribute,
}: {
  latestDistance: number;
  latestDistanceAbs: number;
  helplines: Snap.Line[];
  attribute: Attribute;
}): Partial<Snap.RuleResult> => {
  if (attribute === 'top|height') {
    return {
      top: {
        helplines,
        snapDistance: latestDistanceAbs,
        next: latestDistance,
        isSnap: true,
      },
      height: {
        helplines: [],
        snapDistance: 999,
        next: -latestDistance,
        isSnap: true,
      },
    };
  } else if (attribute === 'left|width') {
    return {
      left: {
        helplines,
        snapDistance: latestDistanceAbs,
        next: latestDistance,
        isSnap: true,
      },
      width: {
        helplines: [],
        snapDistance: 999,
        next: -latestDistance,
        isSnap: true,
      },
    };
  } else if (attribute === 'top') {
    return {
      top: {
        helplines,
        snapDistance: latestDistanceAbs,
        next: latestDistance,
        isSnap: true,
      },
    };
  } else if (attribute === 'left') {
    return {
      left: {
        helplines,
        snapDistance: latestDistanceAbs,
        next: latestDistance,
        isSnap: true,
      },
    };
  } else if (attribute === 'width') {
    return {
      width: {
        helplines,
        snapDistance: latestDistanceAbs,
        next: latestDistance,
        isSnap: true,
      },
    };
  } else if (attribute === 'height') {
    return {
      height: {
        helplines,
        snapDistance: latestDistanceAbs,
        next: latestDistance,
        isSnap: true,
      },
    };
  }
  return {};
};

// 对齐规则
export const alignRule: Snap.Rule = ({
  otherPoints,
  targetPoint,
  threshold,
  controlType,
}) => {
  let rs: Snap.RuleResult = {
    top: {
      helplines: [],
      snapDistance: 999,
      next: targetPoint.tl.y,
    },
    left: {
      helplines: [],
      snapDistance: 999,
      next: targetPoint.tl.x,
    },
    width: {
      helplines: [],
      snapDistance: 999,
      next: targetPoint.tl.x,
    },
    height: {
      helplines: [],
      snapDistance: 999,
      next: targetPoint.tl.y,
    },
  };

  if (!otherPoints || otherPoints.length === 0) {
    return rs;
  }

  const configMap: Record<Snap.ControlType, Config[]> = {
    [Snap.ControlType.TopLeft]: [
      { key: 'top|height', direction: 'y', snapValue: [targetPoint.tl.y] },
      { key: 'left|width', direction: 'x', snapValue: [targetPoint.tl.x] },
    ],
    [Snap.ControlType.TopRight]: [
      { key: 'top|height', direction: 'y', snapValue: [targetPoint.tr.y] },
      { key: 'width', direction: 'x', snapValue: [targetPoint.tr.x] },
    ],
    [Snap.ControlType.BottomLeft]: [
      { key: 'height', direction: 'y', snapValue: [targetPoint.bl.y] },
      { key: 'left|width', direction: 'x', snapValue: [targetPoint.bl.x] },
    ],
    [Snap.ControlType.BottomRight]: [
      { key: 'height', direction: 'y', snapValue: [targetPoint.br.y] },
      { key: 'width', direction: 'x', snapValue: [targetPoint.br.x] },
    ],
    [Snap.ControlType.Top]: [
      {
        key: 'top|height',
        direction: 'y',
        snapValue: [targetPoint.tl.y],
      },
    ],
    [Snap.ControlType.Left]: [
      {
        key: 'left|width',
        direction: 'x',
        snapValue: [targetPoint.tl.x],
      },
    ],
    [Snap.ControlType.Bottom]: [
      {
        key: 'height',
        direction: 'y',
        snapValue: [targetPoint.bl.y],
      },
    ],
    [Snap.ControlType.Right]: [
      {
        key: 'width',
        direction: 'x',
        snapValue: [targetPoint.tr.x],
      },
    ],
    [Snap.ControlType.Center]: [
      {
        key: 'top',
        direction: 'y',
        snapValue: Array.from(
          new Set(Object.values(targetPoint).map(p => p.y)),
        ),
      },
      {
        key: 'left',
        direction: 'x',
        snapValue: Array.from(
          new Set(Object.values(targetPoint).map(p => p.x)),
        ),
      },
    ],
  };
  const config = configMap[controlType];

  config.forEach(item => {
    // 需要判断吸附的点位集合
    const points = item.snapValue;

    // 找到距离最近的吸附点集合
    const {
      snapPoints,
      distance: latestDistance,
      distanceAbs: latestDistanceAbs,
    } = findLatestObject(otherPoints, points, item.direction);

    // 如果距离小于阈值，则进行吸附
    if (latestDistanceAbs <= threshold) {
      const helplines: Snap.Line[] = [];
      const allPoints: (Snap.Point & { isTarget?: boolean })[] = [];

      // 将所有其他对象的点添加到 allPoints 中
      otherPoints.forEach(a => {
        allPoints.push(...Object.values(a));
      });

      // 将目标对象的点添加到 allPoints 中
      allPoints.push(
        ...getNextHelplinePoint({
          targetPoint,
          latestDistance,
          controlType,
          direction: item.direction,
        }),
      );

      // 根据吸附方向对 allPoints 进行排序
      const sortKey = item.direction === 'x' ? 'y' : 'x';

      // 根据吸附结果，从所有点中挑选出需要绘制辅助线的点
      snapPoints.forEach(sp => {
        const _helpline = allPoints
          .filter(p => numberEqual(p[item.direction], sp[item.direction]))
          .sort((a, b) => a[sortKey] - b[sortKey]);
        helplines.push(_helpline);
      });

      rs = {
        ...rs,
        ...getNextRs({
          latestDistance,
          latestDistanceAbs,
          helplines,
          attribute: item.key,
        }),
      };
    }
  });

  // x,y 一起吸附，需要对 x 吸附线的 y 坐标进行修正
  if (
    controlType === Snap.ControlType.Center &&
    rs.top?.isSnap &&
    rs.left?.helplines?.length
  ) {
    rs.left.helplines = rs.left.helplines.map(line =>
      line.map(p => {
        if ((p as Snap.Point & { isTarget?: boolean }).isTarget) {
          return {
            ...p,
            y: p.y + (rs.top?.next ?? 0),
          };
        }
        return p;
      }),
    );
  }

  // x,y 一起吸附，需要对 y 吸附线的 x 坐标进行修正
  if (
    controlType === Snap.ControlType.Center &&
    rs.left?.isSnap &&
    rs.top?.helplines?.length
  ) {
    rs.top.helplines = rs.top.helplines.map(line =>
      line.map(p => {
        if ((p as Snap.Point & { isTarget?: boolean }).isTarget) {
          return {
            ...p,
            x: p.x + (rs.left?.next ?? 0),
          };
        }
        return p;
      }),
    );
  }

  return rs;
};
