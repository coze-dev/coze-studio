import '@testing-library/jest-dom';
import { createRef, useState } from 'react';

import { describe, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { type Banner as SemiBanner } from '@/components/semi';
import { Button } from '@/components/button';

import { Banner, type BannerProps } from '..';

const bannerTypes: BannerProps['type'][] = [
  'info',
  'success',
  'warning',
  'danger',
];

// eslint-disable-next-line @typescript-eslint/naming-convention
function BannerClosed() {
  const [visible, setVisible] = useState(true);
  return (
    <>
      {visible ? (
        <div>
          <Banner
            fullMode={true}
            description={<div>This is a banner closed demo</div>}
          />
          <span
            className="text-brand-6 pl-2 cursor-pointer"
            onClick={() => {
              setVisible(!visible);
            }}
          >
            Don't Show Again
          </span>
        </div>
      ) : null}
    </>
  );
}

describe('Banner', () => {
  it('should forward ref', () => {
    const ref = createRef<SemiBanner>();
    render(<Banner ref={ref} />);
    expect(ref.current).not.toBeNull();
  });

  bannerTypes.forEach(item => {
    it(`should be renders for ${item} banner`, () => {
      const { container } = render(
        <Banner type={item} description="this is info banner" />,
      );
      const element = container.querySelector('.coz-banner');
      expect(element).toBeInTheDocument();
      expect(element).toHaveClass(`coz-banner-${item}`);
    });
  });

  it('should be closed', () => {
    const { container } = render(<BannerClosed />);
    const element = container.querySelector('.coz-banner');
    expect(element).toBeInTheDocument();
    fireEvent.click(screen.getByText("Don't Show Again"));
    const destroyNode = container.querySelector('.coz-banner');
    expect(destroyNode).not.toBeInTheDocument();
  });

  it('should render a card', () => {
    const { container } = render(
      <Banner
        card={true}
        fullMode={false}
        title="Title"
        type="info"
        bordered={false}
        description={
          <div>
            this is a card style
            <span className="text-brand-6 pl-2 cursor-pointer">
              Don't Show Again
            </span>
          </div>
        }
      >
        <div className="text-right px-12px my-12px">
          <Button>No, thanks.</Button>
        </div>
      </Banner>,
    );
    const element = container.querySelector('.coz-banner');
    expect(element).toBeInTheDocument();
    expect(element).toHaveClass('coz-banner-card');
    // @ts-expect-error -- linter-disable-autofix
    const bannerTitle = element.querySelector('.semi-banner-title');
    expect(bannerTitle).toBeInTheDocument();
  });
});
