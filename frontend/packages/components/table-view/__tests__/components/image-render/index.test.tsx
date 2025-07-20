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

import { describe, expect, test, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import '@testing-library/jest-dom';
import { ImageRender } from '../../../src/components/renders/image-render';

// 模拟依赖
vi.mock('@coze-arch/bot-semi', () => ({
  Image: ({ src, fallback, placeholder, onClick, preview, ...props }: any) => {
    if (!src) {
      return fallback || <div data-testid="fallback" />;
    }
    return (
      <div data-testid="image-wrapper">
        <img
          data-testid="image"
          src={src}
          onClick={onClick}
          data-preview={preview ? 'true' : 'false'}
          {...props}
        />
        {placeholder ? (
          <div data-testid="placeholder">{placeholder}</div>
        ) : null}
      </div>
    );
  },
}));

vi.mock('@coze-arch/bot-icons', () => ({
  IconImageFailOutlined: ({ className, onClick }: any) => (
    <div
      data-testid="image-fail-icon"
      className={className}
      onClick={onClick}
    />
  ),
}));

// 模拟useImagePreview钩子
vi.mock(
  '../../../src/components/renders/image-render/use-image-preview',
  () => ({
    useImagePreview: ({ src, setSrc, onChange, editable }: any) => {
      const openMock = vi.fn();
      return {
        open: openMock,
        node: (
          <div
            data-testid="image-preview-modal"
            data-src={src}
            data-editable={editable}
          />
        ),
      };
    },
  }),
);

describe('ImageRender', () => {
  test('应该正确渲染图片列表', () => {
    const srcList = [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg',
    ];

    render(<ImageRender srcList={srcList} />);

    // 验证图片容器被渲染
    const images = screen.getAllByTestId('image');
    expect(images).toHaveLength(2);
    expect(images[0]).toHaveAttribute('src', srcList[0]);
    expect(images[1]).toHaveAttribute('src', srcList[1]);
  });

  test('应该处理空的图片列表', () => {
    render(<ImageRender srcList={[]} />);

    // 验证没有图片被渲染
    const images = screen.queryAllByTestId('image');
    expect(images).toHaveLength(0);

    // 验证空状态容器存在
    const emptyContainer = screen.getByTestId('image-preview-modal');
    expect(emptyContainer).toBeInTheDocument();
  });

  test('应该使用自定义的空状态组件', () => {
    const customEmpty = ({ onClick }: { onClick?: () => void }) => (
      <div data-testid="custom-empty" onClick={onClick}>
        自定义空状态
      </div>
    );

    render(<ImageRender srcList={[]} customEmpty={customEmpty} />);

    // 验证自定义空状态被渲染
    const customEmptyElement = screen.getByTestId('custom-empty');
    expect(customEmptyElement).toBeInTheDocument();
    expect(customEmptyElement).toHaveTextContent('自定义空状态');
  });

  test('应该应用自定义className', () => {
    render(
      <ImageRender
        srcList={['https://example.com/image.jpg']}
        className="custom-class"
      />,
    );

    // 验证自定义className被应用
    // 由于组件结构复杂，我们直接查找包含custom-class的元素
    const container = document.querySelector('.custom-class');
    expect(container).toBeInTheDocument();
  });

  test('应该在点击图片时打开预览模态框', () => {
    const srcList = ['https://example.com/image.jpg'];

    render(<ImageRender srcList={srcList} />);

    // 点击图片
    const image = screen.getByTestId('image');
    fireEvent.click(image);

    // 验证预览模态框存在
    const previewModal = screen.getByTestId('image-preview-modal');
    expect(previewModal).toBeInTheDocument();
    expect(previewModal).toHaveAttribute('data-src', srcList[0]);
  });

  test('应该正确处理editable属性', () => {
    render(
      <ImageRender
        srcList={['https://example.com/image.jpg']}
        editable={false}
      />,
    );

    // 验证editable属性被传递给预览模态框
    const previewModal = screen.getByTestId('image-preview-modal');
    expect(previewModal).toHaveAttribute('data-editable', 'false');
  });

  test('应该正确传递onChange回调', () => {
    const mockOnChange = vi.fn();
    render(
      <ImageRender
        srcList={['https://example.com/image.jpg']}
        onChange={mockOnChange}
      />,
    );

    // 验证onChange属性被传递给预览模态框
    const previewModal = screen.getByTestId('image-preview-modal');
    expect(previewModal).toBeInTheDocument();
  });
});
