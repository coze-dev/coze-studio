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
/* eslint-disable @typescript-eslint/no-namespace -- use namespace for easy management */
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

/** default capacity */
const DEFAULT_CAPACITY = 4;

/** Create a quadtree node */
const createNode = (bounds: QuadTreeBounds): QuadTree => ({
  bounds,
  nodes: [],
  northWest: null,
  northEast: null,
  southWest: null,
  southEast: null,
});

/** Check whether the node is within the boundary (the size of the node needs to be taken into account). */
const containsNode = (bounds: QuadTreeBounds, node: LayoutNode): boolean =>
  node.position.x >= bounds.x &&
  node.position.x + node.size.width <= bounds.x + bounds.width &&
  node.position.y >= bounds.y &&
  node.position.y + node.size.height <= bounds.y + bounds.height;

/** subdivision node */
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

/** Insert Node */
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

  // Check if a node can be inserted into any subquadrant
  const canInsertIntoQuadrant = (quadrant: QuadTree | null): boolean =>
    quadrant ? containsNode(quadrant.bounds, node) : false;

  // If a node cannot be inserted into any subquadrant, leave it in the current node
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

/** Calculate the distance between two nodes (taking into account the node center). */
const distance = (n1: LayoutNode, n2: LayoutNode): number => {
  const dx =
    n1.position.x + n1.size.width / 2 - (n2.position.x + n2.size.width / 2);
  const dy =
    n1.position.y + n1.size.height / 2 - (n2.position.y + n2.size.height / 2);
  return Math.sqrt(dx * dx + dy * dy);
};

/** Calculate the minimum distance from a node to the boundary (taking into account the size of the node). */
const distanceToBounds = (node: LayoutNode, bounds: QuadTreeBounds): number => {
  if (containsNode(bounds, node)) {
    // If the node is completely within the boundary, return 0.
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

/** Calculate the boundaries of a set of nodes (taking into account the size of the nodes). */
const calculateBounds = (nodes: LayoutNode[]): QuadTreeBounds => {
  if (nodes.length === 0) {
    // Returns a default boundary
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

  // Add some margins to ensure that all points are within the boundary
  const margin = Math.max(maxX - minX, maxY - minY) * 0.1;

  return {
    x: minX - margin,
    y: minY - margin,
    width: maxX - minX + 2 * margin,
    height: maxY - minY + 2 * margin,
  };
};

/** Create a quadtree */
export const createQuadTree = (nodes: LayoutNode[]): QuadTree => {
  const bounds = calculateBounds(nodes);
  let quadTree = createNode(bounds);

  nodes.forEach(node => {
    quadTree = insert(quadTree, node, DEFAULT_CAPACITY);
  });

  return quadTree;
};

/** Find Nearest Neighbors */
export const findNearestNeighbor = (
  quadTree: QuadTree,
  targetNode: LayoutNode,
): LayoutNode | null => {
  const findNearest = (
    node: QuadTree,
    nearest: LayoutNode | null,
    minDistance: number,
  ): { nearest: LayoutNode | null; minDistance: number } => {
    // Check all points in the current node
    for (const currentNode of node.nodes) {
      if (currentNode === targetNode) {
        // exclude itself
        continue;
      }
      const currentDistance = distance(targetNode, currentNode);
      if (currentDistance < minDistance) {
        nearest = currentNode;
        minDistance = currentDistance;
      }
    }

    // If this is a leaf node, return the result
    if (!node.northWest) {
      return { nearest, minDistance };
    }

    // check subquadtree
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

/** Quadtree tool class */
export namespace QuadTree {
  export const create = createQuadTree;
  export const find = findNearestNeighbor;
}
