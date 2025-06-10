interface TreeNode<T> {
  children?: T[];
  [key: string]: unknown;
}

export function traverse<T extends TreeNode<T>>(
  nodeOrNodes: T | T[],
  action: (node: T) => void,
) {
  const nodes = Array.isArray(nodeOrNodes) ? nodeOrNodes : [nodeOrNodes];

  nodes.forEach(node => {
    action(node);

    if (node.children && node.children.length > 0) {
      traverse(node.children, action);
    }
  });
}
