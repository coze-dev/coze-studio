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

/* eslint-disable max-lines */
/* eslint-disable complexity */
/* eslint-disable max-lines-per-function */
/* eslint-disable @coze-arch/max-line-per-function */
import { numberEqual } from '../util';
import { Snap } from '../../../typings';

// Get the bottom point of the object
const getBottomPoint = (p: Snap.ObjectPointsWithMiddle) => {
  let point = p.tl;
  Object.values(p).forEach(d => {
    if (d.y > point.y) {
      point = d;
    }
  });
  return point;
};
// Get the top point of the object
const getTopPoint = (p: Snap.ObjectPointsWithMiddle) => {
  let point = p.tl;
  Object.values(p).forEach(d => {
    if (d.y < point.y) {
      point = d;
    }
  });
  return point;
};

// Get the left point of the object
const getLeftPoint = (p: Snap.ObjectPointsWithMiddle) => {
  let point = p.tl;
  Object.values(p).forEach(d => {
    if (d.x < point.x) {
      point = d;
    }
  });
  return point;
};

// Get the right point of the object
const getRightPoint = (p: Snap.ObjectPointsWithMiddle) => {
  let point = p.tl;
  Object.values(p).forEach(d => {
    if (d.x > point.x) {
      point = d;
    }
  });
  return point;
};

// Determine whether the two ranges overlap
const isInDuration = (
  target: {
    min: number;
    max: number;
  },
  duration: { min: number; max: number },
) =>
  (target.min >= duration.min && target.min <= duration.max) ||
  (target.max >= duration.min && target.max <= duration.max) ||
  (target.min <= duration.min && target.max >= duration.max);

const getMiddle = (
  target: {
    min: number;
    max: number;
  },
  duration: { min: number; max: number },
) => {
  if (target.min <= duration.min && target.max >= duration.max) {
    return duration.min + (duration.max - duration.min) / 2;
  } else if (target.min >= duration.min && target.max <= duration.max) {
    return target.min + (target.max - target.min) / 2;
  } else if (target.min >= duration.min && target.min <= duration.max) {
    return target.min + (duration.max - target.min) / 2;
  }
  return target.max - (target.max - duration.min) / 2;
};

// Find the relevant information about the two objects closest to the specified direction (horizontal/vertical)
const findLatestObject = ({
  otherPoints: _otherPoints,
  targetPoint,
  direction,
}: {
  otherPoints: Snap.ObjectPointsWithMiddle[];
  targetPoint: Snap.ObjectPointsWithMiddle;
  direction: 'x' | 'y';
}) => {
  const otherPoints = _otherPoints.sort(
    (a, b) => a.tl[direction] - b.tl[direction],
  );

  const rs: {
    prev: {
      point: Snap.ObjectPointsWithMiddle;
      distance: number;
    };
    next: {
      point: Snap.ObjectPointsWithMiddle;
      distance: number;
    };
    durationObjects: Snap.ObjectPointsWithMiddle[];
  } = {
    prev: {
      point: otherPoints[0],
      distance: Infinity,
    },
    next: {
      point: otherPoints[0],
      distance: Infinity,
    },
    durationObjects: [],
  };

  if (direction === 'x') {
    const duration = {
      min: targetPoint.tl.y,
      max: targetPoint.bl.y,
    };
    const durationObjects = otherPoints.filter(d =>
      isInDuration(
        {
          min: getTopPoint(d).y,
          max: getBottomPoint(d).y,
        },
        duration,
      ),
    );

    rs.durationObjects = durationObjects;

    durationObjects.forEach(p => {
      const left = getLeftPoint(p);
      const right = getRightPoint(p);
      const rightDistance = targetPoint.tl.x - right.x;
      if (rightDistance > 0 && rightDistance < rs.prev.distance) {
        rs.prev = {
          point: p,
          distance: rightDistance,
        };
      }
      const leftDistance = left.x - targetPoint.tr.x;
      if (leftDistance > 0 && leftDistance < rs.next.distance) {
        rs.next = {
          point: p,
          distance: leftDistance,
        };
      }
    });
  } else {
    const duration = {
      min: targetPoint.tl.x,
      max: targetPoint.tr.x,
    };
    const durationObjects = otherPoints.filter(d =>
      isInDuration(
        {
          min: getLeftPoint(d).x,
          max: getRightPoint(d).x,
        },
        duration,
      ),
    );

    rs.durationObjects = durationObjects;

    durationObjects.forEach(p => {
      const top = getTopPoint(p);
      const bottom = getBottomPoint(p);
      const bottomDistance = targetPoint.tl.y - bottom.y;
      if (bottomDistance > 0 && bottomDistance < rs.prev.distance) {
        rs.prev = {
          point: p,
          distance: bottomDistance,
        };
      }
      const topDistance = top.y - targetPoint.bl.y;
      if (topDistance > 0 && topDistance < rs.next.distance) {
        rs.next = {
          point: p,
          distance: topDistance,
        };
      }
    });
  }

  return rs;
};

