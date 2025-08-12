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

import { type Workflow } from '@coze-arch/idl/workflow_api';
import { ConfigEntity } from '@flowgram-adapter/free-layout-editor';
import { Emitter } from '@flowgram-adapter/common';

interface WorkflowTemplateState {
  visible: boolean;
  previewVisible: boolean;
  previewInfo: Workflow;
  dataList: Workflow[];
}

export class WorkflowTemplateStateEntity extends ConfigEntity<WorkflowTemplateState> {
  static type = 'WorkflowTemplateStateEntity';

  visible: boolean;
  previewVisible: boolean;
  previewInfo: Workflow;
  dataList: Workflow[];

  // Triggered after update
  onPreviewUpdatedEmitter = new Emitter();
  onPreviewUpdated = this.onPreviewUpdatedEmitter.event;

  getDefaultConfig(): WorkflowTemplateState {
    return {
      visible: false,
      previewVisible: false,
      previewInfo: {},
      dataList: [],
    };
  }

  setTemplateList(list: Workflow[]) {
    this.updateConfig({
      dataList: list,
    });
  }

  openTemplate() {
    this.updateConfig({
      visible: true,
    });
  }

  closeTemplate() {
    this.updateConfig({
      visible: false,
    });
  }

  public get templatePreviewInfo() {
    return this.config.previewInfo;
  }

  public get templateVisible() {
    return this.config.visible;
  }

  public get templateList() {
    return this.config.dataList;
  }

  openPreview(templateInfo) {
    this.updateConfig({
      previewVisible: true,
      previewInfo: templateInfo,
    });

    this.onPreviewUpdatedEmitter.fire({
      previewVisible: true,
    });
  }
  closePreview() {
    this.updateConfig({
      previewVisible: false,
      previewInfo: undefined,
    });

    this.onPreviewUpdatedEmitter.fire({
      previewVisible: false,
    });
  }
}
