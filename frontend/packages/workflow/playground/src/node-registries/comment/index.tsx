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
 
import React from 'react';

import {
  StandardNodeType,
  type WorkflowNodeRegistry,
} from '@coze-workflow/base';

import type { ICommentNodeVO, ICommentNodeDTO } from './type';
import {
  CommentDefaultDTO,
  CommentDefaultNote,
  CommentDefaultVO,
  CommentDefaultSize,
  CommentDefaultSchemaType,
} from './constant';

export const COMMENT_NODE_REGISTRY: WorkflowNodeRegistry = {
  type: StandardNodeType.Comment,
  meta: {
    disableSideSheet: true,
    nodeDTOType: StandardNodeType.Comment,
    renderKey: StandardNodeType.Comment,
    size: {
      width: 240,
      height: 150,
    },
  },
  formMeta: {
    render: () => <></>,
    formatOnInit: (
      value: ICommentNodeDTO = CommentDefaultDTO,
    ): ICommentNodeVO => {
      const { inputs, ...rest } = value;
      return {
        ...rest,
        schemaType: inputs?.schemaType ?? CommentDefaultSchemaType, // 默认使用 slate 格式，后续考虑支持其他格式
        note: inputs?.note ?? CommentDefaultNote,
        size: value.size ?? CommentDefaultSize,
      };
    },
    formatOnSubmit(value: ICommentNodeVO = CommentDefaultVO): ICommentNodeDTO {
      const { note, schemaType, ...rest } = value;
      return {
        ...rest,
        inputs: {
          schemaType: schemaType ?? CommentDefaultSchemaType, // 默认使用 slate 格式，后续考虑支持其他格式
          note: note ?? CommentDefaultNote,
        },
        size: value.size ?? CommentDefaultSize,
      };
    },
  },
  getInputPoints: () => [], // Comment 节点没有输入
  getOutputPoints: () => [], // Comment 节点没有输出
};
