import '@testing-library/jest-dom';

import { describe, it } from 'vitest';
import { fireEvent, render, screen, act } from '@testing-library/react';

import { Popconfirm } from '..';

const sleep = (ms: number) =>
  new Promise(r => {
    setTimeout(r, ms);
  });

describe('Popconfirm', () => {
  it('should render', () => {
    const { baseElement } = render(<Popconfirm defaultVisible>123</Popconfirm>);
    expect(baseElement.querySelectorAll('.coz-popconfirm').length).toEqual(1);
  });

  it('string content should has default className', () => {
    const { getByText } = render(
      <Popconfirm
        title="确定是否要保存此修改？"
        defaultVisible
        content="此修改将不可逆"
      >
        btn
      </Popconfirm>,
    );

    expect(getByText('此修改将不可逆')).toHaveClass('coz-common-content');
  });

  it('brand color should has color brand', () => {
    const { getByRole } = render(
      <Popconfirm
        title="确定是否要保存此修改？"
        defaultVisible
        content="此修改将不可逆"
        okButtonColor="brand"
        okText="brand"
      >
        btn
      </Popconfirm>,
    );
    expect(getByRole('button')).toHaveClass('coz-btn-brand');
  });

  it('red color should has color red', () => {
    const { getByRole } = render(
      <Popconfirm
        title="确定是否要保存此修改？"
        defaultVisible
        content="此修改将不可逆"
        okButtonColor="red"
        okText="brand"
      >
        btn
      </Popconfirm>,
    );
    expect(getByRole('button')).toHaveClass('coz-btn-red');
  });

  it('onConfirm  should be called', () => {
    const onConfirmFn = vi.fn();
    render(
      <Popconfirm
        title="确定是否要保存此修改？"
        defaultVisible
        content="此修改将不可逆"
        okButtonColor="red"
        okText="brand"
        onConfirm={onConfirmFn}
      >
        btn
      </Popconfirm>,
    );

    const okBtn = screen.getByRole('button');
    fireEvent.click(okBtn);

    expect(onConfirmFn).toBeCalled();
  });

  it('onVisibleChange should be called', async () => {
    const onVisibleChangeFn = vi.fn();
    const { getByText } = render(
      <Popconfirm
        title="确定是否要保存此修改？"
        content="此修改将不可逆"
        okButtonColor="red"
        okText="brand"
        onVisibleChange={onVisibleChangeFn}
      >
        btn
      </Popconfirm>,
    );

    fireEvent.click(getByText('btn'));

    await sleep(1000);
    expect(onVisibleChangeFn.mock.calls[0][0]).toBeTruthy();
  });

  it('trigger custom', () => {
    const { baseElement } = render(
      <Popconfirm
        title="确定是否要保存此修改？"
        defaultVisible
        content="此修改将不可逆"
        trigger="custom"
      >
        btn
      </Popconfirm>,
    );

    expect(baseElement.querySelectorAll('.coz-popconfirm').length).toEqual(0);
  });

  it('should handle async confirm with loading state', async () => {
    const onConfirmFn = vi
      .fn()
      .mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100)),
      );

    render(
      <Popconfirm
        title="确定是否要保存此修改？"
        defaultVisible
        content="此修改将不可逆"
        okText="确定"
        onConfirm={onConfirmFn}
      ></Popconfirm>,
    );

    const okBtn = document.querySelector('.coz-btn-brand');

    await act(() => {
      fireEvent.click(okBtn);
    });

    const loadingIcon = document.querySelector(
      '.coz-btn-brand .coz-btn-loading',
    );

    expect(loadingIcon).not.toBeNull();

    await act(async () => {
      await sleep(200);
    });

    expect(onConfirmFn).toHaveBeenCalled();
    expect(
      document.querySelector('.coz-btn-brand .coz-btn-loading'),
    ).toBeNull();
  });

  it('should handle async cancel with loading state', async () => {
    const onCancelFn = vi
      .fn()
      .mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100)),
      );

    render(
      <Popconfirm
        title="确定是否要保存此修改？"
        defaultVisible
        content="此修改将不可逆"
        cancelText="取消"
        onCancel={onCancelFn}
      ></Popconfirm>,
    );

    const cancelBtn = document.querySelector('.coz-btn-primary');
    expect(cancelBtn).not.toBeNull();

    await act(() => {
      fireEvent.click(cancelBtn);
    });

    const loadingIcon = document.querySelector(
      '.coz-btn-primary .coz-btn-loading',
    );

    expect(loadingIcon).not.toBeNull();

    await act(async () => {
      await sleep(150);
    });

    expect(onCancelFn).toHaveBeenCalled();
    expect(
      document.querySelector('.coz-btn-primary .coz-btn-loading'),
    ).toBeNull();
  });

  it('should handle confirm error', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const error = new Error('Confirm failed');
    const onConfirmFn = vi.fn().mockRejectedValue(error);

    const { getByRole } = render(
      <Popconfirm
        title="确定是否要保存此修改？"
        defaultVisible
        content="此修改将不可逆"
        okText="确定"
        onConfirm={onConfirmFn}
      >
        btn
      </Popconfirm>,
    );

    const okBtn = getByRole('button');
    fireEvent.click(okBtn);

    await sleep(100);
    expect(onConfirmFn).toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalledWith(error);
    expect(okBtn.querySelector('.coz-btn-loading')).toBeNull();

    consoleError.mockRestore();
  });

  it('should handle cancel error', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const error = new Error('Cancel failed');
    const onCancelFn = vi.fn().mockRejectedValue(error);

    const { getByText } = render(
      <Popconfirm
        title="确定是否要保存此修改？"
        defaultVisible
        content="此修改将不可逆"
        cancelText="取消"
        onCancel={onCancelFn}
      >
        btn
      </Popconfirm>,
    );

    const cancelBtn = getByText('取消');
    fireEvent.click(cancelBtn);

    await sleep(100);
    expect(onCancelFn).toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalledWith(error);
    expect(cancelBtn.querySelector('.coz-btn-loading')).toBeNull();

    consoleError.mockRestore();
  });
});
