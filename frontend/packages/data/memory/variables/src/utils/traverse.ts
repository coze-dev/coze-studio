// eslint-disable-next-line max-params
export function traverse<
  T extends { [key in K]?: T[] },
  K extends string = 'children',
>(
  nodeOrNodes: T | T[],
  action: (node: T) => void,
  traverseKey: K = 'children' as K,
  maxDepth = Infinity,
  currentDepth = 0,
) {
  const nodes = Array.isArray(nodeOrNodes) ? nodeOrNodes : [nodeOrNodes];
  nodes.forEach(node => {
    action(node);
    if (currentDepth < maxDepth) {
      const children = node[traverseKey] ?? [];
      if (children?.length > 0) {
        traverse(children, action, traverseKey, maxDepth, currentDepth + 1);
      }
    }
  });
}
