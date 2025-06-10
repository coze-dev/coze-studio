// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2017, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/

/**
 * Topologically sort an iterable of edges.
 *
 * @param edges - The iterable object of edges to sort.
 *   An edge is represented as a 2-tuple of `[fromNode, toNode]`.
 *
 * @returns The topologically sorted array of nodes.
 *
 * #### Notes
 * If a cycle is present in the graph, the cycle will be ignored and
 * the return value will be only approximately sorted.
 *
 * #### Example
 * ```typescript
 * import { topologicSort } from '../algorithm';
 *
 * let data = [
 *   ['d', 'e'],
 *   ['c', 'd'],
 *   ['a', 'b'],
 *   ['b', 'c']
 * ];
 *
 * topologicSort(data);  // ['a', 'b', 'c', 'd', 'e']
 * ```
 */
export function topologicSort<T>(edges: Iterable<[T, T]>): T[] {
  // Setup the shared sorting state.
  const sorted: T[] = [];
  const visited = new Set<T>();
  const graph = new Map<T, T[]>();

  // Add the edges to the graph.
  for (const edge of edges) {
    addEdge(edge);
  }

  // Visit each node in the graph.
  for (const [k] of graph) {
    visit(k);
  }

  // Return the sorted results.
  return sorted;

  // Add an edge to the graph.
  function addEdge(edge: [T, T]): void {
    const [fromNode, toNode] = edge;
    const children = graph.get(toNode);
    if (children) {
      children.push(fromNode);
    } else {
      graph.set(toNode, [fromNode]);
    }
  }

  // Recursively visit the node.
  function visit(node: T): void {
    if (visited.has(node)) {
      return;
    }
    visited.add(node);
    const children = graph.get(node);
    if (children) {
      for (const child of children) {
        visit(child);
      }
    }
    sorted.push(node);
  }
}
