import React from 'react';

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { FieldItem } from '../../../src/components/base-form-materials/field-item';

describe('FieldItem', () => {
  // 测试基本渲染
  it('should render title', () => {
    const title = 'Test Title';
    render(<FieldItem title={title} />);
    const titleElement = screen.getByText(title);
    expect(titleElement).toBeInTheDocument();
  });

  // 测试必填标记渲染
  it('should render required marker', () => {
    render(<FieldItem title="Test" required />);
    const requiredMarker = screen.getByText('*');
    expect(requiredMarker).toBeInTheDocument();
  });

  // 测试提示信息渲染
  it('should render tooltip', () => {
    const tooltipText = 'This is a tooltip';
    const el = render(<FieldItem title="Test" tooltip={tooltipText} />);
    const tooltipIcon = el.container.querySelector(
      '[data-content="This is a tooltip"]',
    );
    expect(tooltipIcon).toBeInTheDocument();
  });

  // 测试标签渲染
  it('should render tag', () => {
    const tagText = 'New';
    render(<FieldItem title="Test" tag={tagText} />);
    const tagElement = screen.getByText(tagText);
    expect(tagElement).toBeInTheDocument();
  });

  // 测试描述信息渲染
  it('should render description', () => {
    const descriptionText = 'This is a description';
    render(<FieldItem title="Test" description={descriptionText} />);
    const descriptionElement = screen.getByText(descriptionText);
    expect(descriptionElement).toBeInTheDocument();
  });

  // 测试反馈信息渲染
  it('should render feedback', () => {
    const feedbackText = 'This is a feedback';
    render(<FieldItem title="Test" feedback={feedbackText} />);
    const feedbackElement = screen.getByText(feedbackText);
    expect(feedbackElement).toBeInTheDocument();
  });

  // 测试子元素渲染
  it('should render children', () => {
    const childText = 'Child Content';
    render(<FieldItem title="Test">{childText}</FieldItem>);
    const childElement = screen.getByText(childText);
    expect(childElement).toBeInTheDocument();
  });
});
