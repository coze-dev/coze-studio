import {
  type FlowNodeJSON,
  FlowNodeBaseType,
  type FlowNodeEntity,
  type FlowNodeRegister,
} from '@flowgram-adapter/fixed-layout-editor';
/**
 * 无 BlockOrderIcon 的分支节点
 */
export const Split: FlowNodeRegister = {
  type: 'split',
  extend: 'dynamicSplit',
  onBlockChildCreate(
    originParent: FlowNodeEntity,
    blockData: FlowNodeJSON,
    addedNodes: FlowNodeEntity[] = [], // 新创建的节点都要存在这里
  ) {
    const { document } = originParent;
    const parent = document.getNode(`$inlineBlocks$${originParent.id}`);
    // 块节点会生成一个空的 Block 节点用来切割 Block
    const proxyBlock = document.addNode({
      id: `$block$${blockData.id}`,
      type: FlowNodeBaseType.BLOCK,
      originParent,
      parent,
    });
    const realBlock = document.addNode(
      {
        ...blockData,
        type: blockData.type || FlowNodeBaseType.BLOCK,
        parent: proxyBlock,
      },
      addedNodes,
    );
    addedNodes.push(proxyBlock, realBlock);
    return proxyBlock;
  },
};
