import React from 'react';

import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import '@testing-library/jest-dom';
import { Badge, ViewGroup, EnhancedView, View } from '../index';

// 模拟 lodash-es
vi.mock('lodash-es', () => ({
  isString: (value: any) => typeof value === 'string',
  isBoolean: (value: any) => typeof value === 'boolean',
  isNumber: (value: any) => typeof value === 'number',
}));

describe('Badge 组件', () => {
  it('应该正确渲染子元素', () => {
    render(<Badge>测试内容</Badge>);

    // 检查子元素是否正确渲染
    expect(screen.getByText('测试内容')).toBeInTheDocument();

    // 检查 Badge 内部的 div 是否有正确的类名
    const badgeDiv = screen.getByText('测试内容');
    expect(badgeDiv).toHaveClass('rounded');
    expect(badgeDiv).toHaveClass('px-1');
    expect(badgeDiv).toHaveClass('text-sm');
    expect(badgeDiv).toHaveClass('bg-yellow-1');
    expect(badgeDiv).toHaveClass('text-yellow-7');
    expect(badgeDiv).toHaveClass('border');
    expect(badgeDiv).toHaveClass('border-dashed');
    expect(badgeDiv).toHaveClass('border-red-2');
  });

  it('应该包含引号标记', () => {
    const { container } = render(<Badge>测试内容</Badge>);

    // 检查引号标记是否存在
    expect(container.textContent).toContain('="');
    expect(container.textContent).toContain('"');
  });

  it('应该能够渲染复杂内容', () => {
    render(
      <Badge>
        <span data-testid="complex-content">复杂内容</span>
      </Badge>,
    );

    // 检查复杂内容是否正确渲染
    expect(screen.getByTestId('complex-content')).toBeInTheDocument();
    expect(screen.getByText('复杂内容')).toBeInTheDocument();
  });
});

describe('ViewGroup 组件', () => {
  it('应该使用默认的列布局渲染子元素', () => {
    render(
      <ViewGroup>
        <div data-testid="child-1">子元素1</div>
        <div data-testid="child-2">子元素2</div>
      </ViewGroup>,
    );

    // 检查子元素是否正确渲染
    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();

    // 检查父容器是否有正确的类名
    const container = screen.getByTestId('child-1').parentElement;
    expect(container).toHaveClass('flex');
    expect(container).toHaveClass('justify-evenly');
    expect(container).toHaveClass('flex-col');
    expect(container).toHaveClass('space-y-5');
  });

  it('应该使用行布局渲染子元素', () => {
    render(
      <ViewGroup direction="row">
        <div data-testid="child-1">子元素1</div>
        <div data-testid="child-2">子元素2</div>
      </ViewGroup>,
    );

    // 检查子元素是否正确渲染
    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();

    // 检查父容器是否有正确的类名
    const container = screen.getByTestId('child-1').parentElement;
    expect(container).toHaveClass('flex');
    expect(container).toHaveClass('justify-evenly');
    expect(container).toHaveClass('flex-row');
    expect(container).toHaveClass('space-x-5');
  });

  it('应该能够渲染多个子元素', () => {
    render(
      <ViewGroup>
        <div data-testid="child-1">子元素1</div>
        <div data-testid="child-2">子元素2</div>
        <div data-testid="child-3">子元素3</div>
        <div data-testid="child-4">子元素4</div>
      </ViewGroup>,
    );

    // 检查所有子元素是否正确渲染
    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
    expect(screen.getByTestId('child-3')).toBeInTheDocument();
    expect(screen.getByTestId('child-4')).toBeInTheDocument();
  });
});

