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

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import '@testing-library/jest-dom';
import copy from 'copy-to-clipboard';
import { getSlardarInstance } from '@coze-arch/logger';
import { I18n } from '@coze-arch/i18n';
import { Toast } from '@coze-arch/coze-design';

import { withSlardarIdButton } from '../src/with-slardar-id-button';

const mockSlardarInstance = {
  config: vi.fn(() => ({ sessionId: 'test-session-id' })),
};

vi.mock('@coze-arch/logger', () => ({
  getSlardarInstance: vi.fn(() => mockSlardarInstance),
}));

// simulated dependency
vi.mock('copy-to-clipboard', () => ({
  default: vi.fn(),
}));

vi.mock('@coze-arch/coze-design', () => ({
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Button: ({ children, onClick, className, size, color }: any) => (
    <button
      onClick={onClick}
      className={className}
      data-size={size}
      data-color={color}
      data-testid="button"
    >
      {children}
    </button>
  ),
  Toast: {
    success: vi.fn(),
  },
}));

vi.mock('@coze-arch/i18n', () => ({
  I18n: {
    t: vi.fn(key => {
      if (key === 'copy_session_id') {
        return '复制会话ID';
      }
      if (key === 'error_id_copy_success') {
        return '复制成功';
      }
      return key;
    }),
  },
}));

describe('withSlardarIdButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('应该正确渲染传入的节点和按钮', () => {
    const testNode = <div data-testid="test-node">测试节点</div>;

    render(withSlardarIdButton(testNode));

    expect(screen.getByTestId('test-node')).toBeInTheDocument();
    expect(screen.getByTestId('test-node')).toHaveTextContent('测试节点');
    expect(screen.getByTestId('button')).toBeInTheDocument();
    expect(screen.getByTestId('button')).toHaveTextContent('复制会话ID');
  });

  it('按钮应该有正确的属性', () => {
    render(withSlardarIdButton(<div>测试</div>));

    const button = screen.getByTestId('button');
    expect(button).toHaveAttribute('data-size', 'small');
    expect(button).toHaveAttribute('data-color', 'primary');
    expect(button).toHaveAttribute('class', 'ml-[8px]');
  });

  it('点击按钮时应该复制会话ID并显示成功提示', () => {
    render(withSlardarIdButton(<div>测试</div>));

    const button = screen.getByTestId('button');
    fireEvent.click(button);

    // Verify that slardar.config is called
    expect(getSlardarInstance).toHaveBeenCalled();
    expect(mockSlardarInstance.config).toHaveBeenCalled();

    // Verify that copy is called and that the parameters are correct
    expect(copy).toHaveBeenCalledWith('test-session-id');

    // Verify that Toast.success is called and the parameters are correct
    expect(Toast.success).toHaveBeenCalledWith('复制成功');
  });

  it('当 sessionId 为空时应该复制空字符串', () => {
    // Emulate sessionId to undefined
    vi.mocked(mockSlardarInstance.config).mockReturnValueOnce({
      sessionId: undefined,
    });

    render(withSlardarIdButton(<div>测试</div>));

    const button = screen.getByTestId('button');
    fireEvent.click(button);

    expect(copy).toHaveBeenCalledWith('');
  });

  it('应该使用正确的 i18n 键获取文本', () => {
    render(withSlardarIdButton(<div>测试</div>));

    fireEvent.click(screen.getByTestId('button'));

    expect(I18n.t).toHaveBeenCalledWith('copy_session_id');
    expect(I18n.t).toHaveBeenCalledWith('error_id_copy_success');
  });
});
