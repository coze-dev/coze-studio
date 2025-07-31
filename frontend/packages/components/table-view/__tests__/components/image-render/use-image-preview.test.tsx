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
import { useImagePreview } from '../../../src/components/renders/image-render/use-image-preview';

// simulated dependency
vi.mock('@coze-arch/coze-design', () => ({
  Upload: function Upload({
    children,
    onChange,
    customRequest,
    disabled,
  }: any) {
    return (
      <div
        data-testid="upload-component"
        data-disabled={disabled ? 'true' : 'false'}
      >
        <button
          data-testid="upload-button"
          onClick={() => {
            const fileItem = {
              currentFile: {
                fileInstance: { size: 1024 },
                name: 'test.jpg',
                url: 'http://test-url.com/image.jpg',
              },
            };
            onChange?.(fileItem);
            if (customRequest) {
              customRequest({
                onSuccess: vi.fn(),
                onProgress: vi.fn(),
                file: fileItem.currentFile,
              });
            }
          }}
        >
          上传
        </button>
        {children}
      </div>
    );
  },
  Input: function Input({ value, onChange, disabled }: any) {
    return (
      <input
        data-testid="image-url-input"
        value={value}
        onChange={e => onChange?.(e.target.value)}
        disabled={disabled}
      />
    );
  },
  Image: function Image({ src, preview, fallback, children }: any) {
    return (
      <div data-testid="image-component">
        <img
          data-testid="image"
          src={src}
          data-preview={preview ? 'true' : 'false'}
        />
        {children}
      </div>
    );
  },
  Typography: function Typography({ children, className }: any) {
    return (
      <div data-testid="typography" className={className}>
        {children}
      </div>
    );
  },
  Spin: function Spin({ spinning, tip, children, wrapperClassName }: any) {
    return (
      <div
        data-testid="spin-component"
        data-spinning={spinning ? 'true' : 'false'}
        className={wrapperClassName}
      >
        {tip ? <div data-testid="spin-tip">{tip}</div> : null}
        {children}
      </div>
    );
  },
  Toast: {
    error: vi.fn(),
  },
}));

vi.mock('@coze-arch/coze-design/icons', () => ({
  IconCozUpload: function IconCozUpload({ className }: any) {
    return <div data-testid="upload-icon" className={className} />;
  },
}));

vi.mock('@coze-arch/bot-icons', () => ({
  IconImageFailOutlined: function IconImageFailOutlined() {
    return <div data-testid="image-fail-icon" />;
  },
}));

vi.mock('@coze-arch/i18n', () => ({
  I18n: {
    t: (key: string) => `translated_${key}`,
  },
}));

vi.mock('@coze-arch/bot-api', () => ({
  DeveloperApi: {
    UploadFile: vi.fn().mockResolvedValue({
      data: {
        upload_uri: 'test-tos-key',
        upload_url: 'https://example.com/uploaded-image.jpg',
      },
    }),
  },
}));

vi.mock('@coze-data/utils', () => ({
  useDataModalWithCoze: function useDataModalWithCoze({
    width,
    title,
    onOk,
    onCancel,
  }: any) {
    return {
      open: vi.fn(),
      close: vi.fn(),
      modal: (content: React.ReactNode) => (
        <div data-testid="modal-wrapper" data-title={title} data-width={width}>
          {content}
          <button data-testid="modal-ok" onClick={onOk}>
            确认
          </button>
          <button data-testid="modal-cancel" onClick={onCancel}>
            取消
          </button>
        </div>
      ),
    };
  },
}));

vi.mock('../../../src/components/renders/image-render/utils', () => ({
  getBase64: vi.fn().mockResolvedValue('base64-encoded-string'),
  getFileExtension: vi.fn().mockReturnValue('jpg'),
  isValidSize: vi.fn().mockReturnValue(true),
}));

// Simulate CustomError
vi.mock('@coze-arch/bot-error', () => ({
  CustomError: class CustomError extends Error {
    constructor(event: string, message: string) {
      super(message);
      this.name = 'CustomError';
    }
  },
}));

describe('useImagePreview 基本功能测试', () => {
  test('测试图片URL输入框更新', () => {
    // Create a simple test component
    const TestComponent = () => {
      const [src, setSrc] = React.useState('https://example.com/image.jpg');
      const onChange = vi.fn();

      const { node } = useImagePreview({
        src,
        setSrc,
        onChange,
        editable: true,
      });

      return (
        <div>
          <div>当前图片URL: {src}</div>
          {node}
        </div>
      );
    };

    render(<TestComponent />);

    // Verify that the initial URL is displayed correctly
    const urlInput = screen.getByTestId('image-url-input');
    expect(urlInput).toHaveValue('https://example.com/image.jpg');

    // Modify URL
    fireEvent.change(urlInput, {
      target: { value: 'https://example.com/new-image.jpg' },
    });

    // Verify that the URL has been updated
    expect(
      screen.getByText('当前图片URL: https://example.com/new-image.jpg'),
    ).toBeInTheDocument();
  });

  test('测试确认按钮调用onChange', () => {
    const onChange = vi.fn();

    // Create a simple test component
    const TestComponent = () => {
      const [src, setSrc] = React.useState('https://example.com/image.jpg');

      const { node } = useImagePreview({
        src,
        setSrc,
        onChange,
        editable: true,
      });

      return <div>{node}</div>;
    };

    render(<TestComponent />);

    // Click the confirm button.
    const okButton = screen.getByTestId('modal-ok');
    fireEvent.click(okButton);

    // Verify that onChange is invoked
    expect(onChange).toHaveBeenCalledWith('https://example.com/image.jpg', '');
  });

  test('测试editable属性', () => {
    // Create a simple test component
    const TestComponent = () => {
      const [src, setSrc] = React.useState('https://example.com/image.jpg');
      const onChange = vi.fn();

      const { node } = useImagePreview({
        src,
        setSrc,
        onChange,
        editable: false,
      });

      return <div>{node}</div>;
    };

    render(<TestComponent />);

    // Verify text box is disabled
    const urlInput = screen.getByTestId('image-url-input');
    expect(urlInput).toBeDisabled();
  });
});