describe('EnhancedView 组件', () => {
  it('应该使用默认属性渲染', () => {
    render(
      <EnhancedView>
        <div data-testid="child">子元素</div>
      </EnhancedView>,
    );

    // 检查子元素是否正确渲染
    expect(screen.getByTestId('child')).toBeInTheDocument();

    // 检查默认属性是否正确应用
    expect(screen.getByText('Default')).toBeInTheDocument();
  });

  it('应该使用自定义属性渲染', () => {
    render(
      <EnhancedView prop="自定义属性" value="自定义值">
        <div data-testid="child">子元素</div>
      </EnhancedView>,
    );

    // 检查子元素是否正确渲染
    expect(screen.getByTestId('child')).toBeInTheDocument();

    // 检查自定义属性是否正确应用
    expect(screen.getByText('自定义属性')).toBeInTheDocument();
    expect(screen.getByText('自定义值')).toBeInTheDocument();
  });

  it('应该显示子元素的属性', () => {
    render(
      <EnhancedView>
        <div
          data-testid="child"
          data-custom-prop="测试属性"
          data-bool-prop="true"
          data-num-prop="42"
        >
          子元素
        </div>
      </EnhancedView>,
    );

    // 检查子元素是否正确渲染
    expect(screen.getByTestId('child')).toBeInTheDocument();

    // 检查子元素的属性是否正确显示
    expect(screen.getByText('data-testid')).toBeInTheDocument();
    expect(screen.getByText('child')).toBeInTheDocument();
    expect(screen.getByText('data-custom-prop')).toBeInTheDocument();
    expect(screen.getByText('测试属性')).toBeInTheDocument();
    expect(screen.getByText('data-bool-prop')).toBeInTheDocument();
    expect(screen.getByText('true')).toBeInTheDocument();
    expect(screen.getByText('data-num-prop')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('当没有子元素属性时应该显示属性区域', () => {
    render(
      <EnhancedView>
        <div data-testid="child">子元素</div>
      </EnhancedView>,
    );

    // 检查属性区域是否显示
    expect(screen.getByText('Props')).toBeInTheDocument();
    expect(screen.getByText('data-testid')).toBeInTheDocument();
    expect(screen.getByText('child')).toBeInTheDocument();
  });

  it('应该正确渲染带有复杂子元素的视图', () => {
    render(
      <EnhancedView prop="复杂视图" value="测试">
        <div data-testid="complex-child">
          <span>内部元素1</span>
          <span>内部元素2</span>
        </div>
      </EnhancedView>,
    );

    // 检查复杂子元素是否正确渲染
    expect(screen.getByTestId('complex-child')).toBeInTheDocument();
    expect(screen.getByText('内部元素1')).toBeInTheDocument();
    expect(screen.getByText('内部元素2')).toBeInTheDocument();

    // 检查自定义属性是否正确应用
    expect(screen.getByText('复杂视图')).toBeInTheDocument();
    expect(screen.getByText('测试')).toBeInTheDocument();
  });
});

describe('View 组件', () => {
  it('应该使用默认属性渲染', () => {
    render(
      <View prop="" value="">
        <div data-testid="child">子元素</div>
      </View>,
    );

    // 检查子元素是否正确渲染
    expect(screen.getByTestId('child')).toBeInTheDocument();

    // 检查容器类名是否正确
    const container = screen.getByTestId('child').closest('.coz-view');
    expect(container).toHaveClass('flex');
    expect(container).toHaveClass('flex-col');
    expect(container).toHaveClass('border');
    expect(container).toHaveClass('border-solid');
    expect(container).toHaveClass('coz-stroke-primary');
    expect(container).toHaveClass('divide-y');
    expect(container).toHaveClass('divide-background-6');
    expect(container).toHaveClass('rounded-lg');
    expect(container).toHaveClass('shadow-sm');
    expect(container).toHaveClass('h-auto');
  });

  it('应该使用自定义属性渲染', () => {
    render(
      <View
        prop="自定义属性"
        value="自定义值"
        direction="column"
        justify="start"
      >
        <div data-testid="child">子元素</div>
      </View>,
    );

    // 检查子元素是否正确渲染
    expect(screen.getByTestId('child')).toBeInTheDocument();

    // 检查自定义属性是否正确应用
    expect(screen.getByText('自定义属性')).toBeInTheDocument();
    expect(screen.getByText('自定义值')).toBeInTheDocument();

    // 检查内容容器的样式是否正确
    const contentContainer = screen.getByTestId('child').parentElement;
    expect(contentContainer).toHaveStyle({ flexDirection: 'column' });
    expect(contentContainer).toHaveStyle({ justifyContent: 'flex-start' });
  });

  it('应该使用行布局和均匀分布渲染', () => {
    render(
      <View prop="" value="" direction="row" justify="evenly">
        <div data-testid="child">子元素</div>
      </View>,
    );

    // 检查子元素是否正确渲染
    expect(screen.getByTestId('child')).toBeInTheDocument();

    // 检查内容容器的样式是否正确
    const contentContainer = screen.getByTestId('child').parentElement;
    expect(contentContainer).toHaveStyle({ flexDirection: 'row' });
    expect(contentContainer).toHaveStyle({ justifyContent: 'space-evenly' });
  });

  it('应该能够渲染多个子元素', () => {
    render(
      <View prop="多元素视图" value="测试">
        <div data-testid="child-1">子元素1</div>
        <div data-testid="child-2">子元素2</div>
        <div data-testid="child-3">子元素3</div>
      </View>,
    );

    // 检查所有子元素是否正确渲染
    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
    expect(screen.getByTestId('child-3')).toBeInTheDocument();

    // 检查自定义属性是否正确应用
    expect(screen.getByText('多元素视图')).toBeInTheDocument();
    expect(screen.getByText('测试')).toBeInTheDocument();
  });

  it('应该正确渲染带有复杂子元素的视图', () => {
    render(
      <View prop="复杂视图" value="测试">
        <div data-testid="complex-child">
          <span>内部元素1</span>
          <span>内部元素2</span>
        </div>
      </View>,
    );

    // 检查复杂子元素是否正确渲染
    expect(screen.getByTestId('complex-child')).toBeInTheDocument();
    expect(screen.getByText('内部元素1')).toBeInTheDocument();
    expect(screen.getByText('内部元素2')).toBeInTheDocument();

    // 检查自定义属性是否正确应用
    expect(screen.getByText('复杂视图')).toBeInTheDocument();
    expect(screen.getByText('测试')).toBeInTheDocument();
  });
});
