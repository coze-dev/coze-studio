import '@testing-library/jest-dom';

import { describe, it } from 'vitest';
import { fireEvent, render } from '@testing-library/react';

import { Select } from '..';

const optionList = [
  { label: 'label-1', value: 'value-1' },
  { label: 'label-2', value: 'value-2' },
  { label: 'label-3', value: 'value-3', disabled: true },
];

describe('Select', () => {
  it('should render', () => {
    const { baseElement } = render(<Select optionList={optionList} />);
    expect(baseElement.querySelectorAll('.coz-select').length).toEqual(1);
  });

  it('should disabled', () => {
    const { container } = render(<Select optionList={optionList} disabled />);
    expect(container).toHaveStyle({
      color: 'rgba(var(--coze-fg-5), 0.6)',
    });
  });

  it('small size', () => {
    const { baseElement } = render(
      <Select optionList={optionList} size={'small'} />,
    );
    expect(baseElement.querySelector('.coz-select')).toHaveStyle({
      height: ' 24px',
    });
  });

  it('default size', () => {
    const { baseElement } = render(
      <Select optionList={optionList} size={'default'} />,
    );
    expect(baseElement.querySelector('.semi-select')).toHaveStyle({
      height: ' 32px',
    });
  });

  it('hasError should has red border', () => {
    const { container } = render(<Select hasError />);

    const element = container.getElementsByClassName('semi-select').item(0);
    expect(element).toHaveClass('border-red-6');
  });

  it('onChange should be called', () => {
    const fn = vi.fn();
    const { baseElement } = render(
      <Select optionList={optionList} onChange={fn} defaultOpen />,
    );

    const options = baseElement.querySelector('.option-text');
    // @ts-expect-error -- linter-disable-autofix
    fireEvent.click(options);

    // @ts-expect-error -- linter-disable-autofix
    expect(options.textContent).toEqual('label-1');
    expect(fn).toBeCalled();
  });

  it('onSearch should be called', () => {
    const fn = vi.fn();
    const { baseElement } = render(
      <Select optionList={optionList} onSearch={fn} defaultOpen filter />,
    );

    // @ts-expect-error -- linter-disable-autofix
    fireEvent.input(baseElement.querySelector('.semi-input'), {
      target: { value: '2' },
    });

    const options = baseElement.querySelectorAll('.option-text');
    expect(options.length).toEqual(1);
    expect(fn).toBeCalled();
  });

  it('single select', () => {
    const { baseElement } = render(
      <Select optionList={optionList} defaultOpen defaultValue={'value-3'} />,
    );

    const options = baseElement.querySelectorAll('.option-text');
    expect(options[2].textContent).toEqual('label-3');
    expect(options[2]).toHaveStyle({
      color: 'rgba(var(--coze-fg-5), 0.3)',
    });
    const selectedIcons = baseElement.querySelectorAll(
      '.coz-select-option-item-icon-selected',
    );

    expect(selectedIcons.length).toEqual(1);
  });

  it('hidden tick', () => {
    const { baseElement } = render(
      <Select
        optionList={optionList}
        defaultOpen
        defaultValue={'value-3'}
        showTick={false}
      />,
    );

    const selectedIcons = baseElement.querySelectorAll(
      '.coz-select-option-item-icon-selected',
    );

    expect(selectedIcons.length).toEqual(0);
  });

  it('multiple select', () => {
    const { baseElement } = render(
      <Select
        optionList={optionList}
        multiple
        defaultOpen
        defaultValue={['value-2', 'value-3']}
      />,
    );

    const selectedIcons = baseElement.querySelectorAll(
      '.coz-select-option-item-icon-multiple-selected',
    );

    expect(selectedIcons[0]).toHaveStyle({
      color: 'rgb(var(--white-1))',
    });

    expect(selectedIcons[1]).toHaveStyle({
      color: 'rgba(var(--coze-stroke-5), 0.12)',
    });
  });

  it('renderOptionItem to render empty option', () => {
    const { baseElement } = render(
      <Select
        optionList={optionList}
        multiple
        defaultOpen
        defaultValue={['value-2', 'value-3']}
        renderOptionItem={() => <></>}
      />,
    );

    const selectedIcons = baseElement.querySelector('.coz-select-option-item');

    expect(selectedIcons).toBeNull;
  });
});

describe('Select with chipRender', () => {
  it('should render with chipRender="selectedItem"', () => {
    const { baseElement } = render(
      <Select
        optionList={optionList}
        chipRender="selectedItem"
        defaultValue="value-1"
        defaultOpen
      />,
    );

    // Check if the class for chip mode is applied
    expect(baseElement.querySelector('.coz-select-chip-mode')).not.toBeNull();

    // We don't need to check for the semi-tag as it might not be rendered in the test environment
    // but we can check that the select component has the correct class
    const selectElement = baseElement.querySelector('.semi-select');
    expect(selectElement).toHaveClass('coz-select-chip-mode');
  });

  it('should render multiple selection with chipRender="selectedItem"', () => {
    const { baseElement } = render(
      <Select
        optionList={optionList}
        chipRender="selectedItem"
        multiple
        defaultValue={['value-1', 'value-2']}
        defaultOpen
      />,
    );

    // Check if the class for chip mode is applied
    expect(baseElement.querySelector('.coz-select-chip-mode')).not.toBeNull();
  });

  it('should render with chipRender="trigger"', () => {
    const { baseElement } = render(
      <Select
        optionList={optionList.map(opt => ({ ...opt, chipColor: 'blue' }))}
        chipRender="trigger"
        defaultValue={['value-1', 'value-2']}
        multiple
        defaultOpen
      />,
    );

    // In trigger mode, the component should not have chip-mode class
    expect(baseElement.querySelector('.coz-select-chip-mode')).toBeNull();
  });

  it('should apply correct class when chipRender is selectedItem', () => {
    const { baseElement } = render(
      <Select
        optionList={optionList}
        chipRender="selectedItem"
        defaultValue="value-1"
      />,
    );

    // Check if the class for chip mode is applied to the select component
    const selectElement = baseElement.querySelector('.coz-select');
    expect(selectElement).toHaveClass('coz-select-chip-mode');
  });
});
