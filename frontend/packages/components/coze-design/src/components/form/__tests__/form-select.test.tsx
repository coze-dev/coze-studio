import '@testing-library/jest-dom';
import React from 'react';

import { describe, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { Form } from '@/index';

import { FormSelect } from '../select';

const optionList = [
  { label: 'label-1', value: 'value-1' },
  { label: 'label-2', value: 'value-2' },
  { label: 'label-3', value: 'value-3', disabled: true },
];

describe('FormSelect', () => {
  it('should render form select correctly', () => {
    render(
      <Form>
        <FormSelect field="select" optionList={optionList} />
      </Form>,
    );
    const comp = document.getElementsByClassName('coz-select');
    expect(comp).toHaveLength(1);
  });

  it('should render initial form value correctly', () => {
    render(
      <Form initValues={{ select: optionList[1].value }}>
        <FormSelect field="select" optionList={optionList} />
      </Form>,
    );
    expect(screen.getByText(optionList[1].label)).toBeInTheDocument();
  });
});
