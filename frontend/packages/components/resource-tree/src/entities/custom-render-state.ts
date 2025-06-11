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
 * 渲染相关的全局状态管理
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
