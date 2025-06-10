import '@testing-library/jest-dom';
import { describe, it, vi } from 'vitest';
import { render } from '@testing-library/react';

import { Tag } from '..';

describe('Tag', () => {
  it('render correctly', () => {
    const { baseElement } = render(<Tag>tag</Tag>);
    const comp = baseElement.querySelector<HTMLDivElement>('.coz-tag');
    expect(comp).not.toBeNull();
  });

  it('prefix info render correctly', () => {
    const { baseElement } = render(<Tag prefixIcon="info">tag</Tag>);
    const comp = baseElement.querySelector<HTMLDivElement>(
      '.semi-tag-prefix-icon',
    );

    expect(comp).not.toBeNull();
  });

  it('prefix clock render correctly', () => {
    const { baseElement } = render(<Tag prefixIcon="clock">tag</Tag>);
    const comp = baseElement.querySelector<HTMLDivElement>(
      '.semi-tag-prefix-icon',
    );
    expect(comp).not.toBeNull();
  });

  it('prefix null render correctly', () => {
    const { baseElement } = render(<Tag prefixIcon={null}>tag</Tag>);
    const comp = baseElement.querySelector<HTMLDivElement>(
      '.semi-tag-prefix-icon',
    );
    expect(comp).toBeNull();
  });

  it('suffix cross render correctly', () => {
    const { baseElement } = render(<Tag suffixIcon="cross">tag</Tag>);
    const comp = baseElement.querySelector<HTMLDivElement>(
      '.semi-tag-suffix-icon',
    );
    expect(comp).not.toBeNull();
  });

  it('onlyIcon has pl-[5px] pr-[5px]', () => {
    const { container } = render(<Tag prefixIcon="info" />);
    const comp = container.querySelector('.coz-tag');
    expect(comp).toHaveClass(' !pl-[5px]');
    expect(comp).toHaveClass(' !pr-[5px]');
  });

  it('small size has className semi-tag-large', () => {
    const { container } = render(<Tag size={'small'} />);
    const comp = container.querySelector('.coz-tag');
    expect(comp).toHaveClass('semi-tag-large');
  });

  it('xs size has className h-mini ', () => {
    const { container } = render(<Tag size={'mini'} />);
    const comp = container.querySelector('.coz-tag');
    expect(comp).toHaveClass('h-mini');
  });

  it('prefix check icon render correctly', () => {
    const { baseElement } = render(<Tag prefixIcon="check">tag</Tag>);
    const comp = baseElement.querySelector<HTMLDivElement>(
      '.semi-tag-prefix-icon',
    );
    expect(comp).not.toBeNull();
  });

  it('loading state should override prefix icon', () => {
    const { baseElement } = render(
      <Tag prefixIcon="check" loading>
        tag
      </Tag>,
    );
    const loadingIcon =
      baseElement.querySelector<HTMLDivElement>('.coz-tag-loading');
    expect(loadingIcon).not.toBeNull();
  });

  it('loading state should disable click events', () => {
    const handleClick = vi.fn();
    const { container } = render(
      <Tag loading onClick={handleClick}>
        tag
      </Tag>,
    );
    const comp = container.querySelector('.coz-tag');
    expect(comp).not.toHaveClass('cursor-pointer');
  });
});
