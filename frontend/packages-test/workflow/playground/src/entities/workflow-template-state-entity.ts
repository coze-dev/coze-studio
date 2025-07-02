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

  // 更新后触发
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
