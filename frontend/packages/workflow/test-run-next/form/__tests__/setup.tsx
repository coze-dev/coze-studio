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

import '@testing-library/jest-dom/vitest';
vi.mock('@coze-arch/i18n', () => ({
  I18n: {
    t: vi.fn(),
  },
}));
vi.mock('@coze-arch/coze-design', () => ({
  Typography: {
    Text: vi.fn(props => <span>{props.children}</span>),
  },
  Tag: vi.fn(props => <span>{props.children}</span>),
  Tooltip: vi.fn(props => (
    <span data-content={props.content}>{props.children}</span>
  )),
  Collapsible: vi.fn(props =>
    props.isOpen ? <span>{props.children}</span> : null,
  ),
}));
vi.mock('ahooks', () => ({
  useInViewport: vi.fn(() => [true]),
}));

vi.stubGlobal('IS_DEV_MODE', true);
vi.stubGlobal('IS_OVERSEA', false);
vi.stubGlobal('IS_BOE', false);
vi.stubGlobal('REGION', 'cn');
