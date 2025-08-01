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

import { getQueryFromTemplate } from '../../src/utils/shortcut-query';

describe('getQueryFromTemplate', () => {
  it('should replace placeholders with corresponding values', () => {
    const templateQuery = 'Hello, {{name}}!';
    const values = { name: 'John' };
    const result = getQueryFromTemplate(templateQuery, values);
    expect(result).to.equal('Hello, John!');
  });

  it('should handle multiple placeholders', () => {
    const templateQuery = '{{greeting}}, {{name}}!';
    const values = { greeting: 'Hi', name: 'John' };
    const result = getQueryFromTemplate(templateQuery, values);
    expect(result).to.equal('Hi, John!');
  });

  it('should leave unreplaced placeholders intact', () => {
    const templateQuery = 'Hello, {{name}}!';
    const values = { greeting: 'Hi' };
    const result = getQueryFromTemplate(templateQuery, values);
    expect(result).to.equal('Hello, {{name}}!');
  });

  it('should handle empty values object', () => {
    const templateQuery = 'Hello, {{name}}!';
    const values = {};
    const result = getQueryFromTemplate(templateQuery, values);
    expect(result).to.equal('Hello, {{name}}!');
  });

  it('should handle empty template string', () => {
    const templateQuery = '';
    const values = { name: 'John' };
    const result = getQueryFromTemplate(templateQuery, values);
    expect(result).to.equal('');
  });
});
