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

import React, { useState } from 'react';

import classNames from 'classnames';

import PngDemo from '../assets/rspack.png';
import SVGDemo, { ReactComponent as SVGComponent } from '../assets/react.svg';

import s from './index.module.less';

export function DemoComponent(props: { name: string }): JSX.Element {
  const [foo] = useState('hello world');
  const { name } = props;
  return (
    // Font-bold from taiwindcss
    // It is recommended to use taiwindcss first.
    <div className={classNames(s.foo, 'font-bold')}>
      {foo} {name}!
      <div>
        <div>
          SVG: <img src={SVGDemo} />
        </div>
        <div>
          SVG Icon: <SVGComponent />
        </div>
        <div>
          PNG: <img src={PngDemo} width={100} />
        </div>
      </div>
    </div>
  );
}
