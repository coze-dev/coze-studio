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

import { inject, injectable } from 'inversify';
import { URI, OpenerService } from '@coze-project-ide/core';

import { ReactWidget } from '../../react-widget';
import { type ActivityBarItem } from '../../../types/view';
import { type StatefulWidget } from '../../../shell/layout-restorer';
import { ActivityBar } from '../../../components/activity-bar';

export const ACTIVITY_BAR_CONTENT = new URI(
  'flowide://panel/activity-bar-content',
);

@injectable()
export class ActivityBarWidget extends ReactWidget implements StatefulWidget {
  list: ActivityBarItem[] = [];

  currentUri: URI | undefined;

  @inject(OpenerService) openerService: OpenerService;

  async initView(list: ActivityBarItem[], currentUri?: URI) {
    this.list = list;
    this.id = 'flowide-activity-bar-container';

    if (currentUri) {
      this.setCurrentUri(currentUri);
    }
  }

  setCurrentUri(next: URI) {
    if (this.currentUri === next) {
      this.currentUri = undefined;
    } else {
      this.currentUri = next;
    }
    this.openerService.open(next);
    this.update();
  }

  storeState(): object | undefined {
    throw new Error('Method not implemented.');
  }

  restoreState(state: object): void {
    throw new Error('Method not implemented.');
  }

  render() {
    return (
      <ActivityBar
        list={this.list}
        currentUri={this.currentUri}
        setCurrentUri={uri => this.setCurrentUri(uri)}
      />
    );
  }
}