// isometric adsorption rule
export const paddingRule: Snap.Rule = ({
  otherPoints,
  targetPoint,
  threshold,
  controlType,
}) => {
  let rs: Snap.RuleResult = {
    top: {
      helplines: [],
      snapDistance: Infinity,
      next: targetPoint.tl.y,
    },
    left: {
      helplines: [],
      snapDistance: Infinity,
      next: targetPoint.tl.x,
    },
  };

  // If there are no other objects, the result is returned directly
  if (!otherPoints || otherPoints.length === 0) {
    return rs;
  }

  // Horizontal padding judgment
  const latestXObj = findLatestObject({
    otherPoints,
    targetPoint,
    direction: 'x',
  });

  // Traverse to get the horizontal right object
  let next = [];
  let i = latestXObj.durationObjects.findIndex(
    d => d === latestXObj.next.point,
  );
  if (i !== -1) {
    for (let j = i; j < latestXObj.durationObjects.length - 1; j++) {
      const _current = latestXObj.durationObjects[j];
      const _next = latestXObj.durationObjects[j + 1];
      const distance = getLeftPoint(_next).x - getRightPoint(_current).x;
      if (distance > 0) {
        next.push({
          from: _current,
          to: _next,
          distance,
        });
      }
    }
  }

  // Traverse to get the horizontal left object
  let prev = [];
  i = latestXObj.durationObjects.findIndex(d => d === latestXObj.prev.point);
  if (i !== -1) {
    for (let j = i; j > 0; j--) {
      const _current = latestXObj.durationObjects[j];
      const _prev = latestXObj.durationObjects[j - 1];
      const distance = getLeftPoint(_current).x - getRightPoint(_prev).x;
      if (distance > 0) {
        prev.push({
          from: _prev,
          to: _current,
          distance,
        });
      }
    }
  }

  if (
    latestXObj.prev.distance !== Infinity &&
    latestXObj.next.distance !== Infinity &&
    Math.abs(latestXObj.prev.distance - latestXObj.next.distance) <
      threshold * 2
  ) {
    let staff = (latestXObj.next.distance - latestXObj.prev.distance) / 2;
    if (
      [
        Snap.ControlType.TopLeft,
        Snap.ControlType.Left,
        Snap.ControlType.BottomLeft,
      ].includes(controlType)
    ) {
      staff = latestXObj.next.distance - latestXObj.prev.distance;
    } else if (
      [
        Snap.ControlType.TopRight,
        Snap.ControlType.Right,
        Snap.ControlType.BottomRight,
      ].includes(controlType)
    ) {
      staff = -(latestXObj.next.distance - latestXObj.prev.distance);
    }

    const preMiddle = getMiddle(
      {
        min: getTopPoint(latestXObj.prev.point).y,
        max: getBottomPoint(latestXObj.prev.point).y,
      },
      {
        min: targetPoint.tl.y,
        max: targetPoint.bl.y,
      },
    );

    const nextMiddle = getMiddle(
      {
        min: getTopPoint(latestXObj.next.point).y,
        max: getBottomPoint(latestXObj.next.point).y,
      },
      {
        min: targetPoint.tl.y,
        max: targetPoint.bl.y,
      },
    );

    let prevY = staff + targetPoint.tl.x;
    let nextY = staff + targetPoint.tr.x;
    if (
      [
        Snap.ControlType.TopLeft,
        Snap.ControlType.Left,
        Snap.ControlType.BottomLeft,
      ].includes(controlType)
    ) {
      nextY = targetPoint.tr.x;
    } else if (
      [
        Snap.ControlType.TopRight,
        Snap.ControlType.Right,
        Snap.ControlType.BottomRight,
      ].includes(controlType)
    ) {
      prevY = targetPoint.tl.x;
      nextY = targetPoint.tr.x - staff;
    }

    rs = {
      ...rs,
      left: {
        snapDistance: Math.abs(staff),
        helplines: [
          [
            {
              x: getRightPoint(latestXObj.prev.point).x,
              y: preMiddle,
            },
            {
              x: prevY,
              y: preMiddle,
            },
          ],
          [
            {
              x: nextY,
              y: nextMiddle,
            },
            {
              x: getLeftPoint(latestXObj.next.point).x,
              y: nextMiddle,
            },
          ],
          ...next
            .concat(prev)
            .filter(d =>
              numberEqual(
                d.distance,
                (latestXObj.prev.distance + latestXObj.next.distance) / 2,
              ),
            )
            .map(d => {
              const _m = getMiddle(
                {
                  min: getTopPoint(d.from).y,
                  max: getBottomPoint(d.from).y,
                },
                { min: getTopPoint(d.to).y, max: getBottomPoint(d.to).y },
              );
              return [
                {
                  x: getRightPoint(d.from).x,
                  y: _m,
                },
                {
                  x: getLeftPoint(d.to).x,
                  y: _m,
                },
              ];
            }),
        ],
        next: staff,
        isSnap: true,
      },
    };
  } else {
    if (next.length > 0) {
      const mins: {
        from: Snap.ObjectPointsWithMiddle;
        to: Snap.ObjectPointsWithMiddle;
        distance: number;
      }[] = [];
      let latestDistance = 999;
      let latestItem = next[0];

      // Find the closest adsorption distance from all the padding on the left
      next.forEach(n => {
        const distance = n.distance - latestXObj.next.distance;
        if (Math.abs(distance) < Math.abs(latestDistance)) {
          latestDistance = distance;
          latestItem = n;
        }
      });

      // If the distance is less than the threshold, adsorption is performed
      if (Math.abs(latestDistance) <= threshold) {
        // If found, all padding distances = closest distance, add those padding to mins
        next.forEach(n => {
          if (numberEqual(n.distance, latestItem.distance)) {
            mins.push(n);
          }
        });

        // If mins is not empty, perform adsorption
        if (mins.length > 0) {
          // Calculate the adsorption distance
          let staff = latestXObj.next.distance - mins[0].distance;
          // Yes drag right resize control point
          if (
            [
              Snap.ControlType.TopRight,
              Snap.ControlType.Right,
              Snap.ControlType.BottomRight,
            ].includes(controlType)
          ) {
            staff = -(latestXObj.next.distance - mins[0].distance);
          }

          // Calculate the midpoint of the target object
          const nextMiddle = getMiddle(
            {
              min: getTopPoint(latestXObj.next.point).y,
              max: getBottomPoint(latestXObj.next.point).y,
            },
            {
              min: targetPoint.tl.y,
              max: targetPoint.bl.y,
            },
          );

          // Calculate auxiliary line x coordinates
          let nextX = staff + targetPoint.tr.x;

          // If you drag and drop the right to resize the control point, the calculation method is different.
          if (
            [
              Snap.ControlType.TopRight,
              Snap.ControlType.Right,
              Snap.ControlType.BottomRight,
            ].includes(controlType)
          ) {
            nextX = targetPoint.tr.x - staff;
          }

          rs = {
            ...rs,
            left: {
              snapDistance: Math.abs(staff),
              helplines: [
                [
                  {
                    x: nextX,
                    y: nextMiddle,
                  },
                  {
                    x: getLeftPoint(latestXObj.next.point).x,
                    y: nextMiddle,
                  },
                ],
                ...mins.map(d => {
                  const _m = getMiddle(
                    {
                      min: getTopPoint(d.from).y,
                      max: getBottomPoint(d.from).y,
                    },
                    { min: getTopPoint(d.to).y, max: getBottomPoint(d.to).y },
                  );
                  return [
                    {
                      x: getRightPoint(d.from).x,
                      y: _m,
                    },
                    {
                      x: getLeftPoint(d.to).x,
                      y: _m,
                    },
                  ];
                }),
              ],
              next: staff,
              isSnap: true,
            },
          };
        }
      }
    }

    if (prev.length > 0) {
      const mins: {
        from: Snap.ObjectPointsWithMiddle;
        to: Snap.ObjectPointsWithMiddle;
        distance: number;
      }[] = [];
      let latestDistance = 999;
      let latestItem = prev[0];
      prev.forEach(n => {
        const distance = n.distance - latestXObj.prev.distance;
        if (Math.abs(distance) < Math.abs(latestDistance)) {
          latestDistance = distance;
          latestItem = n;
        }
      });

      if (Math.abs(latestDistance) <= threshold) {
        prev.forEach(n => {
          if (numberEqual(n.distance, latestItem.distance)) {
            mins.push(n);
          }
        });

        if (mins.length > 0) {
          const staff = mins[0].distance - latestXObj.prev.distance;

          const nextMiddle = getMiddle(
            {
              min: getTopPoint(latestXObj.prev.point).y,
              max: getBottomPoint(latestXObj.prev.point).y,
            },
            {
              min: targetPoint.tl.y,
              max: targetPoint.bl.y,
            },
          );

          if (Math.abs(staff) < (rs.left?.snapDistance || Infinity)) {
            rs = {
              ...rs,
              left: {
                snapDistance: Math.abs(staff),
                helplines: [
                  [
                    {
                      x: staff + targetPoint.tl.x,
                      y: nextMiddle,
                    },
                    {
                      x: getRightPoint(latestXObj.prev.point).x,
                      y: nextMiddle,
                    },
                  ],
                  ...mins.map(d => {
                    const _m = getMiddle(
                      {
                        min: getTopPoint(d.from).y,
                        max: getBottomPoint(d.from).y,
                      },
                      { min: getTopPoint(d.to).y, max: getBottomPoint(d.to).y },
                    );
                    return [
                      {
                        x: getRightPoint(d.from).x,
                        y: _m,
                      },
                      {
                        x: getLeftPoint(d.to).x,
                        y: _m,
                      },
                    ];
                  }),
                ],
                next: staff,
                isSnap: true,
              },
            };
          }
        }
      }
    }
  }

  const latestYObj = findLatestObject({
    otherPoints,
    targetPoint,
    direction: 'y',
  });

  next = [];
  i = latestYObj.durationObjects.findIndex(d => d === latestYObj.next.point);
  if (i !== -1) {
    for (let j = i; j < latestYObj.durationObjects.length - 1; j++) {
      const _current = latestYObj.durationObjects[j];
      const _next = latestYObj.durationObjects[j + 1];
      const distance = getTopPoint(_next).y - getBottomPoint(_current).y;
      if (distance > 0) {
        next.push({
          from: _current,
          to: _next,
          distance,
        });
      }
    }
  }

  prev = [];
  i = latestYObj.durationObjects.findIndex(d => d === latestYObj.prev.point);
  if (i !== -1) {
    for (let j = i; j > 0; j--) {
      const _current = latestYObj.durationObjects[j];
      const _prev = latestYObj.durationObjects[j - 1];
      const distance = getTopPoint(_current).y - getBottomPoint(_prev).y;
      if (distance > 0) {
        prev.push({
          from: _prev,
          to: _current,
          distance,
        });
      }
    }
  }
  if (
    latestYObj.prev.distance !== Infinity &&
    latestYObj.next.distance !== Infinity &&
    Math.abs(latestYObj.prev.distance - latestYObj.next.distance) <
      threshold * 2
  ) {
    let staff = (latestYObj.next.distance - latestYObj.prev.distance) / 2;
    if (
      [
        Snap.ControlType.TopLeft,
        Snap.ControlType.TopRight,
        Snap.ControlType.Top,
      ].includes(controlType)
    ) {
      staff = latestYObj.next.distance - latestYObj.prev.distance;
    } else if (
      [
        Snap.ControlType.BottomLeft,
        Snap.ControlType.BottomRight,
        Snap.ControlType.Bottom,
      ].includes(controlType)
    ) {
      staff = latestYObj.prev.distance - latestYObj.next.distance;
    }

    const preMiddle = getMiddle(
      {
        min: getLeftPoint(latestYObj.prev.point).x,
        max: getRightPoint(latestYObj.prev.point).x,
      },
      {
        min: targetPoint.tl.x,
        max: targetPoint.tr.x,
      },
    );

    const nextMiddle = getMiddle(
      {
        min: getLeftPoint(latestYObj.next.point).x,
        max: getRightPoint(latestYObj.next.point).x,
      },
      {
        min: targetPoint.tl.x,
        max: targetPoint.tr.x,
      },
    );

    let prevY = staff + targetPoint.tl.y;
    let nextY = staff + targetPoint.bl.y;
    if (
      [
        Snap.ControlType.TopLeft,
        Snap.ControlType.TopRight,
        Snap.ControlType.Top,
      ].includes(controlType)
    ) {
      nextY = targetPoint.bl.y;
    } else if (
      [
        Snap.ControlType.BottomLeft,
        Snap.ControlType.BottomRight,
        Snap.ControlType.Bottom,
      ].includes(controlType)
    ) {
      prevY = targetPoint.tl.y;
      nextY = targetPoint.bl.y - staff;
    }

    rs = {
      ...rs,
      top: {
        snapDistance: Math.abs(staff),
        helplines: [
          [
            {
              x: preMiddle,
              y: getBottomPoint(latestYObj.prev.point).y,
            },
            {
              x: preMiddle,
              y: prevY,
            },
          ],
          [
            {
              x: nextMiddle,
              y: nextY,
            },
            {
              x: nextMiddle,
              y: getTopPoint(latestYObj.next.point).y,
            },
          ],
          ...next
            .concat(prev)
            .filter(d =>
              numberEqual(
                d.distance,
                (latestYObj.prev.distance + latestYObj.next.distance) / 2,
              ),
            )
            .map(d => {
              const _m = getMiddle(
                {
                  min: getTopPoint(d.from).y,
                  max: getBottomPoint(d.from).y,
                },
                { min: getTopPoint(d.to).y, max: getBottomPoint(d.to).y },
              );
              return [
                {
                  x: getRightPoint(d.from).x,
                  y: _m,
                },
                {
                  x: getLeftPoint(d.to).x,
                  y: _m,
                },
              ];
            }),
        ],
        next: staff,
        isSnap: true,
      },
    };
  } else {
    if (next.length > 0) {
      const mins: {
        from: Snap.ObjectPointsWithMiddle;
        to: Snap.ObjectPointsWithMiddle;
        distance: number;
      }[] = [];
      let latestDistance = 999;
      let latestItem = next[0];
      next.forEach(n => {
        const distance = n.distance - latestYObj.next.distance;
        if (Math.abs(distance) < Math.abs(latestDistance)) {
          latestDistance = distance;
          latestItem = n;
        }
      });

      if (Math.abs(latestDistance) <= threshold) {
        next.forEach(n => {
          if (numberEqual(n.distance, latestItem.distance)) {
            mins.push(n);
          }
        });

        if (mins.length > 0) {
          let staff = latestYObj.next.distance - mins[0].distance;
          if (
            [
              Snap.ControlType.Bottom,
              Snap.ControlType.BottomLeft,
              Snap.ControlType.BottomRight,
            ].includes(controlType)
          ) {
            staff = mins[0].distance - latestYObj.next.distance;
          }

          const nextMiddle = getMiddle(
            {
              min: getLeftPoint(latestYObj.next.point).x,
              max: getRightPoint(latestYObj.next.point).x,
            },
            {
              min: targetPoint.tl.x,
              max: targetPoint.tr.x,
            },
          );

          let prevY = staff + targetPoint.bl.y;
          if (
            [
              Snap.ControlType.BottomRight,
              Snap.ControlType.Bottom,
              Snap.ControlType.BottomLeft,
            ].includes(controlType)
          ) {
            prevY = targetPoint.bl.y - staff;
          }

          rs = {
            ...rs,
            top: {
              snapDistance: Math.abs(staff),
              helplines: [
                [
                  {
                    x: nextMiddle,
                    y: prevY,
                  },
                  {
                    x: nextMiddle,
                    y: getTopPoint(latestYObj.next.point).y,
                  },
                ],
                ...mins.map(d => {
                  const _m = getMiddle(
                    {
                      min: getLeftPoint(d.from).x,
                      max: getRightPoint(d.from).x,
                    },
                    { min: getLeftPoint(d.to).x, max: getRightPoint(d.to).x },
                  );
                  return [
                    {
                      x: _m,
                      y: getBottomPoint(d.from).y,
                    },
                    {
                      x: _m,
                      y: getTopPoint(d.to).y,
                    },
                  ];
                }),
              ],
              next: staff,
              isSnap: true,
            },
          };
        }
      }
    }

    if (prev.length > 0) {
      const mins: {
        from: Snap.ObjectPointsWithMiddle;
        to: Snap.ObjectPointsWithMiddle;
        distance: number;
      }[] = [];
      let latestDistance = 999;
      let latestItem = prev[0];
      prev.forEach(n => {
        const distance = n.distance - latestYObj.prev.distance;
        if (Math.abs(distance) < Math.abs(latestDistance)) {
          latestDistance = distance;
          latestItem = n;
        }
      });

      if (Math.abs(latestDistance) <= threshold) {
        prev.forEach(n => {
          if (numberEqual(n.distance, latestItem.distance)) {
            mins.push(n);
          }
        });

        if (mins.length > 0) {
          const staff = -(latestYObj.prev.distance - mins[0].distance);
          const nextMiddle = getMiddle(
            {
              min: getLeftPoint(latestYObj.prev.point).x,
              max: getRightPoint(latestYObj.prev.point).x,
            },
            {
              min: targetPoint.tl.x,
              max: targetPoint.tr.x,
            },
          );

          if (Math.abs(staff) < (rs.top?.snapDistance || Infinity)) {
            rs = {
              ...rs,
              top: {
                snapDistance: Math.abs(staff),
                helplines: [
                  [
                    {
                      x: nextMiddle,
                      y: staff + targetPoint.tl.y,
                    },
                    {
                      x: nextMiddle,
                      y: getBottomPoint(latestYObj.prev.point).y,
                    },
                  ],
                  ...mins.map(d => {
                    const _m = getMiddle(
                      {
                        min: getLeftPoint(d.from).x,
                        max: getRightPoint(d.from).x,
                      },
                      { min: getLeftPoint(d.to).x, max: getRightPoint(d.to).x },
                    );
                    return [
                      {
                        x: _m,
                        y: getBottomPoint(d.from).y,
                      },
                      {
                        x: _m,
                        y: getTopPoint(d.to).y,
                      },
                    ];
                  }),
                ],
                next: staff,
                isSnap: true,
              },
            };
          }
        }
      }
    }
  }

  // According to the control point, process the property change value
  if (
    [
      Snap.ControlType.TopLeft,
      Snap.ControlType.TopRight,
      Snap.ControlType.Top,
    ].includes(controlType)
  ) {
    if (rs.top?.isSnap) {
      rs.height = {
        ...rs.top,
        helplines: [],
        next: -rs.top.next,
      };
    }
  } else if (
    [
      Snap.ControlType.BottomLeft,
      Snap.ControlType.BottomRight,
      Snap.ControlType.Bottom,
    ].includes(controlType)
  ) {
    if (rs.top?.isSnap) {
      rs.height = {
        ...rs.top,
        helplines: [],
        next: -rs.top.next,
      };
      rs.top.next = 0;
    }
  }

  if (
    [
      Snap.ControlType.TopLeft,
      Snap.ControlType.Left,
      Snap.ControlType.BottomLeft,
    ].includes(controlType)
  ) {
    if (rs.left?.isSnap) {
      rs.width = {
        ...rs.left,
        helplines: [],
        next: -rs.left.next,
      };
    }
  } else if (
    [
      Snap.ControlType.TopRight,
      Snap.ControlType.Right,
      Snap.ControlType.BottomRight,
    ].includes(controlType)
  ) {
    if (rs.left?.isSnap) {
      rs.width = {
        ...rs.left,
        helplines: [],
        next: -rs.left.next,
      };
      rs.left.next = 0;
    }
  }

  return rs;
};
