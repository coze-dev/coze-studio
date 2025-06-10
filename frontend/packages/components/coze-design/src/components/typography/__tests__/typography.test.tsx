import '@testing-library/jest-dom';
import { isValidElement, type ReactNode } from 'react';

import { describe, it } from 'vitest';
import { render, renderHook, screen } from '@testing-library/react';

import { Tooltip } from '@/components/tooltip';
import { Popover } from '@/components/popover';

import { useRenderEllipsis } from '../use-ellipsis';
import type { Ellipsis } from '../typography-types';
import { Typography } from '..';

interface ShowTooltipResult {
  renderTooltip: (
    content: typeof Tooltip | typeof Popover,
    children: ReactNode,
  ) => ReactNode;
}

const { Title, Text, Paragraph, Numeral } = Typography;

describe('Typography', () => {
  it('should has className coz-typography', () => {
    const { container } = render(<Typography>COZTitle</Typography>);
    expect(container.querySelector('article')).toHaveClass('coz-typography');
  });

  it('should has className coz-typography-title', () => {
    const { container } = render(<Title>COZTitle</Title>);
    expect(container.querySelector('h1')).toHaveClass('coz-title');
  });

  it('should has title with custom className ', () => {
    const { container } = render(
      <Title className="coz-fg-primary">COZTitle</Title>,
    );
    expect(container.querySelector('h1')).toHaveClass('coz-fg-primary');
  });

  it('should has className coz-title-size', () => {
    const { container } = render(
      <Title heading={2} fontSize="20px">
        COZTitle20
      </Title>,
    );
    expect(container.querySelector('h2')).toHaveClass('coz-title-20');
  });

  it('should has className coz-text-size', () => {
    const { container } = render(<Text fontSize="14px">COZText14</Text>);
    expect(container.querySelector('span')).toHaveClass('coz-text-14');
  });

  it('should has text with custom className', () => {
    const { container } = render(
      <Text className="coz-fg-primary">COZText14</Text>,
    );
    expect(container.querySelector('span')).toHaveClass('coz-fg-primary');
  });

  it('should has className coz-paragraph-size', () => {
    const { container } = render(
      <Paragraph fontSize="14px">COZParagraph14</Paragraph>,
    );
    expect(container.querySelector('p')).toHaveClass('coz-paragraph-14');
  });

  it('should has paragraph with custom className', () => {
    const { container } = render(
      <Paragraph className="coz-fg-primary">COZParagraph14</Paragraph>,
    );
    expect(container.querySelector('p')).toHaveClass('coz-fg-primary');
  });

  it('should has className coz-paragraph-size', () => {
    const { container } = render(
      <Numeral className="coz-fg-primary" precision={2}>
        <p>点赞量：1.6111e1 K</p>
      </Numeral>,
    );
    expect(container.querySelector('.semi-typography-normal')).toHaveClass(
      'coz-numeral',
    );
  });

  it('should return correct object when ellipsis is an object', () => {
    const ellipsis: Ellipsis = {
      rows: 2,
      showTooltip: {
        type: 'tooltip',
        opts: { content: 'Tooltip content' },
      },
    };
    const { result } = renderHook(() => useRenderEllipsis(ellipsis));
    expect(result.current).toEqual({
      rows: 2,
      showTooltip: {
        type: 'tooltip',
        opts: { content: 'Tooltip content' },
        renderTooltip: expect.any(Function),
      },
    });
  });

  it('should return ellipsis with default', async () => {
    render(
      <Paragraph fontSize="14px" ellipsis={true} style={{ width: 300 }}>
        COZParagraph
      </Paragraph>,
    );
    const paragraph = await screen.findByText('COZParagraph');
    expect(paragraph).toBeInTheDocument();
    expect(
      document.querySelector('.semi-typography-ellipsis'),
    ).toBeInTheDocument();
  });

  it('should render ellipsis when showTooltip is true', async () => {
    render(
      <Paragraph
        fontSize="14px"
        ellipsis={{
          showTooltip: true,
        }}
        style={{ width: 300 }}
      >
        COZParagraph
      </Paragraph>,
    );
    const paragraph = await screen.findByText('COZParagraph');
    expect(paragraph).toBeInTheDocument();
    expect(
      document.querySelector('.semi-typography-ellipsis'),
    ).toBeInTheDocument();
  });

  it('should render only ellipsis', async () => {
    render(
      <Paragraph
        fontSize="14px"
        ellipsis={{
          rows: 1,
        }}
        style={{ width: 300 }}
      >
        COZParagraph
      </Paragraph>,
    );
    const paragraph = await screen.findByText('COZParagraph');
    expect(paragraph).toBeInTheDocument();
    expect(
      document.querySelector('.semi-typography-ellipsis'),
    ).toBeInTheDocument();
  });

  it('should render Tooltip when type is tooltip', () => {
    const ellipsis: Ellipsis = {
      rows: 2,
      showTooltip: {
        type: 'tooltip',
        opts: { content: 'tooltip content' },
      },
    };
    render(
      <Text fontSize="14px" ellipsis={ellipsis} style={{ width: 300 }}>
        test tooltip content
      </Text>,
    );
    const { result } = renderHook(() => useRenderEllipsis(ellipsis));
    expect(result.current).toHaveProperty('showTooltip.renderTooltip');

    if (typeof result.current !== 'boolean' && result.current.showTooltip) {
      const { renderTooltip } = result.current
        .showTooltip as unknown as ShowTooltipResult;
      const tooltipComponent = renderTooltip(Tooltip, <div />);
      if (isValidElement(tooltipComponent)) {
        expect(tooltipComponent.type).toEqual(Tooltip);
      }
    }
  });

  it('should render Tooltip when type is popover', () => {
    const ellipsis: Ellipsis = {
      rows: 2,
      showTooltip: {
        type: 'popover',
      },
    };
    render(
      <Paragraph fontSize="14px" ellipsis={ellipsis} style={{ width: 300 }}>
        test popover content
      </Paragraph>,
    );
    const { result } = renderHook(() => useRenderEllipsis(ellipsis));
    expect(result.current).toHaveProperty('showTooltip.renderTooltip');

    if (typeof result.current !== 'boolean' && result.current.showTooltip) {
      const { renderTooltip } = result.current
        .showTooltip as unknown as ShowTooltipResult;
      const tooltipComponent = renderTooltip(Popover, <div />);
      if (isValidElement(tooltipComponent)) {
        expect(tooltipComponent.type).toEqual(Popover);
      }
    }
  });
});
