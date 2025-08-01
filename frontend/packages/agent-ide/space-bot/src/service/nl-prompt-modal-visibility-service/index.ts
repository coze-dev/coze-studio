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

import mitt, { type Emitter } from 'mitt';
import { EVENT_NAMES } from '@coze-arch/bot-tea';
import {
  type NLPromptModalPosition,
  type NLPromptModalAction,
} from '@coze-agent-ide/bot-editor-context-store';

import { type NLPromptModalVisibilityProps } from './type';

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- mitt do not recognize interface
type VisibilityEvent = {
  visibilitychange:
    | { isShow: true; openModalSource: OpenModalSource }
    | { isShow: false; openModalSource: null };
};

type OpenModalSource = 'ai-button' | 'editor-float-trigger' | 'editor-shortcut';

export class NLPromptModalVisibilityService {
  eventCenter: Emitter<VisibilityEvent> = mitt();
  openModalSource: OpenModalSource | null = null;
  private setVisible: NLPromptModalAction['setVisible'];
  private updateModalPosition: NLPromptModalAction['updatePosition'];
  private sendTeaEvent: NLPromptModalVisibilityProps['sendTeaEvent'];
  public getIsVisible: () => boolean;
  constructor({
    setVisible,
    updateModalPosition,
    getIsVisible,
    sendTeaEvent,
  }: NLPromptModalVisibilityProps) {
    this.setVisible = setVisible;
    this.updateModalPosition = updateModalPosition;
    this.getIsVisible = getIsVisible;
    this.sendTeaEvent = sendTeaEvent;
  }
  public open = (position: NLPromptModalPosition, source: OpenModalSource) => {
    this.setVisible(true);
    this.updateModalPosition(() => position);
    this.openModalSource = source;
    this.eventCenter.emit('visibilitychange', {
      isShow: true,
      openModalSource: source,
    });
  };
  public updatePosition = (
    updateFn: (position: NLPromptModalPosition) => NLPromptModalPosition,
  ) => {
    this.updateModalPosition(updateFn);
  };
  public close = () => {
    if (!this.getIsVisible()) {
      return;
    }
    this.setVisible(false);
    this.eventCenter.emit('visibilitychange', {
      isShow: false,
      openModalSource: null,
    });
    this.sendTeaEvent(EVENT_NAMES.prompt_optimize_front, {
      action: 'exit',
    });
  };
  public getOpenModalSource = () => this.openModalSource;
}
