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

/* eslint-disable @coze-arch/use-error-in-catch */
import { inject, injectable } from 'inversify';
import { Emitter, type Event } from '@coze-project-ide/client';
import { OptionsService } from '@coze-project-ide/base-adapter';
import { I18n } from '@coze-arch/i18n';
import { sleep } from '@coze-arch/bot-utils';
import {
  type ResourceCopyDispatchRequest,
  type ResourceCopyScene,
  type ResourceCopyTaskDetail,
  ResType,
  TaskStatus,
} from '@coze-arch/bot-api/plugin_develop';
import { PluginDevelopApi } from '@coze-arch/bot-api';

export enum ModalType {
  RESOURCE = 'resource',
  CLOSE_CONFIRM = 'close-confirm',
}

interface EmitterProps {
  type: ModalType;
  options?: any;
  // Open the window by default without sending it.
  visible?: boolean;
  scene?: ResourceCopyScene;
  resourceName?: string;
}

const POLLING_DELAY = 1000;

/**
 * pop-up polling service
 * getPolling Start polling
 * Retry Retry
 * onCloseResourceModal close the polling window
 */
@injectable()
export class ModalService {
  @inject(OptionsService) options: OptionsService;
  readonly onModalVisibleChangeEmitter = new Emitter<EmitterProps>();
  readonly onModalVisibleChange: Event<EmitterProps> =
    this.onModalVisibleChangeEmitter.event;
  readonly onCancelEmitter: Emitter<void> = new Emitter<void>();
  readonly onCancel: Event<void> = this.onCancelEmitter.event;
  protected readonly pollingDelay = 1000;

  readonly onErrorEmitter = new Emitter<boolean | string>();
  readonly onError: Event<boolean | string> = this.onErrorEmitter.event;

  readonly onSuccessEmitter = new Emitter<ResourceCopyTaskDetail | undefined>();
  readonly onSuccess: Event<ResourceCopyTaskDetail | undefined> =
    this.onSuccessEmitter.event;

  protected _stopPolling = false;
  private _taskId?: string;

  // Start polling
  async startPolling(props: ResourceCopyDispatchRequest) {
    this._stopPolling = false;

    const resourceName = props.res_name;

    try {
      // 1. Request interface, get taskId
      this.onModalVisibleChangeEmitter.fire({
        type: ModalType.RESOURCE,
        scene: props.scene,
        resourceName,
      });
      const { task_id, failed_reasons } =
        await PluginDevelopApi.ResourceCopyDispatch(props);
      this._taskId = task_id;

      if (failed_reasons?.length) {
        let errorInfo = '';
        // Workflow specific copy
        if (
          failed_reasons.some(reason => reason.res_type === ResType.Workflow)
        ) {
          errorInfo = I18n.t('resource_copy_move_notify');
        } else {
          errorInfo = failed_reasons.reduce((allInfo, item) => {
            const currentError = `${item.res_name || ''}${item.reason || ''}`;
            if (allInfo) {
              return `${allInfo}\n${currentError}`;
            } else {
              return currentError;
            }
          }, '');
        }
        this.onErrorEmitter.fire(errorInfo);
        return;
      }

      // 2. Poll the interface to get the task status according to taskId
      if (task_id) {
        this.doPolling(task_id);
      } else {
        this.onErrorEmitter.fire('no_task_id');
      }
    } catch (e) {
      this.onErrorEmitter.fire(true);
    }
  }

  async retry() {
    this._stopPolling = false;
    if (this._taskId) {
      // 1. retry interface
      await PluginDevelopApi.ResourceCopyRetry({
        task_id: this._taskId,
      });
      this.onErrorEmitter.fire(false);
      // Step 2 Start polling
      this.doPolling(this._taskId);
    }
  }

  async doPolling(taskId: string) {
    this._taskId = taskId;
    if (this._stopPolling) {
      return;
    }
    try {
      const taskInfo = await this.polling();
      const { status } = taskInfo || {};
      await sleep(POLLING_DELAY);

      if (this._taskId && !this._stopPolling) {
        // Update the info information in the pop-up window
        this.onModalVisibleChangeEmitter.fire({
          type: ModalType.RESOURCE,
          scene: taskInfo?.scene,
          resourceName: taskInfo?.res_name,
        });
      }
      if (status === TaskStatus.Processing) {
        this.doPolling(taskId);
      } else if (status === TaskStatus.Successed) {
        this._stopPolling = true;
        this.onModalVisibleChangeEmitter.fire({
          type: ModalType.RESOURCE,
          visible: false,
        });
        this.onSuccessEmitter.fire(taskInfo);
      } else {
        this.onErrorEmitter.fire(true);
      }
    } catch (_e) {
      this._stopPolling = true;
      this.onErrorEmitter.fire(true);
    }
  }

  /**
   * Polling request interface, return polling status
   */
  private async polling(): Promise<ResourceCopyTaskDetail | undefined> {
    try {
      const { task_detail } = await PluginDevelopApi.ResourceCopyDetail({
        task_id: this._taskId,
      });

      return task_detail;
    } catch (e) {
      this._stopPolling = true;
      this.onErrorEmitter.fire(true);
      return {
        status: TaskStatus.Failed,
      };
    }
  }

  async onCloseResourceModal() {
    this._stopPolling = true;
    // Close modal
    this.onModalVisibleChangeEmitter.fire({
      type: ModalType.RESOURCE,
      visible: false,
    });
    this.onCancelEmitter.fire();
    if (this._taskId) {
      // Request to stop polling
      await PluginDevelopApi.ResourceCopyCancel({
        task_id: this._taskId,
      });
      this._taskId = undefined;
    }
  }
}
