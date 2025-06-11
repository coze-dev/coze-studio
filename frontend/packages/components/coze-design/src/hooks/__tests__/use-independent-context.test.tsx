import React from 'react';

import { render, screen } from '@testing-library/react';

import '@testing-library/jest-dom';
import { createIndependentContext } from '../use-independent-context';

// 定义一个测试上下文类型
interface TestContextValue {
  message: string;
}

describe('createIndependentContext', () => {
  it('应该创建一个上下文提供者和消费者钩子', () => {
    // 创建独立上下文
    const [Provider, useTestContext] =
      createIndependentContext<TestContextValue>();

    // 验证返回的是一个数组，包含两个函数
    expect(Provider).toBeInstanceOf(Function);
    expect(useTestContext).toBeInstanceOf(Function);
  });

  it('应该通过提供者传递值并通过钩子消费值', () => {
    // 创建独立上下文
    const [Provider, useTestContext] =
      createIndependentContext<TestContextValue>();

    // 创建一个消费组件
    const ConsumerComponent = () => {
      const context = useTestContext();
      return <div data-testid="message">{context.message}</div>;
    };

    // 创建一个包含提供者和消费者的组件
    const TestComponent = () => (
      <Provider value={{ message: 'Hello, World!' }}>
        <ConsumerComponent />
      </Provider>
    );

    // 渲染测试组件
    render(<TestComponent />);

    // 验证消费者能够访问上下文值
    expect(screen.getByTestId('message')).toHaveTextContent('Hello, World!');
  });

  it('应该支持嵌套的提供者', () => {
    // 创建独立上下文
    const [Provider, useTestContext] =
      createIndependentContext<TestContextValue>();

    // 创建一个消费组件
    const ConsumerComponent = () => {
      const context = useTestContext();
      return <div data-testid="message">{context.message}</div>;
    };

    // 创建一个包含嵌套提供者的组件
    const TestComponent = () => (
      <Provider value={{ message: 'Outer Context' }}>
        <div data-testid="outer">
          <ConsumerComponent />
          <Provider value={{ message: 'Inner Context' }}>
            <div data-testid="inner">
              <ConsumerComponent />
            </div>
          </Provider>
        </div>
      </Provider>
    );

    // 渲染测试组件
    render(<TestComponent />);

    // 验证外部和内部消费者能够访问各自的上下文值
    expect(
      screen.getByTestId('outer').querySelector('[data-testid="message"]'),
    ).toHaveTextContent('Outer Context');
    expect(
      screen.getByTestId('inner').querySelector('[data-testid="message"]'),
    ).toHaveTextContent('Inner Context');
  });

  it('应该在不同的上下文实例之间保持独立', () => {
    // 创建两个独立的上下文
    const [Provider1, useTestContext1] =
      createIndependentContext<TestContextValue>();
    const [Provider2, useTestContext2] =
      createIndependentContext<TestContextValue>();

    // 创建两个不同的消费组件
    const ConsumerComponent1 = () => {
      const context = useTestContext1();
      return <div data-testid="message1">{context.message}</div>;
    };

    const ConsumerComponent2 = () => {
      const context = useTestContext2();
      return <div data-testid="message2">{context.message}</div>;
    };

    // 创建一个包含两个提供者的组件
    const TestComponent = () => (
      <Provider1 value={{ message: 'Context 1' }}>
        <Provider2 value={{ message: 'Context 2' }}>
          <ConsumerComponent1 />
          <ConsumerComponent2 />
        </Provider2>
      </Provider1>
    );

    // 渲染测试组件
    render(<TestComponent />);

    // 验证两个消费者能够访问各自的上下文值
    expect(screen.getByTestId('message1')).toHaveTextContent('Context 1');
    expect(screen.getByTestId('message2')).toHaveTextContent('Context 2');
  });
});
