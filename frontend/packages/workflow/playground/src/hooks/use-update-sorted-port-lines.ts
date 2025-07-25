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
 
import {
  WorkflowNodePortsData,
  useCurrentEntity,
} from '@flowgram-adapter/free-layout-editor';

import { useLineService } from './use-line-service';

/**
 * 端口排序更新后，需要重新连线。
 *
 * 多端口的情况下，使用了index作为portId， 而不是uid。
 *
 * 当port排序变更后，index并不会改变，如果希望连线和数据保持一致，只能重新连线。
 *
 * */
export const useUpdateSortedPortLines = (
  calcPortId: (index: number) => string,
) => {
  const node = useCurrentEntity();

  const lineService = useLineService();

  /**
   *  将startIndex 到 endIndex 中间所有的连线全部重新连接
   *  两两交互，例：
   *
   *  0 1 2
   *
   *  1 0 2
   *
   *  1 2 0
   * */
  const updateSortedPortLines = (startIndex: number, endIndex: number) => {
    if (startIndex === endIndex) {
      return;
    }

    const step = startIndex < endIndex ? 1 : -1;

    for (let i = startIndex; i !== endIndex; i += step) {
      const oldPortInfo = {
        from: node.id,
        fromPort: calcPortId(i),
      };
      const newPortInfo = {
        from: node.id,
        fromPort: calcPortId(i + step),
      };
      lineService.replaceLineByPort(oldPortInfo, newPortInfo);
    }

    // 拖拽结束后端口dom对应的portId变更，需要更新一下
    node
      .getData<WorkflowNodePortsData>(WorkflowNodePortsData)
      .updateDynamicPorts();
  };

  return updateSortedPortLines;
};
