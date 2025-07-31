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

import { injectable } from 'inversify';
import { Emitter } from '@flowgram-adapter/common';

@injectable()
export class EncapsulateRenderService {
  private isModalVisible = false;
  private onModalVisibleChangeEmitter = new Emitter<boolean>();
  readonly onModalVisibleChange = this.onModalVisibleChangeEmitter.event;

  private isTooltipVisible = false;
  private onTooltipVisibleChangeEmitter = new Emitter<boolean>();
  readonly onTooltipVisibleChange = this.onTooltipVisibleChangeEmitter.event;

  private isLoading = false;
  private onLoadingChangeEmitter = new Emitter<boolean>();
  readonly onLoadingChange = this.onLoadingChangeEmitter.event;

  get modalVisible() {
    return this.isModalVisible;
  }

  get tooltipVisible() {
    return this.isTooltipVisible;
  }

  get loading() {
    return this.isLoading;
  }

  setLoading(value: boolean) {
    this.isLoading = value;
    this.onLoadingChangeEmitter.fire(value);
  }

  openModal() {
    this.setModalVisible(true);
  }

  closeModal() {
    this.setModalVisible(false);
  }

  showTooltip() {
    this.setTooltipVisible(true);
  }

  hideTooltip() {
    this.setTooltipVisible(false);
  }

  setTooltipVisible(value: boolean) {
    this.isTooltipVisible = value;
    this.onTooltipVisibleChangeEmitter.fire(value);
  }

  private setModalVisible(value: boolean) {
    this.isModalVisible = value;
    this.onModalVisibleChangeEmitter.fire(value);
  }
}
