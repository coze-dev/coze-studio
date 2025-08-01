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

import React from 'react';

import { render, screen } from '@testing-library/react';

import '@testing-library/jest-dom';
import { RewriteTips } from '../../src/components/setting-tips/rewrite-tips';

// Mock I18n.t function
vi.mock('@coze-arch/i18n', () => ({
  I18n: {
    t: (key: string) => key,
  },
}));

describe('RewriteTips', () => {
  it('renders headline correctly', () => {
    render(<RewriteTips />);
    expect(screen.getByText('kl_write_034')).toBeInTheDocument();
  });

  it('renders all case blocks with correct content', () => {
    render(<RewriteTips />);

    // Check if all labels are rendered
    expect(screen.getByText('kl_write_035')).toBeInTheDocument();
    expect(screen.getByText('kl_write_037')).toBeInTheDocument();
    expect(screen.getByText('kl_write_039')).toBeInTheDocument();

    // Check if all descriptions are rendered
    expect(screen.getByText('kl_write_036')).toBeInTheDocument();
    expect(screen.getByText('kl_write_038')).toBeInTheDocument();
    expect(screen.getByText('kl_write_040')).toBeInTheDocument();
  });

  it('renders correct number of case blocks', () => {
    render(<RewriteTips />);
    const caseBlocks = screen.getAllByRole('article'); // Assuming CaseBlock has role="article"
    expect(caseBlocks).toHaveLength(3);
  });
});
