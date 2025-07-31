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

import SuggestionItem from '../../src/components/contents/suggestion-content/components/suggestion-item/index';

export default {
  component: SuggestionItem,
  title: 'SuggestionItem',
};

const Template = args => <SuggestionItem {...args} />;

export const 测试SuggestionItem = Template.bind({});
const content = '建议1';

测试SuggestionItem.args = {
  content,
};
