import '@testing-library/jest-dom';

import { afterEach, beforeEach, describe, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import { IconCozClockFill } from '@/components/icon';
import { Button } from '@/components/button';
import { LocaleProviderContainer } from '@/__tests__/locale-provider-containner';

import type { RequiredToastType } from '../toast-types';
import { Toast } from '..';

describe('Toast', () => {
  // 常量定义
  const TOAST_TYPES = ['info', 'success', 'warning', 'error'] as const;
  const ICON_CLASS_MAP: Record<RequiredToastType, string> = {
    info: 'fill-brand-6',
    success: 'fill-green-6',
    warning: 'fill-yellow-6',
    error: 'fill-red-6',
    default: '',
  };

  // 辅助函数
  const createToast = async (content: string, options = {}) => {
    render(
      <LocaleProviderContainer>
        <Button
          onClick={() =>
            Toast.info({
              content,
              showClose: false,
              direction: 'ltr',
              ...options,
            })
          }
        >
          Toast
        </Button>
      </LocaleProviderContainer>,
    );
    const button = await screen.findByText('Toast');
    fireEvent.click(button);
  };

  // 每个测试后清理
  afterEach(() => {
    cleanup();
  });

  describe('基础功能', () => {
    it('应该正确渲染内容', async () => {
      const content = 'Hi, Toast!';
      await createToast(content);

      const toastElements = await screen.findAllByText(content);
      expect(toastElements).toHaveLength(1);

      const toastContainer = toastElements[0].closest('.coz-toast');
      expect(toastContainer).toBeInTheDocument();
    });

    it('应该支持自定义图标', async () => {
      const content = 'Toast with icon';
      const customIcon = <IconCozClockFill className="coz-fg-color-brand" />;

      await createToast(content, { icon: customIcon });

      const toastContent = await screen.findByText(content);
      const iconElement = toastContent
        .closest('.semi-toast-content')
        ?.querySelector('.icon-icon');

      expect(iconElement).toBeInTheDocument();
    });
  });

  describe('不同类型的 Toast', () => {
    TOAST_TYPES.forEach(type => {
      it(`应该正确渲染 ${type} 类型`, async () => {
        const content = `${type}!`;
        render(
          <Button
            onClick={() =>
              Toast[type]({
                content,
                showClose: false,
                direction: 'ltr',
              })
            }
          >
            Toast
          </Button>,
        );

        const button = await screen.findByText('Toast');
        fireEvent.click(button);

        const toastContent = await screen.findByText(content);
        const toastContainer = toastContent.closest(`.coz-toast-${type}`);
        expect(toastContainer).toBeInTheDocument();
      });
    });
  });

  describe('图标功能', () => {
    it('应该正确渲染自定义图标', async () => {
      const content = 'Custom Icon Toast';
      const customIcon = <IconCozClockFill data-testid="custom-icon" />;

      await createToast(content, { icon: customIcon });

      const iconElement = await screen.findByTestId('custom-icon');
      expect(iconElement).toBeInTheDocument();
    });

    it('应该为不同类型渲染正确的默认图标', async () => {
      for (const type of TOAST_TYPES) {
        render(
          <Button
            onClick={() =>
              Toast[type]({
                content: `${type} toast`,
              })
            }
          >
            {`${type}Toast`}
          </Button>,
        );

        const button = await screen.findByText(`${type}Toast`);
        fireEvent.click(button);

        const toastContent = await screen.findByText(`${type} toast`);
        const iconElement = toastContent
          .closest('.semi-toast-content')
          ?.querySelector('svg');

        expect(iconElement).toHaveClass(ICON_CLASS_MAP[type]);
        cleanup();
      }
    });

    it('默认类型不应该渲染图标', async () => {
      render(
        <Button
          onClick={() =>
            Toast.create({
              content: 'Default Toast',
              type: 'default',
            })
          }
        >
          DefaultToast
        </Button>,
      );

      const button = await screen.findByText('DefaultToast');
      fireEvent.click(button);

      const toastContent = await screen.findByText('Default Toast');
      const iconElement = toastContent
        .closest('.coz-toast')
        ?.querySelector('.semi-icon');

      expect(iconElement).not.toBeInTheDocument();
    });
  });

  describe('动态更新功能', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('应该能通过 ID 更新 Toast 内容', () => {
      const id = 'toastId';
      render(
        <Button
          onClick={() => {
            Toast.info({ content: 'Update Content By Id', id });
            setTimeout(() => {
              Toast.success({ content: 'Content Updated', id });
            }, 2000);
          }}
        >
          UpdateById
        </Button>,
      );

      const button = screen.getByText('UpdateById');
      fireEvent.click(button);

      expect(screen.getByText('Update Content By Id')).toBeInTheDocument();

      vi.advanceTimersByTime(2000);

      expect(screen.getByText('Content Updated')).toBeInTheDocument();
    });
  });

  describe('参数处理', () => {
    it('应该支持字符串和对象两种参数形式', async () => {
      const stringContent = '字符串内容提示';
      const objectContent = '对象内容提示';

      // 测试字符串形式
      render(
        <Button onClick={() => Toast.info(stringContent)}>String Toast</Button>,
      );
      const stringButton = screen.getByText('String Toast');
      fireEvent.click(stringButton);
      expect(await screen.findByText(stringContent)).toBeInTheDocument();

      // 测试对象形式
      render(
        <Button
          onClick={() =>
            Toast.info({
              content: objectContent,
              duration: 3000,
            })
          }
        >
          Object Toast
        </Button>,
      );
      const objectButton = screen.getByText('Object Toast');
      fireEvent.click(objectButton);
      expect(await screen.findByText(objectContent)).toBeInTheDocument();
    });
  });
});
