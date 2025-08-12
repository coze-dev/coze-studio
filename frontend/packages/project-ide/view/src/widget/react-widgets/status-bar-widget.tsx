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

import { injectable } from 'inversify';
import { URI } from '@coze-project-ide/core';

import { ReactWidget } from '../react-widget';
import { type StatusBarItem } from '../../types/view';
import { StatusBar } from '../../components/status-bar';
import PerfectScrollbar from '../../components/scroll-bar';

export const STATUS_BAR_CONTENT = new URI('flowide://panel/status-bar-content');

@injectable()
export class StatusBarWidget extends ReactWidget {
  list: StatusBarItem[] = [];

  scrollbar: PerfectScrollbar;

  async initView(list: StatusBarItem[]) {
    this.list = list;
    this.id = 'flowide-status-bar-container';

    this.scrollbar = new PerfectScrollbar(this.node);
    this.update();
  }

  render() {
    return <StatusBar items={this.list} />;
  }
}
