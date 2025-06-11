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
