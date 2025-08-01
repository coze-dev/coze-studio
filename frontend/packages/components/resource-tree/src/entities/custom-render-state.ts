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
  ConfigEntity,
  type FlowNodeEntity,
  type EntityOpts,
} from '@flowgram-adapter/fixed-layout-editor';

interface NodeRenderState {
  selectNodes: string[];
  selectLines: string[];
  activatedNode?: FlowNodeEntity;
}
/**
 * Rendering-related global state management
 */
export class CustomRenderStateConfigEntity extends ConfigEntity<
  NodeRenderState,
  EntityOpts
> {
  static type = 'CustomRenderStateConfigEntity';

  getDefaultConfig() {
    return {
      selectNodes: [],
      selectLines: [],
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(conf: EntityOpts) {
    super(conf);
  }

  get selectNodes() {
    return this.config.selectNodes;
  }

  setSelectNodes(nodes: string[]) {
    this.updateConfig({
      selectNodes: nodes,
    });
  }

  get activatedNode() {
    return this.config.activatedNode;
  }

  setActivatedNode(node?: FlowNodeEntity) {
    this.updateConfig({
      activatedNode: node,
    });
  }

  get activeLines() {
    return this.config.selectLines;
  }

  set activeLines(lines) {
    this.updateConfig({
      selectLines: lines,
    });
  }
}
