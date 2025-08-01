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

import { render } from '@testing-library/react';

import { AvatarName } from '../src/avatar-name';

describe('AvatarName', () => {
  it('should one image and @username', () => {
    const wrapper = render(
      <AvatarName
        name="BotNickName"
        username="BotUserName"
        avatar="https://sf-coze-web-cdn.coze.com/obj/coze-web-sg/obric/coze/favicon.1970.png"
      />,
    );
    expect(wrapper.getAllByRole('img').length).toBe(1);
    expect(wrapper.getByText(/^@BotUserName/)).toBeInTheDocument();
  });

  it('should two image', () => {
    const wrapper = render(
      <AvatarName
        name="BotNickName"
        username="BotUserName"
        avatar="https://sf-coze-web-cdn.coze.com/obj/coze-web-sg/obric/coze/favicon.1970.png"
        label={{
          icon: 'https://sf-coze-web-cdn.coze.com/obj/coze-web-sg/obric/coze/favicon.1970.png',
          name: 'test',
        }}
      />,
    );
    expect(wrapper.getAllByRole('img').length).toBe(2);
  });
});
