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

import { setMobileBody, setPCBody } from '../src/viewport';

describe('viewport', () => {
  it('#setMobileBody', () => {
    setMobileBody();
    const bodyStyle = document?.body?.style;
    const htmlStyle = document?.getElementsByTagName('html')?.[0]?.style;
    expect(bodyStyle.minWidth).toEqual('0');
    expect(bodyStyle.minHeight).toEqual('0');
    expect(htmlStyle.minWidth).toEqual('0');
    expect(htmlStyle.minHeight).toEqual('0');
  });

  it('#setPCBody', () => {
    setPCBody();
    const bodyStyle = document?.body?.style;
    const htmlStyle = document?.getElementsByTagName('html')?.[0]?.style;
    expect(bodyStyle.minWidth).toEqual('1200px');
    expect(bodyStyle.minHeight).toEqual('600px');
    expect(htmlStyle.minWidth).toEqual('1200px');
    expect(htmlStyle.minHeight).toEqual('600px');
  });
});
