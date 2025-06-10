import { describe, it } from 'vitest';
import { render } from '@testing-library/react';
import { IconCozConnectionCurve } from '@coze-arch/arco-icon';

import { SingleSelect } from '..';

describe('SingleSelect', () => {
  it('should has className coz-single-select', () => {
    const { container } = render(<SingleSelect />);
    expect(container.getElementsByClassName('coz-single-select')).toHaveLength(
      1,
    );
  });

  it('should has className coz-single-select-fill', () => {
    const { container } = render(<SingleSelect layout="fill" />);
    expect(
      container.getElementsByClassName('coz-single-select-fill'),
    ).toHaveLength(1);
  });

  it('should has className semi-radio-addon-buttonRadio-disabled with disabled', () => {
    const { container } = render(
      <SingleSelect disabled options={['1', '2', '3']} />,
    );
    expect(
      container.getElementsByClassName('semi-radio-addon-buttonRadio-disabled'),
    ).toHaveLength(3);
  });

  it('should has className related coz-single-select-label', () => {
    const { container } = render(
      <SingleSelect
        disabled
        defaultValue={'1'}
        options={[
          {
            value: '1',
            label: (
              <SingleSelect.SingleSelectLabel
                activeIcon={<IconCozConnectionCurve />}
                icon={<IconCozConnectionCurve />}
              />
            ),
          },
          {
            value: '2',
            label: (
              <SingleSelect.SingleSelectLabel
                text="1"
                icon={<IconCozConnectionCurve />}
              />
            ),
          },
        ]}
      />,
    );
    expect(
      container.getElementsByClassName('coz-single-select-label-icon-active'),
    ).toHaveLength(2);
    expect(
      container.getElementsByClassName('coz-single-select-label-icon-inactive'),
    ).toHaveLength(2);
    expect(
      container.getElementsByClassName('coz-single-select-label-text'),
    ).toHaveLength(1);
  });
});
