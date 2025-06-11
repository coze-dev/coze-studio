import { ConfigEntity } from '@flowgram-adapter/free-layout-editor';

interface WorkflowDependencyState {
  refreshModalVisible: boolean;
  saveVersion: bigint;
  refreshFunc: (() => void) | undefined;
}

export class WorkflowDependencyStateEntity extends ConfigEntity<WorkflowDependencyState> {
  static type = 'WorkflowDependencyStateEntity';
  getDefaultConfig(): WorkflowDependencyState {
    return {
      refreshModalVisible: false,
      saveVersion: BigInt(0),
      refreshFunc: undefined,
    };
  }

  setRefreshModalVisible(visible: boolean) {
    this.updateConfig({
      refreshModalVisible: visible,
    });
  }

  public get refreshModalVisible() {
    return this.config.refreshModalVisible;
  }

  public get saveVersion() {
    return this.config.saveVersion;
  }

  public setSaveVersion(version: bigint) {
    this.updateConfig({
      saveVersion: version,
    });
  }

  public addSaveVersion() {
    const nextVersion = this.config.saveVersion + BigInt(1);
    this.updateConfig({
      saveVersion: nextVersion,
    });
  }

  public get refreshFunc() {
    return this.config.refreshFunc;
  }

  public setRefreshFunc(func: () => void) {
    this.updateConfig({
      refreshFunc: func,
    });
  }
}
