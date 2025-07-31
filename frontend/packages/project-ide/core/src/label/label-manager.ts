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

import { type ReactNode } from 'react';

import { injectable, inject, named } from 'inversify';
import {
  Emitter,
  type Event,
  ContributionProvider,
} from '@flowgram-adapter/common';

import {
  type URI,
  prioritizeAllSync,
  type LifecycleContribution,
} from '../common';
import { type LabelService } from './label-service';
import { LabelHandler } from './label-handler';

interface LabelChangeEvent {
  affects: (element: URI) => boolean;
}

/**
 * Provide, global label data acquisition
 */
@injectable()
export class LabelManager implements LabelService, LifecycleContribution {
  protected readonly onChangeEmitter = new Emitter<LabelChangeEvent>();

  @inject(ContributionProvider)
  @named(LabelHandler)
  protected readonly contributionProvider: ContributionProvider<LabelHandler>;

  onInit() {
    const contributions = this.contributionProvider.getContributions();
    for (const contribution of contributions) {
      if (contribution.onChange) {
        contribution.onChange(event => {
          this.onChangeEmitter.fire({
            affects: element => this.affects(element, event),
          });
        });
      }
    }
  }

  /**
   * Get label icon
   * @param element
   */
  getIcon(element: URI): string | React.ReactNode {
    const contributions = this.findContribution(element);
    for (const contribution of contributions) {
      const value = contribution.getIcon && contribution.getIcon(element);
      if (value === undefined) {
        continue;
      }
      return value;
    }
    return '';
  }

  /**
   * Custom rendering of labels
   */
  renderer(element: URI, opts?: any): ReactNode {
    const handler = this.findContribution(element).find(i => i.renderer);
    if (!handler || !handler.renderer) {
      return null;
    }
    return handler.renderer(element, opts);
  }

  /**
   *  Get label name
   * @param element
   */
  getName(element: URI): string {
    const contributions = this.findContribution(element);
    for (const contribution of contributions) {
      const value = contribution.getName && contribution.getName(element);
      if (value === undefined) {
        continue;
      }
      return value;
    }
    return '';
  }

  /**
   * Get a detailed description of the label
   * @param element
   */
  getDescription(element: URI): string {
    const contributions = this.findContribution(element);
    for (const contribution of contributions) {
      const value =
        contribution.getDescription && contribution.getDescription(element);
      if (value === undefined) {
        continue;
      }
      return value;
    }
    return '';
  }

  protected affects(element: URI, event: LabelChangeEvent): boolean {
    if (event.affects(element)) {
      return true;
    }
    for (const contribution of this.findContribution(element)) {
      if (contribution.affects && contribution.affects(element, event as any)) {
        return true;
      }
    }
    return false;
  }

  protected findContribution(element: URI): LabelHandler[] {
    const prioritized = prioritizeAllSync(
      this.contributionProvider.getContributions(),
      contrib => contrib.canHandle(element),
    );
    return prioritized.map(c => c.value);
  }

  /**
   * Triggered after label change
   */
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment, @typescript-eslint/prefer-ts-expect-error
  // @ts-ignore
  get onChange(): Event<LabelChangeEvent> {
    return this.onChangeEmitter.event;
  }
}
