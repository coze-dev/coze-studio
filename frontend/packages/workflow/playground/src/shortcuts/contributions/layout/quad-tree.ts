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
 
/* eslint-disable prefer-destructuring -- no need */
/* eslint-disable @typescript-eslint/no-namespace -- 使用 namespace 方便管理 */
import type { LayoutNode } from '@flowgram-adapter/free-layout-editor';

interface QuadTreeBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface QuadTree {
  bounds: QuadTreeBounds;
  nodes: LayoutNode[];
  northWest: QuadTree | null;
  northEast: QuadTree | null;
  southWest: QuadTree | null;
  southEast: QuadTree | null;
}

/** 默认容量 */
const DEFAULT_CAPACITY = 4;

/** 创建四叉树节点 */
const createNode = (bounds: QuadTreeBounds): QuadTree => ({
  bounds,
  nodes: [],
  northWest: null,
  northEast: null,
  southWest: null,
  southEast: null,
});

/** 检查节点是否在边界内（需要考虑节点的大小） */
const containsNode = (bounds: QuadTreeBounds, node: LayoutNode): boolean =>
  node.position.x >= bounds.x &&
  node.position.x + node.size.width <= bounds.x + bounds.width &&
  node.position.y >= bounds.y &&
  node.position.y + node.size.height <= bounds.y + bounds.height;

/** 细分节点 */
const subdivide = (quadTree: QuadTree): QuadTree => {
  const { x, y, width, height } = quadTree.bounds;
  const w = width / 2;
  const h = height / 2;

  return {
    ...quadTree,
    northWest: createNode({ x, y, width: w, height: h }),
    northEast: createNode({ x: x + w, y, width: w, height: h }),
    southWest: createNode({ x, y: y + h, width: w, height: h }),
    southEast: createNode({ x: x + w, y: y + h, width: w, height: h }),
  };
};

/** 插入节点 */
const insert = (
  quadTree: QuadTree,
  node: LayoutNode,
  capacity: number,
): QuadTree => {
  if (!containsNode(quadTree.bounds, node)) {
    return quadTree;
  }

  if (!quadTree.northWest) {
    const newNodes = [...quadTree.nodes, node];
    if (newNodes.length <= capacity) {
      return { ...quadTree, nodes: newNodes };
    }
  }

  const updatedQuadTree = quadTree.northWest ? quadTree : subdivide(quadTree);

  // 检查节点是否可以插入到任何子象限
  const canInsertIntoQuadrant = (quadrant: QuadTree | null): boolean =>
    quadrant ? containsNode(quadrant.bounds, node) : false;

  // 如果节点不能插入到任何子象限，将其保留在当前节点中
  if (
    !canInsertIntoQuadrant(updatedQuadTree.northWest) &&
    !canInsertIntoQuadrant(updatedQuadTree.northEast) &&
    !canInsertIntoQuadrant(updatedQuadTree.southWest) &&
    !canInsertIntoQuadrant(updatedQuadTree.southEast)
  ) {
    return { ...updatedQuadTree, nodes: [...updatedQuadTree.nodes, node] };
  }

  const insertIntoQuadrant = (quadrant: QuadTree | null): QuadTree | null =>
    quadrant ? insert(quadrant, node, capacity) : null;

  return {
    ...updatedQuadTree,
    northWest: insertIntoQuadrant(updatedQuadTree.northWest),
    northEast: insertIntoQuadrant(updatedQuadTree.northEast),
    southWest: insertIntoQuadrant(updatedQuadTree.southWest),
    southEast: insertIntoQuadrant(updatedQuadTree.southEast),
  };
};

/** 计算两个节点之间的距离（考虑节点中心点） */
const distance = (n1: LayoutNode, n2: LayoutNode): number => {
  const dx =
    n1.position.x + n1.size.width / 2 - (n2.position.x + n2.size.width / 2);
  const dy =
    n1.position.y + n1.size.height / 2 - (n2.position.y + n2.size.height / 2);
  return Math.sqrt(dx * dx + dy * dy);
};

/** 计算节点到边界的最小距离（考虑节点的大小） */
const distanceToBounds = (node: LayoutNode, bounds: QuadTreeBounds): number => {
  if (containsNode(bounds, node)) {
    // 如果节点完全在边界内，返回0
    return 0;
  }
  const dx = Math.max(
    bounds.x - (node.position.x + node.size.width),
    0,
    node.position.x - (bounds.x + bounds.width),
  );
  const dy = Math.max(
    bounds.y - (node.position.y + node.size.height),
    0,
    node.position.y - (bounds.y + bounds.height),
  );
  return Math.sqrt(dx * dx + dy * dy);
};

/** 计算节点集合的边界（考虑节点的大小） */
const calculateBounds = (nodes: LayoutNode[]): QuadTreeBounds => {
  if (nodes.length === 0) {
    // 返回一个默认的边界
    return {
      x: 0,
      y: 0,
      width: 1,
      height: 1,
    };
  }

  const xValues = nodes.map(node => node.position.x);
  const yValues = nodes.map(node => node.position.y);
  const widths = nodes.map(node => node.size.width);
  const heights = nodes.map(node => node.size.height);

  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues.map((x, i) => x + widths[i]));
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues.map((y, i) => y + heights[i]));

  // 添加一些边距以确保所有点都在边界内
  const margin = Math.max(maxX - minX, maxY - minY) * 0.1;

  return {
    x: minX - margin,
    y: minY - margin,
    width: maxX - minX + 2 * margin,
    height: maxY - minY + 2 * margin,
  };
};

/** 创建四叉树 */
export const createQuadTree = (nodes: LayoutNode[]): QuadTree => {
  const bounds = calculateBounds(nodes);
  let quadTree = createNode(bounds);

  nodes.forEach(node => {
    quadTree = insert(quadTree, node, DEFAULT_CAPACITY);
  });

  return quadTree;
};

/** 查找最近邻 */
export const findNearestNeighbor = (
  quadTree: QuadTree,
  targetNode: LayoutNode,
): LayoutNode | null => {
  const findNearest = (
    node: QuadTree,
    nearest: LayoutNode | null,
    minDistance: number,
  ): { nearest: LayoutNode | null; minDistance: number } => {
    // 检查当前节点中的所有点
    for (const currentNode of node.nodes) {
      if (currentNode === targetNode) {
        // 排除自身
        continue;
      }
      const currentDistance = distance(targetNode, currentNode);
      if (currentDistance < minDistance) {
        nearest = currentNode;
        minDistance = currentDistance;
      }
    }

    // 如果这是叶子节点，返回结果
    if (!node.northWest) {
      return { nearest, minDistance };
    }

    // 检查子四叉树
    const quadrants = [
      node.northWest,
      node.northEast,
      node.southWest,
      node.southEast,
    ]
      .filter((q): q is QuadTree => q !== null)
      .sort(
        (a, b) =>
          distanceToBounds(targetNode, a.bounds) -
          distanceToBounds(targetNode, b.bounds),
      );

    for (const quadrant of quadrants) {
      if (distanceToBounds(targetNode, quadrant.bounds) < minDistance) {
        const result = findNearest(quadrant, nearest, minDistance);
        nearest = result.nearest;
        minDistance = result.minDistance;
      }
    }

    return { nearest, minDistance };
  };

  const result = findNearest(quadTree, null, Infinity);
  return result.nearest;
};

/** 四叉树工具类 */
export namespace QuadTree {
  export const create = createQuadTree;
  export const find = findNearestNeighbor;
}
