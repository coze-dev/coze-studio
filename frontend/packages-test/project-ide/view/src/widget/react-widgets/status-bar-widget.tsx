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
