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

import { render, screen, within } from '@testing-library/react';

import '@testing-library/jest-dom';
import { RerankTips } from '../../src/components/setting-tips/rerank-tips';

// Mock I18n.t function
vi.mock('@coze-arch/i18n', () => ({
  I18n: {
    t: (key: string, params?: { index?: string }) => {
      if (params?.index) {
        return `${key}-${params.index}`;
      }
      return key;
    },
  },
}));

describe('RerankTips', () => {
  it('renders headline correctly', () => {
    render(<RerankTips />);
    expect(screen.getByText('kl_write_034')).toBeInTheDocument();
  });

  it('renders case block labels correctly', () => {
    render(<RerankTips />);
    expect(screen.getByText('kl_write_046')).toBeInTheDocument();
    expect(screen.getByText('kl_write_047')).toBeInTheDocument();
  });

  it('renders first case block content correctly', () => {
    render(<RerankTips />);

    // Check if all labels and content in first block are rendered
    const firstBlock = screen.getAllByRole('article')[0];
    expect(firstBlock).toBeInTheDocument();

    // Check labels and content within the first block
    within(firstBlock).getByText('kl_write_041-A');
    within(firstBlock).getByText('kl_write_042');
    within(firstBlock).getByText('kl_write_041-B');
    within(firstBlock).getByText('kl_write_043');
    within(firstBlock).getByText('kl_write_041-C');
    within(firstBlock).getByText('kl_write_044');
    within(firstBlock).getByText('kl_write_041-D');
    within(firstBlock).getByText('kl_write_045');
  });

  it('renders second case block content correctly', () => {
    render(<RerankTips />);

    // Second block has the same content but in different order
    expect(screen.getAllByText('kl_write_041-A')).toHaveLength(2);
    expect(screen.getAllByText('kl_write_042')).toHaveLength(2);
    expect(screen.getAllByText('kl_write_041-B')).toHaveLength(2);
    expect(screen.getAllByText('kl_write_043')).toHaveLength(2);
    expect(screen.getAllByText('kl_write_041-C')).toHaveLength(2);
    expect(screen.getAllByText('kl_write_044')).toHaveLength(2);
    expect(screen.getAllByText('kl_write_041-D')).toHaveLength(2);
    expect(screen.getAllByText('kl_write_045')).toHaveLength(2);
  });

  it('renders correct number of case blocks', () => {
    render(<RerankTips />);
    const caseBlocks = screen.getAllByRole('article');
    expect(caseBlocks).toHaveLength(2);
  });
});
