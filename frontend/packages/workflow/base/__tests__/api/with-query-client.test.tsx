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

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { useQuery } from '@tanstack/react-query';

import {
  workflowQueryClient,
  withQueryClient,
} from '../../src/api/with-query-client';

describe('with-query-client.tsx', () => {
  beforeEach(() => {
    // Clean up the QueryClient cache
    workflowQueryClient.clear();
  });

  describe('workflowQueryClient', () => {
    it('should export a QueryClient instance', () => {
      expect(workflowQueryClient).toBeDefined();
      expect(workflowQueryClient.constructor.name).toBe('QueryClient');
    });

    it('should have default configuration', () => {
      const defaultOptions = workflowQueryClient.getDefaultOptions();
      expect(defaultOptions).toBeDefined();
    });

    it('should be able to manage queries', async () => {
      const queryKey = ['test'];
      const queryFn = vi.fn().mockResolvedValue('test data');

      const result = await workflowQueryClient.fetchQuery({
        queryKey,
        queryFn,
      });

      expect(result).toBe('test data');
      expect(queryFn).toHaveBeenCalled();
      expect(workflowQueryClient.getQueryData(queryKey)).toBe('test data');
    });
  });

  describe('withQueryClient', () => {
    it('should wrap component with QueryClientProvider', () => {
      const TestComponent = () => <div>Test Component</div>;
      const WrappedComponent = withQueryClient(TestComponent);

      const { container } = render(<WrappedComponent />);
      expect(container.innerHTML).toContain('Test Component');
    });

    it('should pass props to wrapped component', () => {
      const TestComponent = ({ text }: { text: string }) => <div>{text}</div>;
      const WrappedComponent = withQueryClient(TestComponent);

      const { container } = render(<WrappedComponent text="Hello" />);
      expect(container.innerHTML).toContain('Hello');
    });

    it('should provide QueryClient context to wrapped component', async () => {
      const queryKey = ['test'];
      const queryFn = vi.fn().mockResolvedValue('test data');

      const TestComponent = () => {
        const { data, isLoading } = useQuery({ queryKey, queryFn });
        if (isLoading) {
          return <div>Loading...</div>;
        }
        return <div>{data}</div>;
      };

      const WrappedComponent = withQueryClient(TestComponent);
      const { container } = render(<WrappedComponent />);

      // initial loading state
      expect(container.innerHTML).toContain('Loading...');

      // Wait for data loading to complete
      await waitFor(() => {
        expect(container.innerHTML).toContain('test data');
      });

      expect(queryFn).toHaveBeenCalledTimes(1);
    });

    it('should handle query errors gracefully', () => {
      const queryKey = ['test-error'];
      const queryFn = vi.fn().mockRejectedValue(new Error('Test error'));

      const TestComponent = () => {
        const { error, isError } = useQuery({ queryKey, queryFn });
        if (isError) {
          return <div>Error: {error.message}</div>;
        }
        return <div>Loading...</div>;
      };

      const WrappedComponent = withQueryClient(TestComponent);
      render(<WrappedComponent />);

      expect(queryFn).toHaveBeenCalledTimes(1);
    });

    it('should maintain component type and handle complex props', () => {
      interface ComplexProps {
        text: string;
        count: number;
        items: string[];
        onClick: () => void;
      }

      const TestComponent: React.FC<ComplexProps> = ({
        text,
        count,
        items,
        onClick,
      }) => (
        <div onClick={onClick}>
          <span>{text}</span>
          <span>{count}</span>
          <ul>
            {items.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      );

      const WrappedComponent = withQueryClient(TestComponent);
      const handleClick = vi.fn();

      const { container } = render(
        <WrappedComponent
          text="Complex Test"
          count={42}
          items={['a', 'b', 'c']}
          onClick={handleClick}
        />,
      );

      expect(container.innerHTML).toContain('Complex Test');
      expect(container.innerHTML).toContain('42');
      expect(container.innerHTML).toContain('<li>a</li>');
      expect(container.innerHTML).toContain('<li>b</li>');
      expect(container.innerHTML).toContain('<li>c</li>');
    });

    it('should work with nested queries', async () => {
      const parentQueryKey = ['parent'];
      const childQueryKey = ['child'];
      const parentQueryFn = vi.fn().mockResolvedValue('parent data');
      const childQueryFn = vi.fn().mockResolvedValue('child data');

      const ChildComponent = () => {
        const { data, isLoading } = useQuery({
          queryKey: childQueryKey,
          queryFn: childQueryFn,
        });
        if (isLoading) {
          return <div>Loading Child...</div>;
        }
        return <div className="child">{data}</div>;
      };

      const ParentComponent = () => {
        const { data, isLoading } = useQuery({
          queryKey: parentQueryKey,
          queryFn: parentQueryFn,
        });
        if (isLoading) {
          return <div>Loading Parent...</div>;
        }
        return (
          <div className="parent">
            {data}
            <ChildComponent />
          </div>
        );
      };

      const WrappedComponent = withQueryClient(ParentComponent);
      const { container } = render(<WrappedComponent />);

      // initial loading state
      expect(container.innerHTML).toContain('Loading Parent...');

      // Wait for all queries to complete
      await waitFor(() => {
        expect(container.innerHTML).toContain('parent data');
        expect(container.innerHTML).toContain('child data');
      });

      expect(parentQueryFn).toHaveBeenCalledTimes(1);
      expect(childQueryFn).toHaveBeenCalledTimes(1);
    });
  });
});
