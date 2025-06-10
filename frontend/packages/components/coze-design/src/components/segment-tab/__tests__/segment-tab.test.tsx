import { describe, it } from 'vitest';
import { render } from '@testing-library/react';

import { SegmentTab } from '..';

describe('SegmentTab', () => {
  it('should has className coz-segment-tab', () => {
    const { container } = render(<SegmentTab />);
    expect(container.getElementsByClassName('coz-segment-tab')).toHaveLength(1);
  });

  it('small size should has className coz-segment-tab-small', () => {
    const { container } = render(<SegmentTab size="small" />);
    expect(
      container.getElementsByClassName('coz-segment-tab-small'),
    ).toHaveLength(1);
  });
});
