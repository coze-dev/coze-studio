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

import { Component, type ReactNode } from 'react';

import { CDLocaleProvider } from '@coze-arch/coze-design/locales';

import { type Intl } from '../intl';
import { i18nContext, type I18nContext } from './context';

export { i18nContext, type I18nContext };

export interface I18nProviderProps {
  children?: ReactNode;
  i18n: Intl;
}

export class I18nProvider extends Component<I18nProviderProps> {
  constructor(props: I18nProviderProps) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      children,
      i18n = {
        t: (k: string) => k,
      },
    } = this.props;
    return (
      <CDLocaleProvider i18n={i18n}>
        <i18nContext.Provider value={{ i18n: i18n as Intl }}>
          {children}
        </i18nContext.Provider>
      </CDLocaleProvider>
    );
  }
}
