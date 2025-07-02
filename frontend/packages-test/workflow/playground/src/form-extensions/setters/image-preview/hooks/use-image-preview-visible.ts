import { type FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import { useCurrentEntity } from '@flowgram-adapter/free-layout-editor';
import { StandardNodeType } from '@coze-workflow/base';

import { isInputAsOutput, isOutputsContainsImage } from '../utils';
import { useInputContainsImage } from './use-input-contains-image';

/**
 * 根据节点的input和output，判断是否显示图片预览模块
 */
export const useImagePreviewVisible = () => {
  const node: FlowNodeEntity = useCurrentEntity();

  const { flowNodeType } = node;

  const inputContainsImage = useInputContainsImage(node);

  // 开始节点不需要
  if (flowNodeType === StandardNodeType.Start) {
    return false;
  }

  // end节点和message节点的输入就是输出，当输入引用了图片类型时，需要展示
  if (isInputAsOutput(flowNodeType as StandardNodeType)) {
    return inputContainsImage;
  } else {
    // output中包含图片类型时，需要展示
    return isOutputsContainsImage(node);
  }
};
