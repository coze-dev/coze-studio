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
